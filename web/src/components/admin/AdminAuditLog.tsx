import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { ClipboardList, Filter, Search, User as UserIcon, Cpu, Sliders, Shield, AlertTriangle } from 'lucide-react';

type ActionType = 'node_assigned' | 'user_created' | 'threshold_changed' | 'node_offline' | 'role_changed' | 'user_disabled';

interface AuditEntry {
  id: string;
  action: ActionType;
  actor: string;
  target: string;
  detail: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error';
}

const ACTION_META: Record<ActionType, { label: string; icon: any; color: string }> = {
  node_assigned:     { label: 'Node Assigned',       icon: Cpu,          color: 'text-blue-400' },
  user_created:      { label: 'User Created',         icon: UserIcon,     color: 'text-green-400' },
  threshold_changed: { label: 'Threshold Changed',    icon: Sliders,      color: 'text-amber-400' },
  node_offline:      { label: 'Node Offline',         icon: AlertTriangle,color: 'text-red-400' },
  role_changed:      { label: 'Role Changed',         icon: Shield,       color: 'text-purple-400' },
  user_disabled:     { label: 'User Disabled',        icon: UserIcon,     color: 'text-red-400' },
};

const DEMO_LOG: AuditEntry[] = [
  {
    id: '1', action: 'node_assigned', actor: 'admin1', target: 'node1 → user1',
    detail: 'Assigned node node1 (Main Sensor) to Chirag Mehta (user1).',
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(), severity: 'info',
  },
  {
    id: '2', action: 'user_created', actor: 'admin1', target: 'user1',
    detail: 'Created new user account: chirag@empyrean.io with role "user".',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(), severity: 'info',
  },
  {
    id: '3', action: 'threshold_changed', actor: 'admin1', target: 'node3',
    detail: 'PM2.5 alert threshold changed from 75 µg/m³ to 55 µg/m³.',
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(), severity: 'warning',
  },
  {
    id: '4', action: 'node_offline', actor: 'system', target: 'node1',
    detail: 'Node node1 (Parking) went offline. Last heartbeat at 21:15.',
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), severity: 'error',
  },
  {
    id: '5', action: 'role_changed', actor: 'admin1', target: 'user2',
    detail: 'Changed role of user2 from "user" to "admin".',
    timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), severity: 'warning',
  },
  {
    id: '6', action: 'user_disabled', actor: 'admin1', target: 'testuser',
    detail: 'Disabled account testuser (test@empyrean.io).',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), severity: 'warning',
  },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminAuditLog() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'error'>('all');

  const filtered = DEMO_LOG.filter(e => {
    if (severityFilter !== 'all' && e.severity !== severityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.actor.toLowerCase().includes(q) ||
        e.target.toLowerCase().includes(q) ||
        e.detail.toLowerCase().includes(q) ||
        ACTION_META[e.action].label.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AdminLayout title="Audit Log">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 bg-purple-500/8 border border-purple-500/20 rounded-2xl text-sm text-purple-200/80">
          <ClipboardList className="w-4 h-4 text-purple-400 shrink-0" />
          Immutable audit trail of key admin actions: node assignments, user changes, threshold edits, and system events.
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search actor, target, or action..."
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/30" />
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/8">
              {(['all', 'info', 'warning', 'error'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSeverityFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                    severityFilter === s ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
                  }`}
                >{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Log entries */}
        <div className="liquid-glass rounded-2xl border border-white/5 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-white/40">No matching audit entries.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map(entry => {
                const meta = ACTION_META[entry.action];
                const MetaIcon = meta.icon;
                return (
                  <div key={entry.id} className="flex items-start gap-4 px-6 py-4 hover:bg-white/2 transition-colors">
                    {/* Severity indicator */}
                    <div className="mt-1 shrink-0">
                      <span className={`w-2 h-2 rounded-full block ${
                        entry.severity === 'error' ? 'bg-red-400' :
                        entry.severity === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                      }`} />
                    </div>

                    {/* Action icon */}
                    <div className={`p-1.5 rounded-lg bg-white/5 shrink-0 ${meta.color}`}>
                      <MetaIcon className="w-3.5 h-3.5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-xs font-black text-white/80 uppercase tracking-wider">{meta.label}</span>
                        <span className="text-xs text-white/40">by</span>
                        <span className="text-xs font-bold text-amber-300/80">{entry.actor}</span>
                        <span className="text-xs text-white/40">→</span>
                        <span className="text-xs font-semibold text-white/70">{entry.target}</span>
                      </div>
                      <p className="text-sm text-white/60">{entry.detail}</p>
                    </div>

                    {/* Time */}
                    <div className="text-right shrink-0">
                      <p className="text-xs text-white/30">{timeAgo(entry.timestamp)}</p>
                      <p className="text-[10px] text-white/20">{new Date(entry.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-xs text-white/20 text-center">Showing {filtered.length} of {DEMO_LOG.length} entries. Demo data — real entries saved to Firestore.</p>
      </div>
    </AdminLayout>
  );
}
