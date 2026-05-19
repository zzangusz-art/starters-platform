import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import api from '../../api';

const roleLabels = { star_master: '스타마스터', star_rookie: '스타루키', star_maker: '스타메이커', star_manager: '스타매니저' };
const statusBadge = (s) => {
  const m = { pending: ['badge-yellow', '대기'], reviewing: ['badge-blue', '검토중'], approved: ['badge-green', '승인'], rejected: ['badge-red', '거절'] };
  const [cls, label] = m[s] || ['badge-gray', s];
  return <span className={cls}>{label}</span>;
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <Layout title="관리자 대시보드"><div className="text-gray-500 text-sm">불러오는 중...</div></Layout>;

  const { stats, recentApplications, recentUsers } = data;

  return (
    <Layout title="관리자 대시보드" subtitle="플랫폼 전체 현황">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="전체 회원" value={stats.total_users} icon="👥" color="green" />
        <StatCard label="활성 프랜차이즈" value={stats.active_franchises} icon="🏪" sub={`전체 ${stats.total_franchises}`} color="blue" />
        <StatCard label="대기 중 신청" value={stats.pending_applications} icon="⏳" sub={`전체 ${stats.total_applications}`} color="yellow" />
        <StatCard label="인큐베이팅 진행" value={stats.active_programs} icon="🚀" color="purple" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="스타마스터" value={stats.star_masters} icon="👑" color="yellow" />
        <StatCard label="스타루키" value={stats.star_rookies} icon="⭐" color="blue" />
        <StatCard label="스타메이커" value={stats.star_makers} icon="🚀" color="purple" />
        <div className="card">
          <div className="text-sm text-gray-500 mb-3">빠른 이동</div>
          <div className="space-y-1.5">
            <Link to="/manager/users" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors py-1">👥 회원 관리 →</Link>
            <Link to="/manager/franchises" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors py-1">🏪 프랜차이즈 관리 →</Link>
            <Link to="/manager/applications" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors py-1">📋 신청 관리 →</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">최근 신청</h2>
            <Link to="/manager/applications" className="text-green-400 text-sm hover:underline">전체 보기 →</Link>
          </div>
          <div className="space-y-3">
            {recentApplications.map(a => (
              <div key={a.id} className="card flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{a.franchise_name}</p>
                  <p className="text-gray-500 text-xs truncate">{a.applicant_name} · {new Date(a.created_at).toLocaleDateString('ko-KR')}</p>
                </div>
                {statusBadge(a.status)}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">최근 가입 회원</h2>
            <Link to="/manager/users" className="text-green-400 text-sm hover:underline">전체 보기 →</Link>
          </div>
          <div className="space-y-3">
            {recentUsers.map(u => (
              <div key={u.id} className="card flex items-center gap-3">
                <div className="w-9 h-9 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center text-sm shrink-0">
                  {u.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{u.name}</p>
                  <p className="text-gray-500 text-xs truncate">{roleLabels[u.role]}</p>
                </div>
                <p className="text-gray-600 text-xs shrink-0">{new Date(u.created_at).toLocaleDateString('ko-KR')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
