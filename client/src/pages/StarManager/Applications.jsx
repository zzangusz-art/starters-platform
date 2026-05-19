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
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (typeFilter) params.set('type', typeFilter);
    const res = await api.get(`/admin/applications?${params}`);
    setApplications(res.data.applications);
    setTotal(res.data.total);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [statusFilter, typeFilter]);

  const updateStatus = async (id, status) => {
    await api.put(`/applications/${id}/status`, { status });
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  return (
    <Layout title="신청 관리" subtitle={`총 ${total}건`}>
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {[['', '전체 상태'], ['pending', '대기'], ['reviewing', '검토중'], ['approved', '승인'], ['rejected', '거절']].map(([v, l]) => (
            <button key={v} onClick={() => setStatusFilter(v)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilter === v ? 'bg-green-500 text-black' : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a] hover:text-white'}`}>{l}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {[['', '전체 유형'], ['regular', '정식 가맹'], ['incubating', '인큐베이팅']].map(([v, l]) => (
            <button key={v} onClick={() => setTypeFilter(v)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${typeFilter === v ? 'bg-purple-500 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a] hover:text-white'}`}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="text-gray-500 text-sm">불러오는 중...</div> : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1f1f1f]">
                {['신청자', '프랜차이즈', '가맹주', '유형', '상태', '신청일', '처리'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs text-gray-500 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.map(a => {
                const sc = statusConfig[a.status];
                return (
                  <tr key={a.id} className="border-b border-[#1a1a1a] hover:bg-white/2 transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-white text-sm font-medium">{a.applicant_name}</p>
                      <p className="text-gray-600 text-xs">{a.applicant_email}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm">{a.franchise_name}</td>
                    <td className="py-3 px-4 text-gray-400 text-sm">{a.owner_name}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${a.type === 'incubating' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                        {a.type === 'incubating' ? '인큐베이팅' : '정식 가맹'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={sc?.cls || 'badge-gray'}>{sc?.label || a.status}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{new Date(a.created_at).toLocaleDateString('ko-KR')}</td>
                    <td className="py-3 px-4">
                      {(a.status === 'pending' || a.status === 'reviewing') && (
                        <div className="flex gap-1">
                          <button onClick={() => updateStatus(a.id, 'approved')} className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded hover:bg-green-500/20 transition-all">승인</button>
                          <button onClick={() => updateStatus(a.id, 'rejected')} className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded hover:bg-red-500/20 transition-all">거절</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {applications.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">해당 조건의 신청이 없습니다</div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default Applications;
