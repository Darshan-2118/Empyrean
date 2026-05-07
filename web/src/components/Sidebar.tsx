import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { LayoutDashboard, History as HistoryIcon, Bell, User, Cpu } from 'lucide-react';

function getAvatarColor(name: string): string {
  const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#3b82f6', '#22c55e'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const displayName = user?.displayName || user?.username || 'User';
  const assignedNode = user?.assignedNode;
  const avatarColor = getAvatarColor(user?.username || 'user');

  const links = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/dashboard/history', icon: HistoryIcon, label: 'History' },
    { path: '/alerts', icon: Bell, label: 'Alerts' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="relative z-10 w-64 liquid-glass-strong border-r border-white/8 flex flex-col py-8 px-4 h-screen backdrop-blur-2xl shrink-0">
      {/* Logo */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-3 px-4 mb-8 cursor-pointer hover:opacity-80 transition-opacity text-left bg-transparent border-none p-0 w-full"
      >
        <img src="/finallogo.png" alt="Logo" className="w-8 h-8 object-contain" />
        <span className="text-xl font-semibold tracking-wide">EMPYREAN</span>
      </button>

      <div className="flex items-center gap-3 px-4 py-3 mb-6 rounded-xl bg-white/5 border border-white/8">
        <div
          className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ backgroundColor: user?.avatar ? 'transparent' : avatarColor }}
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            displayName[0].toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{displayName}</p>
          <p className="text-xs text-white/40 capitalize">{user?.role || 'user'}</p>
        </div>
      </div>

      {/* Assigned node badge */}
      {assignedNode && (
        <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-blue-500/8 border border-blue-500/15 rounded-xl">
          <Cpu className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-300/50">My Node</p>
            <p className="text-xs font-bold text-blue-200">{assignedNode}</p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {links.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left border ${
              isActive(item.path, item.exact)
                ? 'bg-white/15 text-white border-white/10 shadow-inner'
                : 'text-white/55 hover:text-white hover:bg-white/8 border-transparent'
            }`}
          >
            <item.icon className="w-4.5 h-4.5 shrink-0" style={{ width: '18px', height: '18px' }} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
