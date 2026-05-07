import { useEffect, useState } from 'react';
import { useAuth } from '../services/useAuth';
import { getAlerts, acknowledgeAlert } from '../services/api';
import { LoadingSkeleton } from './LoadingSkeleton';
import { AlertToast } from './AlertToast';
import DashboardLayout from './DashboardLayout';
import { CheckCircle, AlertTriangle, Clock, Filter, BellRing, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Alert {
  alert_id: string;
  node_id: string;
  parameter: string;
  value: number;
  threshold: number;
  severity: string;
  triggered_at: string;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
}

// Conditions that lower the effective AQI threshold
const SENSITIVE_CONDITIONS = ['Asthma', 'COPD', 'Elderly (60+)', 'Child (under 12)', 'Pregnant'];

const DEMO_ALERTS: Alert[] = [
  {
    alert_id: 'demo-alert-1', node_id: 'node1', parameter: 'pm25',
    value: 34.7, threshold: 35, severity: 'warning',
    triggered_at: new Date(Date.now() - 600000).toISOString(), acknowledged_at: null, acknowledged_by: null,
  },
];

export default function AlertsScreen() {
  const { token, user } = useAuth();
  const isDemo = token?.startsWith('demo-token');
  
  const assignedNode = user?.assignedNode || null;
  const healthConditions = user?.healthConditions ?? 
    JSON.parse(localStorage.getItem('empyrean_health_conditions') || '[]');
  const isSensitive = healthConditions.some((c: string) => SENSITIVE_CONDITIONS.includes(c));

  const [alerts, setAlerts] = useState<Alert[]>(isDemo ? DEMO_ALERTS : []);
  const [loading, setLoading] = useState(!isDemo);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      if (!token) return;
      const response = await getAlerts(token, 100, 0, severityFilter || undefined);
      let list = Array.isArray(response) ? response : [];
      // Filter to only the user's assigned node
      if (assignedNode) {
        list = list.filter((a: Alert) => a.node_id === assignedNode);
      }
      setAlerts(list);
      setError(null);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDemo) return;
    loadAlerts();
    const interval = setInterval(loadAlerts, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, severityFilter, isDemo]);

  const handleAcknowledge = async (alertId: string) => {
    if (!token) return;
    try {
      setAcknowledgingId(alertId);
      if (!isDemo) await acknowledgeAlert(token, alertId);
      setAlerts(prev => prev.map(a =>
        a.alert_id === alertId
          ? { ...a, acknowledged_at: new Date().toISOString(), acknowledged_by: user?.username || 'me' }
          : a
      ));
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setAcknowledgingId(null);
    }
  };

  const unacknowledged = alerts.filter(a => !a.acknowledged_at);
  const acknowledged = alerts.filter(a => !!a.acknowledged_at);

  return (
    <DashboardLayout title="My Alerts" alertCount={unacknowledged.length}>
      <div className="space-y-6">
        {error && <AlertToast type="error" message={error} />}

        {/* Personalized health context */}
        {isSensitive && (
          <div className="flex items-start gap-3 px-5 py-4 bg-pink-500/8 border border-pink-500/20 rounded-2xl">
            <Heart className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-pink-200">Personalized Alerts Active</p>
              <p className="text-xs text-pink-200/60 mt-0.5">
                Stricter AQI thresholds applied for your conditions:
                <span className="font-semibold"> {healthConditions.filter((c: string) => SENSITIVE_CONDITIONS.includes(c)).join(', ')}</span>
              </p>
            </div>
          </div>
        )}

        {/* Node context */}
        {assignedNode && (
          <p className="text-xs text-white/30">Showing alerts for your assigned node: <span className="font-bold text-white/60">{assignedNode}</span></p>
        )}

        {/* Filter Bar */}
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-white/40" />
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            {['all', 'warning', 'critical'].map((f) => (
              <button
                key={f}
                onClick={() => setSeverityFilter(f === 'all' ? null : f)}
                className={`px-6 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  (severityFilter === f || (f === 'all' && severityFilter === null))
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Unacknowledged */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/20">
              <BellRing className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-xl font-bold">Unacknowledged <span className="text-white/30 ml-1">({unacknowledged.length})</span></h2>
          </div>

          {loading ? <LoadingSkeleton /> : unacknowledged.length === 0 ? (
            <div className="liquid-glass rounded-2xl p-12 text-center border border-white/5">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500/40 mb-3" />
              <p className="text-white/50 font-medium">Clear skies! No active alerts for your node.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {unacknowledged.map(alert => (
                  <motion.div
                    layout
                    key={alert.alert_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`liquid-glass rounded-2xl p-5 border-l-4 flex justify-between items-center transition-all ${
                      alert.severity === 'critical' ? 'border-l-red-500 bg-red-500/5' : 'border-l-yellow-500 bg-yellow-500/5'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${alert.severity === 'critical' ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
                        <AlertTriangle className={`w-5 h-5 ${alert.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-lg">{alert.node_id}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                            alert.severity === 'critical' ? 'bg-red-500/20 text-red-200' : 'bg-yellow-500/20 text-yellow-200'
                          }`}>{alert.severity}</span>
                          {isSensitive && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 font-bold flex items-center gap-1">
                              <Heart className="w-2.5 h-2.5" /> Health
                            </span>
                          )}
                        </div>
                        <p className="text-white/80 font-medium">
                          {alert.parameter.toUpperCase()} reading of {alert.value.toFixed(1)} exceeded limit ({alert.threshold})
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(alert.triggered_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAcknowledge(alert.alert_id)}
                      disabled={acknowledgingId === alert.alert_id}
                      className="px-6 py-2.5 bg-white/10 hover:bg-white/20 disabled:bg-white/5 rounded-xl font-bold text-sm transition-all shadow-inner border border-white/5"
                    >
                      {acknowledgingId === alert.alert_id ? 'Acknowledging...' : 'Acknowledge'}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* History */}
        {acknowledged.length > 0 && (
          <section className="opacity-60">
            <h2 className="text-lg font-bold mb-4 text-white/40">Recently Acknowledged</h2>
            <div className="grid gap-3">
              {acknowledged.slice(0, 10).map(alert => (
                <div key={alert.alert_id} className="liquid-glass rounded-xl p-4 border border-white/5 flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500/60" />
                    <span className="font-bold">{alert.node_id}</span>
                    <span className="text-white/40">{alert.parameter} limit breach resolved</span>
                  </div>
                  <span className="text-xs text-white/30">Resolved at {new Date(alert.acknowledged_at!).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
