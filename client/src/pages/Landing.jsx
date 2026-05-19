import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const roles = [
  {
    key: 'star_master',
    name: '스타마스터',
    sub: '가맹주',
    desc: '브랜드를 보유한 가맹주. 프랜차이즈를 등록하고 스타루키 & 스타메이커를 모집합니다.',
    icon: '👑',
    color: 'from-yellow-500/20 to-transparent border-yellow-500/30',
    tag: 'text-yellow-400',
  },
  {
    key: 'star_rookie',
    name: '스타루키',
    sub: '예비 점주',
    desc: '창업을 준비하는 예비 점주. 원하는 프랜차이즈를 탐색하고 가맹을 신청합니다.',
    icon: '⭐',
    color: 'from-blue-500/20 to-transparent border-blue-500/30',
    tag: 'text-blue-400',
  },
  {
    key: 'star_maker',
    name: '스타메이커',
    sub: '인큐베이팅 점주',
    desc: '정식 계약 전 인큐베이팅 프로그램으로 실전 창업을 경험하는 점주입니다.',
    icon: '🚀',
    color: 'from-purple-500/20 to-transparent border-purple-500/30',
    tag: 'text-purple-400',
  },
  {
    key: 'star_manager',
    name: '스타매니저',
    sub: '관리자',
    desc: '플랫폼 전반을 관리하고 가맹주와 점주를 연결하는 플랫폼 운영자입니다.',
    icon: '🛡️',
    color: 'from-green-500/20 to-transparent border-green-500/30',
    tag: 'text-green-400',
  },
];

const features = [
  { icon: '🔍', title: '스마트 매칭', desc: '투자 규모, 지역, 카테고리 기반으로 최적의 프랜차이즈를 추천받으세요.' },
  { icon: '🌱', title: '인큐베이팅 프로그램', desc: '정식 계약 전 실제 운영을 경험하며 리스크를 최소화하세요.' },
  { icon: '📊', title: '투명한 정보', desc: '창업비용, 로열티, 수익 현황 등 핵심 정보를 한눈에 확인하세요.' },
  { icon: '🤝', title: '전담 지원', desc: '계약부터 오픈까지 스타매니저가 전 과정을 지원합니다.' },
];

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const roleHome = { star_master: '/master', star_rookie: '/rookie', star_maker: '/maker', star_manager: '/manager' };

  // 홈페이지.html 에서 #token= 으로 넘어온 경우 로그인 완료 후 자동 대시보드 이동
  useEffect(() => {
    if (!loading && user) {
      navigate(roleHome[user.role] || '/dashboard', { replace: true });
    }
  }, [user, loading]);

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080808]/80 backdrop-blur-xl border-b border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-sm">S</span>
            </div>
            <span className="font-black text-white text-xl tracking-tight">스타터즈</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to={roleHome[user.role] || '/dashboard'} className="btn-primary text-sm py-2 px-4">
                대시보드 →
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">로그인</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">무료 가입</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(34,197,94,0.12)_0%,transparent_60%)]" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            프랜차이즈 인큐베이팅 & 매칭 플랫폼
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
            당신의 창업,<br />
            <span className="text-gradient">스타터즈</span>와 함께
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            검증된 프랜차이즈를 탐색하고, 인큐베이팅 프로그램으로 리스크 없이 시작하세요.
            가맹주와 점주를 연결하는 스마트 플랫폼입니다.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register" className="btn-primary text-base px-8 py-3 glow-green">
              지금 시작하기 →
            </Link>
            <Link to="/login" className="btn-outline text-base px-8 py-3">
              로그인
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { n: '50+', label: '프랜차이즈 브랜드' },
              { n: '200+', label: '예비 창업자' },
              { n: '92%', label: '인큐베이팅 졸업률' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-black text-white">{s.n}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">역할 소개</h2>
            <p className="text-gray-500">스타터즈는 4가지 역할로 운영됩니다</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map(r => (
              <div key={r.key} className={`card border bg-gradient-to-b ${r.color} p-6 flex flex-col gap-3`}>
                <div className="text-3xl">{r.icon}</div>
                <div>
                  <span className={`text-xs font-semibold ${r.tag}`}>{r.sub}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{r.name}</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">{r.desc}</p>
                <Link to={`/register?role=${r.key}`} className={`text-xs font-semibold ${r.tag} hover:underline`}>
                  {r.name}으로 가입하기 →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">스타터즈의 차별점</h2>
            <p className="text-gray-500">성공 창업을 위한 모든 것을 제공합니다</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(f => (
              <div key={f.title} className="card p-6">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center card border-green-500/20 glow-green-sm p-12">
          <h2 className="text-3xl font-black text-white mb-4">지금 바로 시작하세요</h2>
          <p className="text-gray-400 mb-8">무료 가입 후 수십 개의 프랜차이즈를 탐색해보세요.</p>
          <Link to="/register" className="btn-primary text-base px-10 py-3 glow-green">
            무료로 시작하기 →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-8 px-6 text-center text-gray-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
            <span className="text-black font-black text-xs">S</span>
          </div>
          <span className="text-white font-bold">스타터즈</span>
        </div>
        <p>© 2026 Starters. 프랜차이즈 인큐베이팅 & 매칭 플랫폼</p>
      </footer>
    </div>
  );
};

export default Landing;
