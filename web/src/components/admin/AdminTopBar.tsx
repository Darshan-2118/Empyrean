import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/useAuth';
import { Shield, LogOut } from 'lucide-react';

function getAvatarColor(name: string): string {
  const colors = ['#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#22c55e'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

interface AdminTopBarProps {
  title: string;
}

export default function AdminTopBar({ title }: AdminTopBarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const username = user?.username || 'admin';
  const displayName = user?.displayName || username;
  const avatarColor = getAvatarColor(username);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="relative z-50 w-full h-20 bg-black/40 backdrop-blur-xl border-b border-amber-500/10 flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-300/80">Admin</span>
        </div>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-white">{displayName}</p>
          <p className="text-xs text-amber-300/60 font-medium">System Administrator</p>
        </div>
        <div
          className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 border-amber-500/30 shadow-lg shadow-amber-500/10 font-bold text-sm text-white shrink-0"
          style={{ backgroundColor: user?.avatar ? 'transparent' : avatarColor }}
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            displayName[0].toUpperCase()
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/50 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
