import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

const statusBadge = (s) => {
  const m = { pending: ['badge-yellow', '대기'], reviewing: ['badge-blue', '검토중'], approved: ['badge-green', '승인'], rejected: ['badge-red', '거절'] };
  const [cls, label] = m[s] || ['badge-gray', s];
  return <span className={cls}>{label}</span>;
};

const formatMoney = (n) => n ? (n >= 100000000 ? `${(n/100000000).toFixed(0)}억` : `${(n/10000).toFixed(0)}만원`) : '-';

const Dashboard = () => {
  const { user } = useAuth();
  const [franchises, setFranchises] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/franchises/my/list'),
      api.get('/applications'),
    ]).then(([f, a]) => {
      setFranchises(f.data);
      setApplications(a.data);
    }).finally(() => setLoading(false));
  }, []);

  const totalApps = applications.length;
  const pendingApps = applications.filter(a => a.status === 'pending').length;
  const incubatingApps = applications.filter(a => a.type === 'incubating').length;

  if (loading) return <Layout title="대시보드"><div className="text-gray-500 text-sm">불러오는 중...</div></Layout>;

  return (
    <Layout
      title="대시보드"
      subtitle={`안녕하세요, ${user?.name} 스타마스터님`}
      actions={<Link to="/master/franchises/new" className="btn-primary text-sm py-2">+ 프랜차이즈 등록</Link>}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="내 프랜차이즈" value={franchises.length} icon="🏪" color="green" />
        <StatCard label="총 신청 수" value={totalApps} icon="📋" color="blue" sub="전체 신청" />
        <StatCard label="대기 중" value={pendingApps} icon="⏳" color="yellow" sub="검토 필요" />
        <StatCard label="인큐베이팅" value={incubatingApps} icon="🚀" color="purple" sub="인큐베이팅 신청" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Franchises */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">내 프랜차이즈</h2>
            <Link to="/master/franchises" className="text-green-400 text-sm hover:underline">전체 보기 →</Link>
          </div>
          {franchises.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-gray-500 text-sm mb-4">등록된 프랜차이즈가 없습니다</p>
              <Link to="/master/franchises/new" className="btn-primary text-sm py-2">+ 등록하기</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {franchises.slice(0, 4).map(f => (
                <div key={f.id} className="card flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-white text-sm">{f.name}</span>
                      {f.incubating_available === 1 && <span className="badge-green text-[10px]">인큐베이팅</span>}
                    </div>
                    <p className="text-gray-500 text-xs">{f.category} · 신청 {f.application_count}건</p>
                  </div>
                  <div className="text-right shrink-0">
                    {f.pending_count > 0 && (
                      <span className="badge-yellow text-[10px]">대기 {f.pending_count}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">최근 신청</h2>
            <Link to="/master/applications" className="text-green-400 text-sm hover:underline">전체 보기 →</Link>
          </div>
          {applications.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-gray-500 text-sm">아직 신청이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 5).map(a => (
                <div key={a.id} className="card flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{a.applicant_name}</p>
                    <p className="text-gray-500 text-xs truncate">{a.franchise_name} · {a.type === 'incubating' ? '인큐베이팅' : '정식 가맹'}</p>
                  </div>
                  <div className="shrink-0">
                    {statusBadge(a.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
