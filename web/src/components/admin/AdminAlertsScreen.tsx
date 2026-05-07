import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { AlertTriangle, Wifi, WifiOff, Settings, CheckCircle, Clock, Bell, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Admin alerts are strictly operational — no health-condition-based alerts
interface OperationalAlert {
  id: string;
  node_id: string;
  type: 'offline' | 'malfunction' | 'connectivity' | 'sensor_error';
  message: string;
  severity: 'warning' | 'critical';
  timestamp: string;
  resolved: boolean;
}

const ALERT_TYPE_META: Record<OperationalAlert['type'], { label: string; icon: any; color: string }> = {
  offline:       { label: 'Node Offline',         icon: WifiOff, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  malfunction:   { label: 'Sensor Malfunction',   icon: Settings, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  connectivity:  { label: 'Connectivity Issue',   icon: Wifi, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  sensor_error:  { label: 'Out-of-Range Reading', icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
};

const DEMO_ALERTS: OperationalAlert[] = [
  {
    id: 'op-1', node_id: 'node2', type: 'offline',
    message: 'Node unresponsive for > 5 minutes. Last seen 3h ago.',
    severity: 'critical', timestamp: new Date(Date.now() - 3600000).toISOString(), resolved: false,
  },
  {
    id: 'op-2', node_id: 'node3', type: 'sensor_error',
    message: 'VOC sensor returning values out of calibrated range (> 200kΩ).',
    severity: 'warning', timestamp: new Date(Date.now() - 1800000).toISOString(), resolved: false,
  },
  {
    id: 'op-3', node_id: 'node1', type: 'connectivity',
    message: 'Intermittent packet loss detected on MQTT channel.',
    severity: 'warning', timestamp: new Date(Date.now() - 7200000).toISOString(), resolved: true,
  },
];

export default function AdminAlertsScreen() {
  const [alerts, setAlerts] = useState<OperationalAlert[]>(DEMO_ALERTS);
  const [filter, setFilter] = useState<'all' | 'warning' | 'critical'>('all');
  const [typeFilter, setTypeFilter] = useState<OperationalAlert['type'] | 'all'>('all');

  const resolve = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  const filtered = alerts.filter(a => {
    if (filter !== 'all' && a.severity !== filter) return false;
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    return true;
  });

  const active = filtered.filter(a => !a.resolved);
  const resolved = filtered.filter(a => a.resolved);

  return (
    <AdminLayout title="Operational Alerts">
      <div className="flex flex-col gap-6">
        {/* Info banner */}
        <div className="flex items-center gap-3 px-5 py-3.5 bg-blue-500/8 border border-blue-500/20 rounded-2xl text-sm text-blue-200/80">
          <Bell className="w-4 h-4 text-blue-400 shrink-0" />
          Admin alerts are strictly operational: node offline, sensor errors, connectivity issues.
          Health-condition alerts are only surfaced to end users.
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total" value={alerts.length} />
          <StatCard label="Active" value={alerts.filter(a => !a.resolved).length} color="text-red-400" />
          <StatCard label="Critical" value={alerts.filter(a => a.severity === 'critical').length} color="text-orange-400" />
          <StatCard label="Resolved" value={alerts.filter(a => a.resolved).length} color="text-green-400" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/40" />
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/8">
              {(['all', 'warning', 'critical'] as const).map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                    filter === s ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
                  }`}
                >{s}</button>
              ))}
            </div>
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/8">
            {(['all', 'offline', 'malfunction', 'connectivity', 'sensor_error'] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                  typeFilter === t ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >{t.replace('_', ' ')}</button>
            ))}
          </div>
        </div>

        {/* Active alerts */}
        <section>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Active <span className="text-white/30 ml-1">({active.length})</span>
          </h2>
          {active.length === 0 ? (
            <div className="liquid-glass rounded-2xl p-12 text-center border border-white/5">
              <CheckCircle className="w-10 h-10 mx-auto text-green-500/40 mb-2" />
              <p className="text-white/50">All systems operational.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {active.map(alert => {
                  const meta = ALERT_TYPE_META[alert.type];
                  const MetaIcon = meta.icon;
                  return (
                    <motion.div
                      layout
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`liquid-glass rounded-2xl p-5 border-l-4 flex justify-between items-start gap-4 ${
                        alert.severity === 'critical'
                          ? 'border-l-red-500 bg-red-500/5'
                          : 'border-l-amber-500 bg-amber-500/5'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-xl border ${meta.color} shrink-0`}>
                          <MetaIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-base">{alert.node_id}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tight border ${
                              alert.severity === 'critical'
                                ? 'bg-red-500/20 text-red-300 border-red-500/20'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/20'
                            }`}>{alert.severity}</span>
                            <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                              {meta.label}
                            </span>
                          </div>
                          <p className="text-sm text-white/80">{alert.message}</p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-white/40">
                            <Clock className="w-3 h-3" />
                            {new Date(alert.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => resolve(alert.id)}
                        className="shrink-0 px-4 py-2 bg-white/8 hover:bg-green-500/20 hover:text-green-300 text-white/60 text-sm font-bold rounded-xl border border-white/8 hover:border-green-500/25 transition-all"
                      >
                        Resolve
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Resolved */}
        {resolved.length > 0 && (
          <section className="opacity-50">
            <h2 className="text-base font-bold text-white/40 mb-3">Resolved ({resolved.length})</h2>
            <div className="grid gap-3">
              {resolved.map(alert => (
                <div key={alert.id} className="liquid-glass rounded-xl p-4 flex items-center gap-4 text-sm border border-white/5">
                  <CheckCircle className="w-4 h-4 text-green-500/60 shrink-0" />
                  <span className="font-bold">{alert.node_id}</span>
                  <span className="text-white/40 flex-1">{alert.message.slice(0, 60)}…</span>
                  <span className="text-xs text-white/30">Resolved</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="liquid-glass rounded-xl p-4 border border-white/5">
      <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color || 'text-white'}`}>{value}</p>
    </div>
  );
}
