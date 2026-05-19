import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api';

const categories = ['전체', '외식/패스트푸드', '외식/분식', '카페/음료', '헬스/뷰티', '교육', '유통/서비스'];
const formatMoney = (n) => n ? (n >= 100000000 ? `${(n/100000000).toFixed(0)}억` : `${(n/10000).toFixed(0)}만원`) : '-';

const Browse = () => {
  const [franchises, setFranchises] = useState([]);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState('전체');
  const [incubating, setIncubating] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [applyForm, setApplyForm] = useState({ type: 'regular', message: '' });
  const [applyMsg, setApplyMsg] = useState('');

  const fetchFranchises = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== '전체') params.set('category', category);
    if (incubating) params.set('incubating', '1');
    if (search) params.set('search', search);
    params.set('limit', '20');
    const res = await api.get(`/franchises?${params}`);
    setFranchises(res.data.franchises);
    setTotal(res.data.total);
    setLoading(false);
  };

  useEffect(() => { fetchFranchises(); }, [category, incubating]);

  const handleSearch = (e) => { e.preventDefault(); fetchFranchises(); };

  const handleApply = async () => {
    setApplyMsg('');
    try {
      await api.post('/applications', { franchise_id: applying.id, ...applyForm });
      setApplyMsg('success');
      setTimeout(() => { setApplying(null); setApplyMsg(''); }, 1500);
    } catch (err) {
      setApplyMsg(err.response?.data?.message || '신청에 실패했습니다.');
    }
  };

  return (
    <Layout title="프랜차이즈 탐색" subtitle={`총 ${total}개의 프랜차이즈`}>
      {/* Search & Filter */}
      <div className="mb-6 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="브랜드명 검색..." className="input flex-1" />
          <button type="submit" className="btn-primary px-6">검색</button>
        </form>
        <div className="flex items-center gap-3 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${category === c ? 'bg-green-500 text-black' : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-[#2a2a2a]'}`}>
              {c}
            </button>
          ))}
          <button onClick={() => setIncubating(p => !p)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all border ${incubating ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' : 'bg-[#1a1a1a] text-gray-400 border-[#2a2a2a] hover:text-white'}`}>
            🚀 인큐베이팅만
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">불러오는 중...</div>
      ) : franchises.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-gray-500">조건에 맞는 프랜차이즈가 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {franchises.map(f => (
            <div key={f.id} className="card-hover group flex flex-col" onClick={() => { setApplying(f); setApplyForm({ type: 'regular', message: '' }); setApplyMsg(''); }}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white group-hover:text-green-400 transition-colors truncate">{f.name}</h3>
                  <p className="text-gray-500 text-xs mt-0.5">{f.owner_name}</p>
                </div>
                <span className="shrink-0 text-xs px-2 py-1 rounded-md bg-[#0f0f0f] text-gray-400">{f.category}</span>
              </div>
              <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-2">{f.description || '설명 없음'}</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-[#0f0f0f] rounded-lg p-2.5">
                  <p className="text-[10px] text-gray-600">창업비용</p>
                  <p className="text-xs font-semibold text-white mt-0.5">{formatMoney(f.investment_min)} ~ {formatMoney(f.investment_max)}</p>
                </div>
                <div className="bg-[#0f0f0f] rounded-lg p-2.5">
                  <p className="text-[10px] text-gray-600">로열티</p>
                  <p className="text-xs font-semibold text-white mt-0.5">{f.royalty_rate || 0}%</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                {f.incubating_available === 1 ? <span className="badge-green text-[10px]">인큐베이팅 가능</span> : <span />}
                <span className="text-xs text-green-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">신청하기 →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      {applying && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-white text-lg mb-1">가맹 신청</h3>
            <p className="text-gray-400 text-sm mb-5">{applying.name}</p>

            {applyMsg === 'success' ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">✅</p>
                <p className="text-green-400 font-semibold">신청이 완료되었습니다!</p>
              </div>
            ) : (
              <>
                {applyMsg && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm mb-4">{applyMsg}</div>}

                <div className="mb-4">
                  <label className="label">신청 유형</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setApplyForm(p => ({ ...p, type: 'regular' }))}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${applyForm.type === 'regular' ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]'}`}
                    >
                      ⭐ 정식 가맹
                    </button>
                    <button
                      onClick={() => setApplyForm(p => ({ ...p, type: 'incubating' }))}
                      disabled={applying.incubating_available !== 1}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed ${applyForm.type === 'incubating' ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]'}`}
                    >
                      🚀 인큐베이팅
                    </button>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="label">신청 메시지 (선택)</label>
                  <textarea value={applyForm.message} onChange={e => setApplyForm(p => ({ ...p, message: e.target.value }))} placeholder="자기소개 및 창업 동기를 간략히 작성해주세요" className="input resize-none" rows={3} />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setApplying(null)} className="btn-ghost flex-1 justify-center py-2.5">취소</button>
                  <button onClick={handleApply} className="btn-primary flex-1 justify-center py-2.5">신청하기</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Browse;
