const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/register', (req, res) => {
  const { email, password, name, role, phone } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ message: '필수 항목을 모두 입력해주세요.' });
  }

  const validRoles = ['star_master', 'star_rookie', 'star_maker', 'star_manager'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: '유효하지 않은 역할입니다.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });
  }

  const password_hash = bcrypt.hashSync(password, 10);

  const result = db.prepare(
    'INSERT INTO users (email, password_hash, name, role, phone) VALUES (?, ?, ?, ?, ?)'
  ).run(email, password_hash, name, role, phone || null);

  const user = db.prepare('SELECT id, email, name, role, phone, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({ token, user });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ? AND active = 1').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password_hash, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

router.get('/me', authenticate, (req, res) => {
  const user = db.prepare('SELECT id, email, name, role, phone, bio, avatar, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
  res.json(user);
});

module.exports = router;
