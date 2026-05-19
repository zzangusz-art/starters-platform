import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api';

const statusConfig = {
  pending: { label: '검토 대기', cls: 'badge-yellow', desc: '가맹주가 아직 검토하지 않았습니다' },
  reviewing: { label: '검토 중', cls: 'badge-blue', desc: '가맹주가 신청서를 검토하고 있습니다' },
  approved: { label: '승인', cls: 'badge-green', desc: '축하합니다! 가맹 신청이 승인되었습니다' },
  rejected: { label: '거절', cls: 'badge-red', desc: '이번에는 가맹 신청이 거절되었습니다' },
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/applications').then(r => setApplications(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="내 신청 현황"><div className="text-gray-500 text-sm">불러오는 중...</div></Layout>;

  return (
    <Layout
      title="내 신청 현황"
      subtitle={`총 ${applications.length}건`}
      actions={<Link to="/rookie/browse" className="btn-primary text-sm py-2">+ 프랜차이즈 탐색</Link>}
    >
      {applications.length === 0 ? (
        <div className="card text-center py-20">
          <p className="text-4xl mb-4">📄</p>
          <p className="text-white font-semibold mb-2">아직 신청한 프랜차이즈가 없습니다</p>
          <p className="text-gray-500 text-sm mb-6">원하는 프랜차이즈를 탐색하고 가맹을 신청해보세요</p>
          <Link to="/rookie/browse" className="btn-primary">프랜차이즈 탐색하기</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(a => {
            const cfg = statusConfig[a.status] || { label: a.status, cls: 'badge-gray', desc: '' };
            return (
              <div key={a.id} className="card">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#1a1a1a] rounded-xl flex items-center justify-center text-xl shrink-0">
                    {a.type === 'incubating' ? '🚀' : '⭐'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-white">{a.franchise_name}</h3>
                      <span className={cfg.cls}>{cfg.label}</span>
                      <span className="text-[10px] text-gray-600 border border-[#2a2a2a] px-2 py-0.5 rounded-full">
                        {a.type === 'incubating' ? '인큐베이팅' : '정식 가맹'}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mb-2">담당: {a.owner_name} · {new Date(a.created_at).toLocaleDateString('ko-KR')}</p>
                    <p className="text-gray-400 text-sm">{cfg.desc}</p>
                    {a.admin_note && (
                      <div className="mt-2 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                        <p className="text-xs text-gray-400">가맹주 메모:</p>
                        <p className="text-green-400 text-sm mt-0.5">{a.admin_note}</p>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="shrink-0 w-20 hidden md:block">
                    <div className="text-[10px] text-gray-600 mb-1 text-right">진행률</div>
                    <div className="w-full bg-[#1a1a1a] rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full transition-all ${a.status === 'approved' ? 'bg-green-500 w-full' : a.status === 'reviewing' ? 'bg-blue-500 w-2/3' : a.status === 'rejected' ? 'bg-red-500 w-full' : 'bg-gray-600 w-1/3'}`} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default MyApplications;
