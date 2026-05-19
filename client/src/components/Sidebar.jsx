import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const roleConfig = {
  star_master: {
    label: '스타마스터',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    nav: [
      { to: '/master', label: '대시보드', icon: '▦' },
      { to: '/master/franchises', label: '내 프랜차이즈', icon: '🏪' },
      { to: '/master/franchises/new', label: '프랜차이즈 등록', icon: '+' },
      { to: '/master/applications', label: '가맹 신청 관리', icon: '📋' },
    ],
  },
  star_rookie: {
    label: '스타루키',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    nav: [
      { to: '/rookie', label: '대시보드', icon: '▦' },
      { to: '/rookie/browse', label: '프랜차이즈 탐색', icon: '🔍' },
      { to: '/rookie/applications', label: '내 신청 현황', icon: '📄' },
    ],
  },
  star_maker: {
    label: '스타메이커',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    nav: [
      { to: '/maker', label: '인큐베이팅 현황', icon: '🚀' },
    ],
  },
  star_manager: {
    label: '스타매니저',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    nav: [
      { to: '/manager', label: '대시보드', icon: '▦' },
      { to: '/manager/users', label: '회원 관리', icon: '👥' },
      { to: '/manager/franchises', label: '프랜차이즈 관리', icon: '🏪' },
      { to: '/manager/applications', label: '신청 관리', icon: '📋' },
    ],
  },
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const config = roleConfig[user?.role];

  const handleLogout = () => { logout(); navigate('/'); };

  if (!config) return null;

  return (
    <aside className="w-60 min-h-screen bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-5 border-b border-[#1a1a1a]">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-sm">S</span>
          </div>
          <span className="font-black text-white text-lg tracking-tight">스타터즈</span>
        </NavLink>
      </div>

      {/* Role badge */}
      <div className="px-4 pt-4 pb-2">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${config.bg} ${config.color} ${config.border}`}>
          <span>{config.label}</span>
        </div>
        <p className="text-white font-semibold text-sm mt-2 truncate">{user?.name}</p>
        <p className="text-gray-500 text-xs truncate">{user?.email}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {config.nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split('/').length <= 2}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#1a1a1a]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150"
        >
          <span>↩</span>
          로그아웃
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
