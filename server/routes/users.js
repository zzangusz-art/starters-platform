const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/me', authenticate, (req, res) => {
  const user = db.prepare('SELECT id, email, name, role, phone, bio, avatar, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
  res.json(user);
});

router.put('/me', authenticate, (req, res) => {
  const { name, phone, bio } = req.body;

  db.prepare(`
    UPDATE users SET
      name = COALESCE(?, name),
      phone = COALESCE(?, phone),
      bio = COALESCE(?, bio),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(name, phone, bio, req.user.id);

  res.json(db.prepare('SELECT id, email, name, role, phone, bio, avatar, created_at FROM users WHERE id = ?').get(req.user.id));
});

router.put('/me/password', authenticate, (req, res) => {
  const { current_password, new_password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

  if (!bcrypt.compareSync(current_password, user.password_hash)) {
    return res.status(401).json({ message: '현재 비밀번호가 올바르지 않습니다.' });
  }

  const hash = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hash, req.user.id);
  res.json({ message: '비밀번호가 변경되었습니다.' });
});

// 알림 조회
router.get('/notifications', authenticate, (req, res) => {
  const notifications = db.prepare(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20'
  ).all(req.user.id);
  res.json(notifications);
});

// 알림 읽음 처리
router.put('/notifications/:id/read', authenticate, (req, res) => {
  db.prepare('UPDATE notifications SET read_flag = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ message: '읽음 처리되었습니다.' });
});

// 알림 전체 읽음
router.put('/notifications/read-all', authenticate, (req, res) => {
  db.prepare('UPDATE notifications SET read_flag = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ message: '전체 읽음 처리되었습니다.' });
});

module.exports = router;
