import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const roles = [
  { key: 'star_master', label: '스타마스터', sub: '가맹주', icon: '👑', desc: '프랜차이즈를 보유하고 점주를 모집합니다', color: 'border-yellow-500/40 bg-yellow-500/5', active: 'border-yellow-500 bg-yellow-500/10', tag: 'text-yellow-400' },
  { key: 'star_rookie', label: '스타루키', sub: '예비 점주', icon: '⭐', desc: '창업할 프랜차이즈를 탐색하고 신청합니다', color: 'border-blue-500/40 bg-blue-500/5', active: 'border-blue-500 bg-blue-500/10', tag: 'text-blue-400' },
  { key: 'star_maker', label: '스타메이커', sub: '인큐베이팅 점주', icon: '🚀', desc: '인큐베이팅 프로그램으로 실전 창업을 경험합니다', color: 'border-purple-500/40 bg-purple-500/5', active: 'border-purple-500 bg-purple-500/10', tag: 'text-purple-400' },
  { key: 'star_manager', label: '스타매니저', sub: '관리자', icon: '🛡️', desc: '플랫폼 전반을 관리하는 운영자입니다', color: 'border-green-500/40 bg-green-500/5', active: 'border-green-500 bg-green-500/10', tag: 'text-green-400' },
];

const roleHome = { star_master: '/master', star_rookie: '/rookie', star_maker: '/maker', star_manager: '/manager' };

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ role: params.get('role') || '', name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role) { setError('역할을 선택해주세요.'); return; }
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      navigate(roleHome[user.role] || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || '가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-sm">S</span>
            </div>
            <span className="font-black text-white text-xl">스타터즈</span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">회원가입</h1>
          <p className="text-gray-500">이미 계정이 있으신가요? <Link to="/login" className="text-green-400 hover:underline">로그인</Link></p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          {['역할 선택', '정보 입력'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${step > i + 1 ? 'bg-green-500 border-green-500 text-black' : step === i + 1 ? 'border-green-500 text-green-400' : 'border-[#2a2a2a] text-gray-600'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-sm ${step === i + 1 ? 'text-white font-medium' : 'text-gray-600'}`}>{s}</span>
              {i === 0 && <div className="w-8 h-px bg-[#2a2a2a] mx-1" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="text-gray-400 text-center mb-6">어떤 역할로 참여하시겠습니까?</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {roles.map(r => (
                <button
                  key={r.key}
                  onClick={() => setForm(p => ({ ...p, role: r.key }))}
                  className={`border rounded-xl p-5 text-left transition-all duration-150 ${form.role === r.key ? r.active : r.color} hover:border-opacity-80`}
                >
                  <div className="text-2xl mb-2">{r.icon}</div>
                  <div className={`text-xs font-semibold mb-0.5 ${r.tag}`}>{r.sub}</div>
                  <div className="text-white font-bold text-sm mb-1">{r.label}</div>
                  <div className="text-gray-500 text-xs">{r.desc}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => { if (!form.role) { setError('역할을 선택해주세요.'); return; } setError(''); setStep(2); }}
              className="btn-primary w-full justify-center py-3"
            >
              다음 →
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">이름 *</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="홍길동" className="input" required />
              </div>
              <div>
                <label className="label">연락처</label>
                <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="010-0000-0000" className="input" />
              </div>
            </div>
            <div>
              <label className="label">이메일 *</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="example@email.com" className="input" required />
            </div>
            <div>
              <label className="label">비밀번호 *</label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="8자 이상" className="input" required minLength={6} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(1)} className="btn-ghost flex-1 justify-center py-3">← 이전</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3 disabled:opacity-50">
                {loading ? '가입 중...' : '가입 완료'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
