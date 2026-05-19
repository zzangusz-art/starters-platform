const express = require('express');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// 신청 목록 (역할별 필터)
router.get('/', authenticate, (req, res) => {
  const { role, id } = req.user;
  let applications;

  if (role === 'star_master') {
    // 내 프랜차이즈에 들어온 신청
    applications = db.prepare(`
      SELECT a.*, f.name as franchise_name, f.category,
             u.name as applicant_name, u.email as applicant_email, u.phone as applicant_phone
      FROM applications a
      JOIN franchises f ON a.franchise_id = f.id
      JOIN users u ON a.applicant_id = u.id
      WHERE f.owner_id = ?
      ORDER BY a.created_at DESC
    `).all(id);
  } else if (role === 'star_rookie' || role === 'star_maker') {
    // 내가 신청한 것들
    applications = db.prepare(`
      SELECT a.*, f.name as franchise_name, f.category, f.image_url,
             u.name as owner_name
      FROM applications a
      JOIN franchises f ON a.franchise_id = f.id
      JOIN users u ON f.owner_id = u.id
      WHERE a.applicant_id = ?
      ORDER BY a.created_at DESC
    `).all(id);
  } else if (role === 'star_manager') {
    // 전체 신청
    applications = db.prepare(`
      SELECT a.*, f.name as franchise_name, f.category,
             u.name as applicant_name, u.email as applicant_email,
             own.name as owner_name
      FROM applications a
      JOIN franchises f ON a.franchise_id = f.id
      JOIN users u ON a.applicant_id = u.id
      JOIN users own ON f.owner_id = own.id
      ORDER BY a.created_at DESC
    `).all();
  }

  res.json(applications);
});

// 신청 상세
router.get('/:id', authenticate, (req, res) => {
  const application = db.prepare(`
    SELECT a.*, f.name as franchise_name, f.category, f.owner_id,
           u.name as applicant_name, u.email as applicant_email, u.phone as applicant_phone
    FROM applications a
    JOIN franchises f ON a.franchise_id = f.id
    JOIN users u ON a.applicant_id = u.id
    WHERE a.id = ?
  `).get(req.params.id);

  if (!application) return res.status(404).json({ message: '신청서를 찾을 수 없습니다.' });

  // 접근 권한 확인
  const isApplicant = application.applicant_id === req.user.id;
  const isOwner = application.owner_id === req.user.id;
  const isManager = req.user.role === 'star_manager';

  if (!isApplicant && !isOwner && !isManager) {
    return res.status(403).json({ message: '접근 권한이 없습니다.' });
  }

  res.json(application);
});

// 신청 제출 (스타루키, 스타메이커)
router.post('/', authenticate, requireRole('star_rookie', 'star_maker'), (req, res) => {
  const { franchise_id, type, message } = req.body;

  if (!franchise_id) return res.status(400).json({ message: '프랜차이즈 ID가 필요합니다.' });

  const franchise = db.prepare("SELECT * FROM franchises WHERE id = ? AND status = 'active'").get(franchise_id);
  if (!franchise) return res.status(404).json({ message: '프랜차이즈를 찾을 수 없습니다.' });

  if (type === 'incubating' && !franchise.incubating_available) {
    return res.status(400).json({ message: '해당 프랜차이즈는 인큐베이팅 프로그램을 운영하지 않습니다.' });
  }

  const existing = db.prepare(
    "SELECT id FROM applications WHERE franchise_id = ? AND applicant_id = ? AND status NOT IN ('rejected')"
  ).get(franchise_id, req.user.id);
  if (existing) return res.status(409).json({ message: '이미 신청한 프랜차이즈입니다.' });

  const result = db.prepare(
    'INSERT INTO applications (franchise_id, applicant_id, type, message) VALUES (?, ?, ?, ?)'
  ).run(franchise_id, req.user.id, type || 'regular', message || null);

  // 가맹주에게 알림
  db.prepare(
    'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)'
  ).run(franchise.owner_id, '새 가맹 신청', `${franchise.name}에 새로운 ${type === 'incubating' ? '인큐베이팅' : '가맹'} 신청이 도착했습니다.`, 'application');

  res.status(201).json(db.prepare('SELECT * FROM applications WHERE id = ?').get(result.lastInsertRowid));
});

// 신청 상태 변경 (스타마스터, 스타매니저)
router.put('/:id/status', authenticate, requireRole('star_master', 'star_manager'), (req, res) => {
  const { status, admin_note } = req.body;
  const validStatuses = ['pending', 'reviewing', 'approved', 'rejected'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: '유효하지 않은 상태입니다.' });
  }

  const application = db.prepare(`
    SELECT a.*, f.owner_id, f.name as franchise_name, f.id as fid
    FROM applications a
    JOIN franchises f ON a.franchise_id = f.id
    WHERE a.id = ?
  `).get(req.params.id);

  if (!application) return res.status(404).json({ message: '신청서를 찾을 수 없습니다.' });

  if (req.user.role === 'star_master' && application.owner_id !== req.user.id) {
    return res.status(403).json({ message: '권한이 없습니다.' });
  }

  db.prepare(
    'UPDATE applications SET status = ?, admin_note = COALESCE(?, admin_note), updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(status, admin_note || null, req.params.id);

  // 신청자에게 알림
  const statusLabels = { reviewing: '검토 중', approved: '승인됨', rejected: '거절됨' };
  if (statusLabels[status]) {
    db.prepare(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)'
    ).run(application.applicant_id, '신청 상태 변경', `${application.franchise_name} 신청이 '${statusLabels[status]}' 상태로 변경되었습니다.`, 'status');
  }

  // 승인 시 인큐베이팅 프로그램 자동 생성
  if (status === 'approved' && application.type === 'incubating') {
    const existing = db.prepare('SELECT id FROM incubating_programs WHERE application_id = ?').get(req.params.id);
    if (!existing) {
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      db.prepare(
        'INSERT INTO incubating_programs (franchise_id, maker_id, application_id, start_date, end_date) VALUES (?, ?, ?, ?, ?)'
      ).run(application.franchise_id, application.applicant_id, req.params.id, startDate, endDate);
    }
  }

  res.json(db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id));
});

module.exports = router;
