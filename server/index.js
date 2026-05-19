const express = require('express');
const path = require('path');

require('./db'); // DB 초기화 및 시드 데이터

const app = express();
const PORT = process.env.PORT || 5000;
const IS_PROD = process.env.NODE_ENV === 'production';

// ── CORS 미들웨어 (cors 패키지 대신 커스텀) ─────────────────
// cors 패키지는 same-origin 요청의 Origin 헤더도 거부할 수 있어서
// 직접 구현: 같은 호스트 도메인 + localhost + file:// 모두 허용
const extraOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : [];

app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  const host   = req.headers.host   || '';

  const allowed =
    !origin ||                                      // Origin 헤더 없음 (서버간 요청)
    origin === 'null' ||                            // file:// 로컬 파일
    origin.startsWith('http://localhost') ||        // 로컬 개발
    origin === `https://${host}` ||                 // 같은 Railway 도메인 (same-origin)
    origin === `http://${host}`  ||
    extraOrigins.includes(origin);                  // ALLOWED_ORIGINS 환경변수

  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin',      origin || '*');
    res.setHeader('Access-Control-Allow-Methods',     'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers',     'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(allowed ? 204 : 403);
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API 라우트 ──────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/franchises',  require('./routes/franchises'));
app.use('/api/applications',require('./routes/applications'));
app.use('/api/incubating',  require('./routes/incubating'));
app.use('/api/users',       require('./routes/users'));
app.use('/api/admin',       require('./routes/admin'));

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', message: '스타터즈 서버 정상 작동 중', env: IS_PROD ? 'production' : 'development' })
);

// ── 프로덕션: 정적 파일 서빙 ────────────────────────────────
if (IS_PROD) {
  const clientDist    = path.join(__dirname, '../client/dist');
  const homepageFile  = path.join(__dirname, '../homepage.html');

  // 1) 루트(/) → 마케팅 홈페이지
  app.get('/', (req, res) => res.sendFile(homepageFile));

  // 2) React 빌드 정적 에셋 (JS, CSS, favicon …)
  //    index: false → '/'에서 index.html 자동 서빙 방지
  app.use(express.static(clientDist, { index: false }));

  // 3) SPA 폴백 — /login, /register, /master, /rookie … → React index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDist, 'index.html'));
    }
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 스타터즈 서버 실행 중 — 포트 ${PORT} (${IS_PROD ? 'production' : 'development'})\n`);
  if (!IS_PROD) {
    console.log('테스트 계정 (비밀번호: test1234)');
    console.log('  스타매니저: manager@starters.kr');
    console.log('  스타마스터: master1@starters.kr');
    console.log('  스타루키:   rookie1@starters.kr');
    console.log('  스타메이커: maker1@starters.kr\n');
  }
});
