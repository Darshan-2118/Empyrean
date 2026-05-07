import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { getAlerts } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, User, Settings, LogOut, AlertTriangle, Clock, ArrowRight } from 'lucide-react';

function getAvatarColor(name: string): string {
  const colors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#14b8a6', '#06b6d4', '#3b82f6',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

interface TopBarProps {
  title: string;
  alertCount?: number;
}

export default function TopBar({ title, alertCount = 0 }: TopBarProps) {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  
  const isDemo = token?.startsWith('demo-token');

  const username = user?.username || 'User';
  const displayName = user?.displayName || username;
  const avatarColor = getAvatarColor(username);
  const firstLetter = displayName[0].toUpperCase();

  useEffect(() => {
    // Hover handles the state, so we don't need the mousedown click-away listener
  }, []);

  useEffect(() => {
    if (isDemo) {
      setRecentAlerts([
        {
          alert_id: 'demo-alert-1', node_id: 'node3', parameter: 'pm25',
          value: 58.3, threshold: 55.4, severity: 'warning',
          triggered_at: new Date().toISOString()
        },
        {
          alert_id: 'demo-alert-2', node_id: 'node3', parameter: 'aqi',
          value: 153, threshold: 150, severity: 'critical',
          triggered_at: new Date().toISOString()
        }
      ]);
      return;
    }
    const loadAlerts = async () => {
      if (!token) return;
      try {
        const response = await getAlerts(token, 10);
        const alertsList = Array.isArray(response) ? response : [];
        setRecentAlerts(alertsList.filter(a => !a.acknowledged_at));
      } catch (err) {
        console.error(err);
      }
    };
    loadAlerts();
    const interval = setInterval(loadAlerts, 10000);
    return () => clearInterval(interval);
  }, [token, isDemo]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const currentAlertCount = recentAlerts.length > 0 ? recentAlerts.length : alertCount;

  const items = [
    { icon: User, label: 'Profile', action: () => navigate('/profile') },
    { icon: AlertTriangle, label: 'Alerts', action: () => navigate('/alerts'), badge: currentAlertCount },
    { icon: Settings, label: 'Settings', action: () => navigate('/settings') },
  ];

  return (
    <header className="relative z-50 w-full h-20 liquid-glass !overflow-visible border-b border-white/5 flex items-center justify-between px-8 backdrop-blur-xl shrink-0">
      <h1 className="text-2xl font-semibold">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Bell + Dropdown */}
        <div 
          className="relative z-50"
          onMouseEnter={() => setBellOpen(true)}
          onMouseLeave={() => setBellOpen(false)}
        >
          <button
            className="relative w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5 text-white/70" />
            {currentAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                {currentAlertCount > 9 ? '9+' : currentAlertCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {bellOpen && (
              <div className="absolute right-0 top-10 pt-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="w-80 liquid-glass-strong rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[60vh]"
                >
                <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center bg-black/20">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">Recent Alerts</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-200 font-bold">{currentAlertCount} New</span>
                  </div>
                </div>

                <div className="overflow-y-auto custom-scrollbar">
                  {recentAlerts.length === 0 ? (
                    <div className="py-8 text-center text-white/40 text-sm">No active alerts.</div>
                  ) : (
                    recentAlerts.slice(0, 10).map((alert) => (
                      <button
                        key={alert.alert_id}
                        onClick={() => { navigate(`/dashboard/node/${alert.node_id}`); setBellOpen(false); }}
                        className="w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors group"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">{alert.node_id}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${
                            alert.severity === 'critical' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'
                          }`}>{alert.severity}</span>
                        </div>
                        <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                          {alert.parameter.toUpperCase()} reading of {alert.value.toFixed(1)} exceeded limit ({alert.threshold})
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-white/40 font-medium">
                          <Clock className="w-3 h-3" /> {new Date(alert.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="border-t border-white/10 bg-black/20">
                  <button
                    onClick={() => { navigate('/alerts'); setBellOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-blue-400 hover:text-blue-300 hover:bg-white/5 transition-colors"
                  >
                    View All Alerts <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar + Dropdown */}
        <div 
          className="relative z-50"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <button
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 shadow-lg hover:scale-105 transition-transform cursor-pointer flex items-center justify-center"
            style={{ backgroundColor: user?.avatar ? 'transparent' : avatarColor }}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-sm text-white">{firstLetter}</span>
            )}
          </button>

          <AnimatePresence>
            {open && (
              <div className="absolute right-0 top-10 pt-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="w-56 liquid-glass-strong rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50"
                >
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-sm font-semibold text-white">{displayName}</p>
                  <p className="text-xs text-white/50 capitalize">{user?.role || 'user'}</p>
                </div>

                <div className="py-1">
                  {items.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => { item.action(); setOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-auto w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-white/10 py-1">
                  <button
                    onClick={() => { handleLogout(); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
