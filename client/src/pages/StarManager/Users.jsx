import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api';

const roleConfig = {
  star_master: { label: '스타마스터', cls: 'badge-yellow' },
  star_rookie: { label: '스타루키', cls: 'badge-blue' },
  star_maker: { label: '스타메이커', cls: 'badge-purple' },
  star_manager: { label: '스타매니저', cls: 'badge-green' },
};
const badgePurple = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const fetch = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (roleFilter) params.set('role', roleFilter);
    if (search) params.set('search', search);
    const res = await api.get(`/admin/users?${params}`);
    setUsers(res.data.users);
    setTotal(res.data.total);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [roleFilter]);

  const handleSearch = (e) => { e.preventDefault(); fetch(); };

  const toggleActive = async (u) => {
    await api.put(`/admin/users/${u.id}`, { active: u.active ? 0 : 1 });
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, active: u.active ? 0 : 1 } : x));
  };

  return (
    <Layout title="회원 관리" subtitle={`총 ${total}명`}>
      {/* Filter */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="이름 또는 이메일 검색..." className="input flex-1 text-sm" />
          <button type="submit" className="btn-primary text-sm px-4 py-2">검색</button>
        </form>
        <div className="flex gap-2">
          {[['', '전체'], ['star_master', '스타마스터'], ['star_rookie', '스타루키'], ['star_maker', '스타메이커'], ['star_manager', '스타매니저']].map(([v, l]) => (
            <button key={v} onClick={() => setRoleFilter(v)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${roleFilter === v ? 'bg-green-500 text-black' : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a] hover:text-white'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="text-gray-500 text-sm">불러오는 중...</div> : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1f1f1f]">
                <th className="text-left py-3 px-4 text-xs text-gray-500 font-semibold">이름</th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 font-semibold">이메일</th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 font-semibold">역할</th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 font-semibold">연락처</th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 font-semibold">가입일</th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 font-semibold">상태</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const rc = roleConfig[u.role];
                return (
                  <tr key={u.id} className="border-b border-[#1a1a1a] hover:bg-white/2 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center text-xs shrink-0">{u.name.charAt(0)}</div>
                        <span className="text-white text-sm font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={rc?.cls === 'badge-purple' ? badgePurple : rc?.cls || 'badge-gray'}>{rc?.label || u.role}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">{u.phone || '-'}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString('ko-KR')}</td>
                    <td className="py-3 px-4">
                      <span className={u.active ? 'badge-green' : 'badge-red'}>{u.active ? '활성' : '비활성'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleActive(u)} className="text-xs text-gray-500 hover:text-white px-2 py-1 rounded border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all">
                        {u.active ? '비활성화' : '활성화'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">검색 결과가 없습니다</div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default Users;
