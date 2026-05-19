import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api';

const formatMoney = (n) => n ? (n >= 100000000 ? `${(n/100000000).toFixed(0)}억` : `${(n/10000).toFixed(0)}만원`) : '-';

const MyFranchises = () => {
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/franchises/my/list').then(r => setFranchises(r.data)).finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (f) => {
    const newStatus = f.status === 'active' ? 'inactive' : 'active';
    await api.put(`/franchises/${f.id}`, { status: newStatus });
    setFranchises(prev => prev.map(x => x.id === f.id ? { ...x, status: newStatus } : x));
  };

  const deleteFranchise = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await api.delete(`/franchises/${id}`);
    setFranchises(prev => prev.filter(f => f.id !== id));
  };

  if (loading) return <Layout title="내 프랜차이즈"><div className="text-gray-500 text-sm">불러오는 중...</div></Layout>;

  return (
    <Layout
      title="내 프랜차이즈"
      subtitle={`총 ${franchises.length}개`}
      actions={<Link to="/master/franchises/new" className="btn-primary text-sm py-2">+ 새 프랜차이즈 등록</Link>}
    >
      {franchises.length === 0 ? (
        <div className="card text-center py-20">
          <p className="text-4xl mb-4">🏪</p>
          <p className="text-white font-semibold mb-2">등록된 프랜차이즈가 없습니다</p>
          <p className="text-gray-500 text-sm mb-6">첫 번째 프랜차이즈를 등록하고 스타루키를 모집하세요</p>
          <Link to="/master/franchises/new" className="btn-primary">+ 프랜차이즈 등록하기</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {franchises.map(f => (
            <div key={f.id} className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center text-lg shrink-0">
                  🏪
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-white">{f.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${f.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                      {f.status === 'active' ? '활성' : '비활성'}
                    </span>
                    {f.incubating_available === 1 && <span className="badge-purple text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">인큐베이팅</span>}
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{f.description || '설명 없음'}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>카테고리: {f.category}</span>
                    <span>투자: {formatMoney(f.investment_min)} ~ {formatMoney(f.investment_max)}</span>
                    <span>로열티: {f.royalty_rate}%</span>
                    <span>신청 {f.application_count}건</span>
                    {f.pending_count > 0 && <span className="text-yellow-400">대기 {f.pending_count}건</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/master/franchises/${f.id}/edit`} className="btn-ghost text-sm py-1.5 px-3">수정</Link>
                  <button onClick={() => toggleStatus(f)} className="btn-ghost text-sm py-1.5 px-3">
                    {f.status === 'active' ? '비활성화' : '활성화'}
                  </button>
                  <button onClick={() => deleteFranchise(f.id)} className="text-gray-600 hover:text-red-400 px-2 py-1.5 rounded-lg hover:bg-red-500/5 transition-all text-sm">
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default MyFranchises;
