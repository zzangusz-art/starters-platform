const express = require('express');
const cors = require('cors');
const path = require('path');

require('./db'); // DB 초기화 및 시드 데이터

const app = express();
const PORT = process.env.PORT || 5000;
const IS_PROD = process.env.NODE_ENV === 'production';

// CORS 설정 — 환경변수로 추가 허용 도메인 지정 가능
// Railway 배포 시: ALLOWED_ORIGINS=https://your-app.railway.app
const extraOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : [];

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...extraOrigins,
];

app.use(cors({
  origin: (origin, cb) => {
    // 프로덕션(단일 서비스)에서는 same-origin 요청이라 origin이 없음
    // file:// 페이지는 origin === 'null'(문자열)
    if (!origin || origin === 'null' || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API 라우트 ──────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/franchises', require('./routes/franchises'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/incubating', require('./routes/incubating'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', message: '스타터즈 서버 정상 작동 중', env: IS_PROD ? 'production' : 'development' })
);

// ── 프로덕션: 정적 파일 서빙 ──────────────────────────────
if (IS_PROD) {
  const clientDist = path.join(__dirname, '../client/dist');
  const homepageFile = path.join(__dirname, '../홈페이지.html');

  // 1) 루트(/) → 마케팅 홈페이지
  app.get('/', (req, res) => res.sendFile(homepageFile));

  // 2) React 빌드 정적 에셋 (JS, CSS, images 등)
  //    index: false → '/'에서 index.html 자동 서빙 방지
  app.use(express.static(clientDist, { index: false }));

  // 3) SPA 라우팅 — /login, /register, /master, /rookie … 모두 React index.html
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
