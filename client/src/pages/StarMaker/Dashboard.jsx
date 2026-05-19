import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

const Dashboard = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/incubating').then(r => {
      const list = r.data;
      // load milestones for each
      Promise.all(list.map(p => api.get(`/incubating/${p.id}`).then(r => r.data))).then(setPrograms);
    }).finally(() => setLoading(false));
  }, []);

  const toggleMilestone = async (programId, milestoneId, completed) => {
    await api.put(`/incubating/milestones/${milestoneId}`, { completed: !completed });
    setPrograms(prev => prev.map(p => p.id === programId ? {
      ...p,
      milestones: p.milestones.map(m => m.id === milestoneId ? { ...m, completed: completed ? 0 : 1 } : m)
    } : p));
  };

  if (loading) return <Layout title="인큐베이팅 현황"><div className="text-gray-500 text-sm">불러오는 중...</div></Layout>;

  if (programs.length === 0) {
    return (
      <Layout title="인큐베이팅 현황" subtitle={`${user?.name} 스타메이커`}>
        <div className="card text-center py-20 max-w-lg mx-auto">
          <p className="text-4xl mb-4">🚀</p>
          <p className="text-white font-semibold mb-2">진행 중인 인큐베이팅 프로그램이 없습니다</p>
          <p className="text-gray-500 text-sm mb-6">가맹주의 인큐베이팅 신청 승인 후 프로그램이 시작됩니다.</p>
          <p className="text-gray-600 text-xs">스타루키로 전환하여 프랜차이즈 인큐베이팅을 신청해보세요</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="인큐베이팅 현황" subtitle={`${user?.name} 스타메이커`}>
      {programs.map(program => {
        const completedCount = (program.milestones || []).filter(m => m.completed).length;
        const totalCount = (program.milestones || []).length;
        const progressPct = totalCount ? Math.round((completedCount / totalCount) * 100) : program.progress || 0;

        const daysLeft = program.end_date
          ? Math.max(0, Math.ceil((new Date(program.end_date) - new Date()) / (1000 * 60 * 60 * 24)))
          : null;

        return (
          <div key={program.id} className="space-y-6 mb-8">
            {/* Program Header */}
            <div className="card border-green-500/20">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center text-2xl shrink-0">🚀</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-white">{program.franchise_name}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${program.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                      {program.status === 'active' ? '진행중' : program.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">담당: {program.owner_name}</p>
                  <div className="flex gap-4 text-xs text-gray-500 mt-1">
                    {program.start_date && <span>시작: {new Date(program.start_date).toLocaleDateString('ko-KR')}</span>}
                    {program.end_date && <span>종료: {new Date(program.end_date).toLocaleDateString('ko-KR')}</span>}
                    {daysLeft !== null && <span className="text-yellow-400">D-{daysLeft}</span>}
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">전체 진행률</span>
                  <span className="text-2xl font-black text-white">{progressPct}%</span>
                </div>
                <div className="w-full bg-[#1a1a1a] rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">{completedCount}/{totalCount} 마일스톤 완료</p>
              </div>

              {program.notes && (
                <div className="mt-4 p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                  <p className="text-xs text-gray-500 mb-1">담당자 메모</p>
                  <p className="text-gray-300 text-sm">{program.notes}</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="마일스톤 완료" value={`${completedCount}/${totalCount}`} icon="✅" color="green" />
              <StatCard label="진행률" value={`${progressPct}%`} icon="📊" color="blue" />
              <StatCard label="남은 기간" value={daysLeft !== null ? `${daysLeft}일` : '-'} icon="📅" color="yellow" />
            </div>

            {/* Milestones */}
            {program.milestones?.length > 0 && (
              <div>
                <h3 className="section-title mb-4">마일스톤</h3>
                <div className="space-y-3">
                  {program.milestones.map((m, i) => (
                    <div key={m.id} className={`card flex items-start gap-4 transition-all ${m.completed ? 'opacity-70' : ''}`}>
                      <button
                        onClick={() => toggleMilestone(program.id, m.id, m.completed)}
                        className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${m.completed ? 'bg-green-500 border-green-500' : 'border-[#3a3a3a] hover:border-green-500'}`}
                      >
                        {m.completed && <span className="text-black text-xs font-bold">✓</span>}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 w-5">{i + 1}</span>
                          <p className={`font-medium text-sm ${m.completed ? 'line-through text-gray-500' : 'text-white'}`}>{m.title}</p>
                        </div>
                        {m.description && <p className="text-gray-500 text-xs mt-1 ml-7">{m.description}</p>}
                        {m.target_date && (
                          <p className="text-gray-600 text-xs mt-1 ml-7">목표일: {new Date(m.target_date).toLocaleDateString('ko-KR')}</p>
                        )}
                      </div>
                      {m.completed && m.completed_at && (
                        <span className="text-xs text-green-600 shrink-0">{new Date(m.completed_at).toLocaleDateString('ko-KR')} 완료</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </Layout>
  );
};

export default Dashboard;
