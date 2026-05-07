import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getLatestReadings, getAllNodes, getAlerts } from '../../services/api';
import { useAuth } from '../../services/useAuth';
import { Activity, Cpu, AlertTriangle, Users, Wifi, WifiOff, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

const DEMO_SYSTEM = {
  readings: [
    { node_id: 'node1', aqi: 98, aqi_category: 'Moderate', temperature: 31.2, pm25: 34.7, battery_v: 3.82, status: 'online' },
    { node_id: 'node2', aqi: 68, aqi_category: 'Moderate', temperature: 29.8, pm25: 22.4, battery_v: 3.71, status: 'online' },
    { node_id: 'node3', aqi: 153, aqi_category: 'USG', temperature: 33.5, pm25: 58.3, battery_v: 3.61, status: 'online' },
  ],
  nodes: [
    { node_id: 'node1', name: 'RRCE', location_name: 'R.R. College of Engineering, Bangalore', status: 'online', assignedUser: 'user1' },
    { node_id: 'node2', name: 'RRDCH', location_name: 'RR Dental College & Hospital, Bangalore', status: 'online', assignedUser: null },
    { node_id: 'node3', name: 'RRMCH', location_name: 'RR Medical College & Hospital, Bangalore', status: 'online', assignedUser: null },
  ],
  alerts: [
    { alert_id: 'a1', node_id: 'node3', parameter: 'pm25', severity: 'critical', type: 'health' },
    { alert_id: 'a2', node_id: 'node3', parameter: 'aqi', severity: 'warning', type: 'health' },
  ],
  users: [
    { uid: '1', username: 'user1', displayName: 'Chirag Mehta', role: 'user', assignedNode: 'node1', status: 'active' },
    { uid: '2', username: 'admin1', displayName: 'System Administrator', role: 'admin', assignedNode: null, status: 'active' },
  ],
};

export default function AdminDashboard() {
  const { token } = useAuth();
  const isDemo = token?.startsWith('demo-token');

  const [readings, setReadings] = useState(isDemo ? DEMO_SYSTEM.readings : []);
  const [nodes, setNodes] = useState(isDemo ? DEMO_SYSTEM.nodes : []);
  const [alerts, setAlerts] = useState(isDemo ? DEMO_SYSTEM.alerts : []);

  useEffect(() => {
    if (isDemo) return;
    const load = async () => {
      try {
        const [r, n, a] = await Promise.all([
          getLatestReadings(token!),
          getAllNodes(token!),
          getAlerts(token!, 50),
        ]);
        setReadings(Array.isArray(r) ? r : [r]);
        setNodes(Array.isArray(n) ? n : []);
        setAlerts(Array.isArray(a) ? a.filter((x: any) => !x.acknowledged_at) : []);
      } catch { /* ignore */ }
    };
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, [token, isDemo]);

  const onlineNodes = nodes.filter((n: any) => n.status === 'online');
  const offlineNodes = nodes.filter((n: any) => n.status !== 'online');
  const unassignedNodes = nodes.filter((n: any) => !n.assignedUser);
  const avgAqi = readings.length
    ? Math.round(readings.reduce((s: number, r: any) => s + r.aqi, 0) / readings.length)
    : 0;

  const AUDIT_LOG = [
    { id: 1, action: 'Node assigned', detail: 'node1 → user1 (Chirag Mehta)', time: '2m ago', type: 'info' },
    { id: 2, action: 'User created', detail: 'user1@empyrean.io (role: user)', time: '10m ago', type: 'success' },
    { id: 3, action: 'Threshold changed', detail: 'PM2.5 → 55 µg/m³ on node3', time: '1h ago', type: 'warning' },
    { id: 4, action: 'Node offline', detail: 'node2 unresponsive for > 5 min', time: '3h ago', type: 'error' },
  ];

  return (
    <AdminLayout title="System Overview">
      <div className="flex flex-col gap-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminStatCard icon={Cpu} label="Total Nodes" value={nodes.length} color="text-blue-400" accent="blue" />
          <AdminStatCard icon={Wifi} label="Online" value={onlineNodes.length} color="text-green-400" accent="green" />
          <AdminStatCard icon={WifiOff} label="Offline" value={offlineNodes.length} color="text-red-400" accent="red" />
          <AdminStatCard icon={AlertTriangle} label="Active Alerts" value={alerts.length} color="text-amber-400" accent="amber" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminStatCard icon={TrendingUp} label="Avg System AQI" value={avgAqi} color="text-teal-400" accent="teal" />
          <AdminStatCard icon={Users} label="Total Users" value={DEMO_SYSTEM.users.length} color="text-purple-400" accent="purple" />
          <AdminStatCard
            icon={Activity}
            label="Unassigned Nodes"
            value={unassignedNodes.length}
            color={unassignedNodes.length > 0 ? 'text-amber-400' : 'text-green-400'}
            accent={unassignedNodes.length > 0 ? 'amber' : 'green'}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Node Status Grid */}
          <div className="liquid-glass rounded-2xl p-6 border border-white/5">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              Node Status
              {unassignedNodes.length > 0 && (
                <span className="ml-auto text-xs font-bold px-2 py-0.5 bg-amber-500/15 text-amber-300 rounded-full border border-amber-500/20">
                  {unassignedNodes.length} unassigned
                </span>
              )}
            </h2>
            <div className="space-y-3">
              {nodes.map((node: any, i: number) => (
                <motion.div
                  key={node.node_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-4 py-3 bg-white/3 rounded-xl border border-white/5"
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${node.status === 'online' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{node.name || node.node_id}</p>
                    <p className="text-xs text-white/40">{node.location_name || 'Unknown location'}</p>
                  </div>
                  {node.assignedUser ? (
                    <span className="text-xs px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full shrink-0">
                      {node.assignedUser}
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full shrink-0">
                      Unassigned
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Audit Log */}
          <div className="liquid-glass rounded-2xl p-6 border border-white/5">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {AUDIT_LOG.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 text-sm">
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                    entry.type === 'error' ? 'bg-red-400' :
                    entry.type === 'warning' ? 'bg-amber-400' :
                    entry.type === 'success' ? 'bg-green-400' : 'bg-blue-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white/90">{entry.action}</p>
                    <p className="text-xs text-white/40 truncate">{entry.detail}</p>
                  </div>
                  <span className="text-xs text-white/30 shrink-0">{entry.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div className="liquid-glass rounded-2xl p-6 border border-amber-500/15 bg-amber-500/5">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Operational Alerts
              <span className="ml-auto text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full font-bold">{alerts.length} active</span>
            </h2>
            <div className="grid gap-2">
              {alerts.slice(0, 8).map((alert: any) => (
                <div key={alert.alert_id} className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm border ${
                  alert.severity === 'critical'
                    ? 'bg-red-500/10 border-red-500/20 text-red-200'
                    : 'bg-amber-500/10 border-amber-500/15 text-amber-200'
                }`}>
                  <span className="font-bold">{alert.node_id}</span>
                  <span className="text-white/60">{alert.parameter?.toUpperCase()} threshold breach</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    alert.severity === 'critical' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>{alert.severity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function AdminStatCard({ icon: Icon, label, value, color, accent }: any) {
  const bg: Record<string, string> = {
    blue: 'bg-blue-500/8 border-blue-500/15',
    green: 'bg-green-500/8 border-green-500/15',
    red: 'bg-red-500/8 border-red-500/15',
    amber: 'bg-amber-500/8 border-amber-500/15',
    teal: 'bg-teal-500/8 border-teal-500/15',
    purple: 'bg-purple-500/8 border-purple-500/15',
  };
  return (
    <div className={`rounded-2xl p-5 flex flex-col gap-2 border ${bg[accent] || 'bg-white/5 border-white/5'}`}>
      <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${color} opacity-70`}>
        <Icon className="w-4 h-4" /> {label}
      </div>
      <span className="text-3xl font-bold tracking-tight">{value}</span>
    </div>
  );
}
