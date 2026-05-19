import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api';

const formatMoney = (n) => n ? (n >= 100000000 ? `${(n/100000000).toFixed(0)}억` : `${(n/10000).toFixed(0)}만`) : '-';

const Franchises = () => {
  const [franchises, setFranchises] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    const res = await api.get(`/admin/franchises?${params}`);
    setFranchises(res.data.franchises);
    setTotal(res.data.total);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [statusFilter]);

  const toggleStatus = async (f) => {
    const newStatus = f.status === 'active' ? 'inactive' : 'active';
    await api.put(`/franchises/${f.id}`, { status: newStatus });
    setFranchises(prev => prev.map(x => x.id === f.id ? { ...x, status: newStatus } : x));
  };

  return (
    <Layout title="프랜차이즈 관리" subtitle={`총 ${total}개`}>
      <div className="flex gap-2 mb-6 flex-wrap">
        {[['', '전체'], ['active', '활성'], ['inactive', '비활성'], ['pending', '검토중']].map(([v, l]) => (
          <button key={v} onClick={() => setStatusFilter(v)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilter === v ? 'bg-green-500 text-black' : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a] hover:text-white'}`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? <div className="text-gray-500 text-sm">불러오는 중...</div> : (
        <div className="space-y-3">
          {franchises.map(f => (
            <div key={f.id} className="card flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-white">{f.name}</span>
                  <span className={f.status === 'active' ? 'badge-green' : 'badge-gray'}>
                    {f.status === 'active' ? '활성' : f.status === 'inactive' ? '비활성' : '검토중'}
                  </span>
                  {f.incubating_available === 1 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">인큐베이팅</span>
                  )}
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>{f.category}</span>
                  <span>가맹주: {f.owner_name}</span>
                  <span>창업비: {formatMoney(f.investment_min)}~{formatMoney(f.investment_max)}</span>
                  <span>신청 {f.application_count}건</span>
                </div>
              </div>
              <button onClick={() => toggleStatus(f)} className="btn-ghost text-sm py-1.5 px-3 shrink-0">
                {f.status === 'active' ? '비활성화' : '활성화'}
              </button>
            </div>
          ))}
          {franchises.length === 0 && (
            <div className="card text-center py-12 text-gray-500 text-sm">해당 조건의 프랜차이즈가 없습니다</div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default Franchises;
