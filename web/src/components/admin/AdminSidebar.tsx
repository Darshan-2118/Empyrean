import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../services/useAuth';
import {
  LayoutDashboard, Users, Cpu, Bell, BarChart2,
  ClipboardList, Sliders, LogOut, Shield,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/nodes', icon: Cpu, label: 'Nodes' },
  { path: '/admin/alerts', icon: Bell, label: 'Alerts' },
  { path: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/admin/audit', icon: ClipboardList, label: 'Audit Log' },
  { path: '/admin/thresholds', icon: Sliders, label: 'Thresholds' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="relative z-10 w-64 border-r border-amber-500/10 bg-black/60 backdrop-blur-2xl flex flex-col py-8 px-4 h-screen shrink-0">
      {/* Logo */}
      <button
        onClick={() => navigate('/admin')}
        className="flex items-center gap-3 px-4 mb-2 cursor-pointer hover:opacity-80 transition-opacity text-left bg-transparent border-none p-0 w-full"
      >
        <img src="/finallogo.png" alt="Logo" className="w-8 h-8 object-contain" />
        <div>
          <span className="text-lg font-semibold tracking-wide block leading-none">EMPYREAN</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/70">Admin Console</span>
        </div>
      </button>

      {/* Admin badge */}
      <div className="flex items-center gap-2 px-4 py-2 mb-6 mt-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
        <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <div>
          <p className="text-[10px] font-black text-amber-300/60 uppercase tracking-widest">Logged in as</p>
          <p className="text-xs font-bold text-amber-200">{user?.displayName || user?.username}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
              isActive(item.path, item.exact)
                ? 'bg-amber-500/15 text-amber-200 border border-amber-500/20'
                : 'text-white/50 hover:text-white hover:bg-white/8 border border-transparent'
            }`}
          >
            <item.icon className="w-4.5 h-4.5 shrink-0" style={{ width: '18px', height: '18px' }} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-red-300 hover:bg-red-500/10 transition-all border border-transparent"
      >
        <LogOut className="w-4 h-4 shrink-0" />
        <span className="font-medium text-sm">Sign Out</span>
      </button>
    </aside>
  );
}
