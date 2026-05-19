import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const roleHome = { star_master: '/master', star_rookie: '/rookie', star_maker: '/maker', star_manager: '/manager' };

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(roleHome[user.role] || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const testAccounts = [
    { label: '스타매니저', email: 'manager@starters.kr', color: 'text-green-400' },
    { label: '스타마스터', email: 'master1@starters.kr', color: 'text-yellow-400' },
    { label: '스타루키', email: 'rookie1@starters.kr', color: 'text-blue-400' },
    { label: '스타메이커', email: 'maker1@starters.kr', color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-[#080808] flex">
      {/* Left */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#0a0a0a] to-[#0f1a0f] items-center justify-center p-12 border-r border-[#1a1a1a]">
        <div className="max-w-sm">
          <Link to="/" className="flex items-center gap-2.5 mb-12">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <span className="text-black font-black text-lg">S</span>
            </div>
            <span className="font-black text-white text-2xl tracking-tight">스타터즈</span>
          </Link>
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            프랜차이즈<br />창업의 시작
          </h2>
          <p className="text-gray-400 leading-relaxed">
            스타터즈에서 검증된 프랜차이즈를 탐색하고, 인큐베이팅 프로그램으로 성공 창업의 첫걸음을 내딛으세요.
          </p>
          <div className="mt-8 p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
            <p className="text-green-400 text-xs font-semibold mb-2">테스트 계정 (비밀번호: test1234)</p>
            <div className="space-y-1">
              {testAccounts.map(a => (
                <button
                  key={a.email}
                  onClick={() => setForm({ email: a.email, password: 'test1234' })}
                  className="w-full text-left text-xs text-gray-400 hover:text-white py-1 transition-colors"
                >
                  <span className={`font-semibold ${a.color}`}>{a.label}</span>: {a.email}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-black font-black text-sm">S</span>
              </div>
              <span className="font-black text-white text-xl">스타터즈</span>
            </Link>
          </div>

          <h1 className="text-3xl font-black text-white mb-2">로그인</h1>
          <p className="text-gray-500 mb-8">계정이 없으신가요? <Link to="/register" className="text-green-400 hover:underline">무료 가입</Link></p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">이메일</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="example@email.com"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">비밀번호</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="비밀번호 입력"
                className="input"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base disabled:opacity-50">
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
