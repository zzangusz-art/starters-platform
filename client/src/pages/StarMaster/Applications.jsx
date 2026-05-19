import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api';

const statusConfig = {
  pending: { label: '대기', cls: 'badge-yellow' },
  reviewing: { label: '검토중', cls: 'badge-blue' },
  approved: { label: '승인', cls: 'badge-green' },
  rejected: { label: '거절', cls: 'badge-red' },
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    api.get('/applications').then(r => setApplications(r.data)).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/applications/${id}/status`, { status, admin_note: note });
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status, admin_note: note } : a));
    setSelected(null);
    setNote('');
  };

  const filtered = filter === 'all' ? applications : applications.filter(a => filter === 'incubating' ? a.type === 'incubating' : a.status === filter);

  if (loading) return <Layout title="가맹 신청 관리"><div className="text-gray-500 text-sm">불러오는 중...</div></Layout>;

  return (
    <Layout title="가맹 신청 관리" subtitle={`총 ${applications.length}건`}>
      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[['all', '전체'], ['pending', '대기'], ['reviewing', '검토중'], ['approved', '승인'], ['rejected', '거절'], ['incubating', '인큐베이팅']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === v ? 'bg-green-500 text-black' : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-[#2a2a2a]'}`}>
            {l}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-500">해당 조건의 신청이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a.id} className="card">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-white">{a.applicant_name}</span>
                    <span className={statusConfig[a.status]?.cls || 'badge-gray'}>{statusConfig[a.status]?.label || a.status}</span>
                    {a.type === 'incubating' && <span className="badge-blue text-[10px]">인큐베이팅</span>}
                  </div>
                  <p className="text-gray-400 text-sm mb-1">{a.franchise_name}</p>
                  <div className="flex gap-4 text-xs text-gray-600">
                    <span>{a.applicant_email}</span>
                    <span>{a.applicant_phone || '연락처 없음'}</span>
                    <span>{new Date(a.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  {a.message && (
                    <p className="text-gray-400 text-sm mt-2 bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]">
                      {a.message}
                    </p>
                  )}
                  {a.admin_note && (
                    <p className="text-green-400 text-xs mt-1">메모: {a.admin_note}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {a.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(a.id, 'reviewing')} className="btn-ghost text-sm py-1.5 px-3 text-blue-400 hover:text-blue-300">검토중으로</button>
                      <button onClick={() => { setSelected(a); setNote(''); }} className="btn-primary text-sm py-1.5 px-3">처리하기</button>
                    </>
                  )}
                  {a.status === 'reviewing' && (
                    <button onClick={() => { setSelected(a); setNote(''); }} className="btn-primary text-sm py-1.5 px-3">처리하기</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-white text-lg mb-1">신청 처리</h3>
            <p className="text-gray-400 text-sm mb-5">{selected.applicant_name} — {selected.franchise_name}</p>
            <div className="mb-5">
              <label className="label">메모 (선택사항)</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="신청자에게 전달할 메모를 입력하세요" className="input resize-none" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button onClick={() => updateStatus(selected.id, 'approved')} className="btn-primary justify-center py-2.5">승인</button>
              <button onClick={() => updateStatus(selected.id, 'rejected')} className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-semibold px-5 py-2.5 rounded-lg transition-all justify-center flex">거절</button>
            </div>
            <button onClick={() => { setSelected(null); setNote(''); }} className="btn-ghost w-full justify-center">취소</button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Applications;
