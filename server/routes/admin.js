const express = require('express');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requireRole('star_manager'));

// 대시보드 통계
router.get('/stats', (req, res) => {
  const stats = {
    total_users: db.prepare('SELECT COUNT(*) as c FROM users').get().c,
    total_franchises: db.prepare('SELECT COUNT(*) as c FROM franchises').get().c,
    active_franchises: db.prepare("SELECT COUNT(*) as c FROM franchises WHERE status = 'active'").get().c,
    total_applications: db.prepare('SELECT COUNT(*) as c FROM applications').get().c,
    pending_applications: db.prepare("SELECT COUNT(*) as c FROM applications WHERE status = 'pending'").get().c,
    active_programs: db.prepare("SELECT COUNT(*) as c FROM incubating_programs WHERE status = 'active'").get().c,
    star_masters: db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'star_master'").get().c,
    star_rookies: db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'star_rookie'").get().c,
    star_makers: db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'star_maker'").get().c,
  };

  const recentApplications = db.prepare(`
    SELECT a.id, a.status, a.type, a.created_at,
           f.name as franchise_name, u.name as applicant_name
    FROM applications a
    JOIN franchises f ON a.franchise_id = f.id
    JOIN users u ON a.applicant_id = u.id
    ORDER BY a.created_at DESC LIMIT 5
  `).all();

  const recentUsers = db.prepare(
    'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5'
  ).all();

  res.json({ stats, recentApplications, recentUsers });
});

// 사용자 목록
router.get('/users', (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = [];
  const params = [];

  if (role) { where.push('role = ?'); params.push(role); }
  if (search) { where.push('(name LIKE ? OR email LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const users = db.prepare(`SELECT id, email, name, role, phone, bio, active, created_at FROM users ${whereStr} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, parseInt(limit), offset);
  const total = db.prepare(`SELECT COUNT(*) as count FROM users ${whereStr}`).get(...params);

  res.json({ users, total: total.count });
});

// 사용자 수정
router.put('/users/:id', (req, res) => {
  const { name, role, active, phone } = req.body;
  db.prepare(`
    UPDATE users SET
      name = COALESCE(?, name),
      role = COALESCE(?, role),
      active = COALESCE(?, active),
      phone = COALESCE(?, phone),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(name, role, active !== undefined ? active : null, phone, req.params.id);

  res.json(db.prepare('SELECT id, email, name, role, phone, active, created_at FROM users WHERE id = ?').get(req.params.id));
});

// 프랜차이즈 전체 목록
router.get('/franchises', (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const where = status ? 'WHERE f.status = ?' : '';
  const params = status ? [status] : [];

  const franchises = db.prepare(`
    SELECT f.*, u.name as owner_name,
    (SELECT COUNT(*) FROM applications a WHERE a.franchise_id = f.id) as application_count
    FROM franchises f JOIN users u ON f.owner_id = u.id
    ${where} ORDER BY f.created_at DESC LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  const total = db.prepare(`SELECT COUNT(*) as count FROM franchises f ${where}`).get(...params);
  res.json({ franchises, total: total.count });
});

// 신청 전체 목록
router.get('/applications', (req, res) => {
  const { status, type, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = [];
  const params = [];
  if (status) { where.push('a.status = ?'); params.push(status); }
  if (type) { where.push('a.type = ?'); params.push(type); }

  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const applications = db.prepare(`
    SELECT a.*, f.name as franchise_name, f.category,
           u.name as applicant_name, u.email as applicant_email,
           own.name as owner_name
    FROM applications a
    JOIN franchises f ON a.franchise_id = f.id
    JOIN users u ON a.applicant_id = u.id
    JOIN users own ON f.owner_id = own.id
    ${whereStr} ORDER BY a.created_at DESC LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  const total = db.prepare(`SELECT COUNT(*) as count FROM applications a ${whereStr}`).get(...params);
  res.json({ applications, total: total.count });
});

module.exports = router;
