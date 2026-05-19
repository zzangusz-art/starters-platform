import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import FranchiseCard from '../../components/FranchiseCard';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

const statusBadge = (s) => {
  const m = { pending: ['badge-yellow', '검토 대기'], reviewing: ['badge-blue', '검토 중'], approved: ['badge-green', '승인'], rejected: ['badge-red', '거절'] };
  const [cls, label] = m[s] || ['badge-gray', s];
  return <span className={cls}>{label}</span>;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [franchises, setFranchises] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/franchises?limit=6'),
      api.get('/applications'),
    ]).then(([f, a]) => {
      setFranchises(f.data.franchises);
      setApplications(a.data);
    }).finally(() => setLoading(false));
  }, []);

  const approved = applications.filter(a => a.status === 'approved').length;
  const pending = applications.filter(a => a.status === 'pending' || a.status === 'reviewing').length;

  if (loading) return <Layout title="대시보드"><div className="text-gray-500 text-sm">불러오는 중...</div></Layout>;

  return (
    <Layout
      title="대시보드"
      subtitle={`안녕하세요, ${user?.name} 스타루키님`}
      actions={<Link to="/rookie/browse" className="btn-primary text-sm py-2">프랜차이즈 탐색 →</Link>}
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="신청한 프랜차이즈" value={applications.length} icon="📄" color="blue" />
        <StatCard label="진행 중" value={pending} icon="⏳" color="yellow" sub="검토 대기/진행" />
        <StatCard label="승인 완료" value={approved} icon="✅" color="green" />
      </div>

      {/* Applications */}
      {applications.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">내 신청 현황</h2>
            <Link to="/rookie/applications" className="text-green-400 text-sm hover:underline">전체 보기 →</Link>
          </div>
          <div className="space-y-3">
            {applications.slice(0, 3).map(a => (
              <div key={a.id} className="card flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm">{a.franchise_name}</p>
                  <p className="text-gray-500 text-xs">{a.type === 'incubating' ? '인큐베이팅 신청' : '정식 가맹 신청'} · {new Date(a.created_at).toLocaleDateString('ko-KR')}</p>
                </div>
                {statusBadge(a.status)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Browse */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">추천 프랜차이즈</h2>
          <Link to="/rookie/browse" className="text-green-400 text-sm hover:underline">전체 보기 →</Link>
        </div>
        {franchises.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 text-sm">등록된 프랜차이즈가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {franchises.map(f => <FranchiseCard key={f.id} franchise={f} />)}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
