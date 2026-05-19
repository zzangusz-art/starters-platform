const express = require('express');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// 인큐베이팅 프로그램 목록
router.get('/', authenticate, (req, res) => {
  const { role, id } = req.user;
  let programs;

  if (role === 'star_maker') {
    programs = db.prepare(`
      SELECT ip.*, f.name as franchise_name, f.category, f.image_url,
             u.name as owner_name, u.phone as owner_phone
      FROM incubating_programs ip
      JOIN franchises f ON ip.franchise_id = f.id
      JOIN users u ON f.owner_id = u.id
      WHERE ip.maker_id = ?
      ORDER BY ip.created_at DESC
    `).all(id);
  } else if (role === 'star_master') {
    programs = db.prepare(`
      SELECT ip.*, f.name as franchise_name, f.category,
             u.name as maker_name, u.email as maker_email, u.phone as maker_phone
      FROM incubating_programs ip
      JOIN franchises f ON ip.franchise_id = f.id
      JOIN users u ON ip.maker_id = u.id
      WHERE f.owner_id = ?
      ORDER BY ip.created_at DESC
    `).all(id);
  } else if (role === 'star_manager') {
    programs = db.prepare(`
      SELECT ip.*, f.name as franchise_name, f.category,
             u.name as maker_name, u.email as maker_email,
             own.name as owner_name
      FROM incubating_programs ip
      JOIN franchises f ON ip.franchise_id = f.id
      JOIN users u ON ip.maker_id = u.id
      JOIN users own ON f.owner_id = own.id
      ORDER BY ip.created_at DESC
    `).all();
  } else {
    return res.status(403).json({ message: '접근 권한이 없습니다.' });
  }

  res.json(programs);
});

// 프로그램 상세
router.get('/:id', authenticate, (req, res) => {
  const program = db.prepare(`
    SELECT ip.*, f.name as franchise_name, f.category, f.image_url, f.owner_id,
           u.name as maker_name, u.email as maker_email, u.phone as maker_phone,
           own.name as owner_name
    FROM incubating_programs ip
    JOIN franchises f ON ip.franchise_id = f.id
    JOIN users u ON ip.maker_id = u.id
    JOIN users own ON f.owner_id = own.id
    WHERE ip.id = ?
  `).get(req.params.id);

  if (!program) return res.status(404).json({ message: '프로그램을 찾을 수 없습니다.' });

  const milestones = db.prepare('SELECT * FROM milestones WHERE program_id = ? ORDER BY order_num').all(req.params.id);
  program.milestones = milestones;

  res.json(program);
});

// 프로그램 업데이트
router.put('/:id', authenticate, requireRole('star_master', 'star_manager'), (req, res) => {
  const { progress, status, notes } = req.body;

  db.prepare(`
    UPDATE incubating_programs
    SET progress = COALESCE(?, progress),
        status = COALESCE(?, status),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(progress, status, notes, req.params.id);

  res.json(db.prepare('SELECT * FROM incubating_programs WHERE id = ?').get(req.params.id));
});

// 마일스톤 목록
router.get('/:id/milestones', authenticate, (req, res) => {
  const milestones = db.prepare('SELECT * FROM milestones WHERE program_id = ? ORDER BY order_num').all(req.params.id);
  res.json(milestones);
});

// 마일스톤 추가
router.post('/:id/milestones', authenticate, requireRole('star_master', 'star_manager'), (req, res) => {
  const { title, description, target_date, order_num } = req.body;
  if (!title) return res.status(400).json({ message: '마일스톤 제목이 필요합니다.' });

  const result = db.prepare(
    'INSERT INTO milestones (program_id, title, description, target_date, order_num) VALUES (?, ?, ?, ?, ?)'
  ).run(req.params.id, title, description, target_date, order_num || 0);

  res.status(201).json(db.prepare('SELECT * FROM milestones WHERE id = ?').get(result.lastInsertRowid));
});

// 마일스톤 상태 업데이트
router.put('/milestones/:id', authenticate, (req, res) => {
  const { completed, title, description, target_date } = req.body;

  const completedAt = completed ? new Date().toISOString() : null;

  db.prepare(`
    UPDATE milestones
    SET completed = COALESCE(?, completed),
        completed_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END,
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        target_date = COALESCE(?, target_date)
    WHERE id = ?
  `).run(completed !== undefined ? (completed ? 1 : 0) : null, completed ? 1 : 0, title, description, target_date, req.params.id);

  res.json(db.prepare('SELECT * FROM milestones WHERE id = ?').get(req.params.id));
});

module.exports = router;
