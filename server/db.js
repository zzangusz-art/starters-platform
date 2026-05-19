const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

// Railway 볼륨 마운트 시 DB_PATH 환경변수 지정 (예: /data/starters.db)
// 미지정 시 서버 디렉터리 내 로컬 파일 사용
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'starters.db');

const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('star_master', 'star_rookie', 'star_maker', 'star_manager')),
    phone TEXT,
    bio TEXT,
    avatar TEXT,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS franchises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    business_description TEXT,
    investment_min INTEGER DEFAULT 0,
    investment_max INTEGER DEFAULT 0,
    royalty_rate REAL DEFAULT 0,
    location TEXT,
    requirements TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'pending')),
    incubating_available INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    franchise_id INTEGER NOT NULL,
    applicant_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewing', 'approved', 'rejected')),
    type TEXT DEFAULT 'regular' CHECK(type IN ('regular', 'incubating')),
    message TEXT,
    admin_note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (franchise_id) REFERENCES franchises(id),
    FOREIGN KEY (applicant_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS incubating_programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    franchise_id INTEGER NOT NULL,
    maker_id INTEGER NOT NULL,
    application_id INTEGER,
    start_date TEXT,
    end_date TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'paused')),
    progress INTEGER DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (franchise_id) REFERENCES franchises(id),
    FOREIGN KEY (maker_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_date TEXT,
    completed INTEGER DEFAULT 0,
    completed_at DATETIME,
    order_num INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES incubating_programs(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read_flag INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed initial data
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, name, role, phone, bio)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const pw = bcrypt.hashSync('test1234', 10);

  insertUser.run('manager@starters.kr', pw, '스타매니저', 'star_manager', '010-0000-0000', '스타터즈 관리자');
  insertUser.run('master1@starters.kr', pw, '김창업', 'star_master', '010-1111-2222', '10년 경력 외식업 가맹주');
  insertUser.run('master2@starters.kr', pw, '이프랜차이즈', 'star_master', '010-3333-4444', '뷰티/헬스 분야 전문 가맹주');
  insertUser.run('rookie1@starters.kr', pw, '박점주', 'star_rookie', '010-5555-6666', '창업 준비 중인 예비 점주');
  insertUser.run('rookie2@starters.kr', pw, '최도전', 'star_rookie', '010-7777-8888', '외식업 경험 3년, 독립 창업 희망');
  insertUser.run('maker1@starters.kr', pw, '정인큐', 'star_maker', '010-9999-0000', '인큐베이팅 프로그램 참여 중');

  const insertFranchise = db.prepare(`
    INSERT INTO franchises (owner_id, name, category, description, business_description, investment_min, investment_max, royalty_rate, location, requirements, incubating_available)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertFranchise.run(2, '버거스타', '외식/패스트푸드', '프리미엄 수제버거 프랜차이즈', '신선한 국내산 재료로 만든 프리미엄 수제버거 브랜드입니다. 독자적인 소스와 레시피로 차별화된 맛을 제공합니다.', 30000000, 60000000, 5.0, '전국', '창업 의지, 서비스 마인드', 1);
  insertFranchise.run(2, '커피포레스트', '카페/음료', '자연 친화적 스페셜티 카페', '엄선된 원두와 자연 친화적 인테리어로 차별화된 카페 경험을 제공합니다.', 50000000, 100000000, 4.5, '수도권, 광역시', '바리스타 자격증 또는 교육 이수', 1);
  insertFranchise.run(3, '핏라이프', '헬스/뷰티', '소형 피트니스 센터 프랜차이즈', '10평 이내의 소형 공간에서 운영 가능한 고효율 피트니스 브랜드입니다.', 20000000, 40000000, 6.0, '전국', '헬스 관련 자격증 보유 우대', 0);
  insertFranchise.run(3, '뷰티살롱 스타', '헬스/뷰티', '토탈 뷰티 케어 프랜차이즈', '헤어, 네일, 피부 관리를 한 곳에서 제공하는 원스톱 뷰티 살롱입니다.', 40000000, 80000000, 5.5, '수도권', '미용사 자격증 필수', 1);
  insertFranchise.run(2, '떡볶이왕국', '외식/분식', '전통 떡볶이 현대화 브랜드', '전통 레시피를 현대적으로 재해석한 프리미엄 분식 브랜드입니다.', 15000000, 30000000, 4.0, '전국', '없음', 1);

  const insertApp = db.prepare(`
    INSERT INTO applications (franchise_id, applicant_id, status, type, message)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertApp.run(1, 4, 'pending', 'regular', '버거스타 가맹 창업에 관심이 많습니다. 상담 요청드립니다.');
  insertApp.run(2, 4, 'reviewing', 'incubating', '인큐베이팅 프로그램으로 먼저 경험해보고 싶습니다.');
  insertApp.run(1, 5, 'approved', 'regular', '외식업 경험을 바탕으로 버거스타 창업을 희망합니다.');
  insertApp.run(4, 6, 'approved', 'incubating', '뷰티살롱 스타 인큐베이팅 신청합니다.');

  const insertProgram = db.prepare(`
    INSERT INTO incubating_programs (franchise_id, maker_id, application_id, start_date, end_date, status, progress, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertProgram.run(4, 6, 4, '2026-03-01', '2026-08-31', 'active', 45, '3개월차 진행 중, 매출 목표 70% 달성');

  const insertMilestone = db.prepare(`
    INSERT INTO milestones (program_id, title, description, target_date, completed, order_num)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertMilestone.run(1, '오리엔테이션 및 기본 교육', '본사 방문 교육 이수', '2026-03-15', 1, 1);
  insertMilestone.run(1, '매장 운영 실습', '실제 매장에서 2주간 실습', '2026-03-31', 1, 2);
  insertMilestone.run(1, '독립 운영 1개월', '독립적으로 매장 운영 시작', '2026-04-30', 1, 3);
  insertMilestone.run(1, '중간 평가', '매출 및 운영 능력 평가', '2026-05-31', 0, 4);
  insertMilestone.run(1, '정식 가맹 계약', '인큐베이팅 완료 후 정식 계약', '2026-08-31', 0, 5);

  console.log('시드 데이터 삽입 완료');
}

module.exports = db;
