const express = require('express');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// 공개: 프랜차이즈 목록 조회
router.get('/', (req, res) => {
  const { category, incubating, min, max, search, page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = ["f.status = 'active'"];
  const params = [];

  if (category) { where.push('f.category = ?'); params.push(category); }
  if (incubating === '1') { where.push('f.incubating_available = 1'); }
  if (min) { where.push('f.investment_max >= ?'); params.push(parseInt(min)); }
  if (max) { where.push('f.investment_min <= ?'); params.push(parseInt(max)); }
  if (search) { where.push('(f.name LIKE ? OR f.description LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const franchises = db.prepare(`
    SELECT f.*, u.name as owner_name,
    (SELECT COUNT(*) FROM applications a WHERE a.franchise_id = f.id) as application_count
    FROM franchises f
    JOIN users u ON f.owner_id = u.id
    ${whereStr}
    ORDER BY f.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  const total = db.prepare(`SELECT COUNT(*) as count FROM franchises f ${whereStr}`).get(...params);

  res.json({ franchises, total: total.count, page: parseInt(page), limit: parseInt(limit) });
});

// 공개: 단일 프랜차이즈 조회
router.get('/:id', (req, res) => {
  const franchise = db.prepare(`
    SELECT f.*, u.name as owner_name, u.phone as owner_phone, u.bio as owner_bio
    FROM franchises f
    JOIN users u ON f.owner_id = u.id
    WHERE f.id = ?
  `).get(req.params.id);

  if (!franchise) return res.status(404).json({ message: '프랜차이즈를 찾을 수 없습니다.' });

  db.prepare('UPDATE franchises SET view_count = view_count + 1 WHERE id = ?').run(req.params.id);

  res.json(franchise);
});

// 스타마스터: 내 프랜차이즈 목록
router.get('/my/list', authenticate, requireRole('star_master'), (req, res) => {
  const franchises = db.prepare(`
    SELECT f.*,
    (SELECT COUNT(*) FROM applications a WHERE a.franchise_id = f.id) as application_count,
    (SELECT COUNT(*) FROM applications a WHERE a.franchise_id = f.id AND a.status = 'pending') as pending_count
    FROM franchises f
    WHERE f.owner_id = ?
    ORDER BY f.created_at DESC
  `).all(req.user.id);
  res.json(franchises);
});

// 스타마스터: 프랜차이즈 등록
router.post('/', authenticate, requireRole('star_master'), (req, res) => {
  const { name, category, description, business_description, investment_min, investment_max, royalty_rate, location, requirements, incubating_available } = req.body;

  if (!name || !category) {
    return res.status(400).json({ message: '브랜드명과 카테고리는 필수입니다.' });
  }

  const result = db.prepare(`
    INSERT INTO franchises (owner_id, name, category, description, business_description, investment_min, investment_max, royalty_rate, location, requirements, incubating_available)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, name, category, description, business_description, investment_min || 0, investment_max || 0, royalty_rate || 0, location, requirements, incubating_available ? 1 : 0);

  const franchise = db.prepare('SELECT * FROM franchises WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(franchise);
});

// 스타마스터: 프랜차이즈 수정
router.put('/:id', authenticate, requireRole('star_master', 'star_manager'), (req, res) => {
  const franchise = db.prepare('SELECT * FROM franchises WHERE id = ?').get(req.params.id);
  if (!franchise) return res.status(404).json({ message: '프랜차이즈를 찾을 수 없습니다.' });

  if (req.user.role === 'star_master' && franchise.owner_id !== req.user.id) {
    return res.status(403).json({ message: '수정 권한이 없습니다.' });
  }

  const { name, category, description, business_description, investment_min, investment_max, royalty_rate, location, requirements, incubating_available, status } = req.body;

  db.prepare(`
    UPDATE franchises SET
      name = COALESCE(?, name),
      category = COALESCE(?, category),
      description = COALESCE(?, description),
      business_description = COALESCE(?, business_description),
      investment_min = COALESCE(?, investment_min),
      investment_max = COALESCE(?, investment_max),
      royalty_rate = COALESCE(?, royalty_rate),
      location = COALESCE(?, location),
      requirements = COALESCE(?, requirements),
      incubating_available = COALESCE(?, incubating_available),
      status = COALESCE(?, status),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(name, category, description, business_description, investment_min, investment_max, royalty_rate, location, requirements, incubating_available !== undefined ? (incubating_available ? 1 : 0) : null, status, req.params.id);

  res.json(db.prepare('SELECT * FROM franchises WHERE id = ?').get(req.params.id));
});

// 스타마스터: 프랜차이즈 삭제
router.delete('/:id', authenticate, requireRole('star_master', 'star_manager'), (req, res) => {
  const franchise = db.prepare('SELECT * FROM franchises WHERE id = ?').get(req.params.id);
  if (!franchise) return res.status(404).json({ message: '프랜차이즈를 찾을 수 없습니다.' });

  if (req.user.role === 'star_master' && franchise.owner_id !== req.user.id) {
    return res.status(403).json({ message: '삭제 권한이 없습니다.' });
  }

  db.prepare('DELETE FROM franchises WHERE id = ?').run(req.params.id);
  res.json({ message: '삭제되었습니다.' });
});

module.exports = router;
