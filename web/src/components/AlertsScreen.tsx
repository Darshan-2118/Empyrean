import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { getAlerts, acknowledgeAlert } from '../services/api';
import { LoadingSkeleton } from './LoadingSkeleton';
import { AlertToast } from './AlertToast';
import { ArrowLeft, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

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

export default function AlertsScreen() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  // Load alerts
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        if (!token) return;
        setLoading(true);
        const response = await getAlerts(token, 100, 0, severityFilter || undefined);
        setAlerts(Array.isArray(response) ? response : []);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
    // Poll every 10 seconds
    const interval = setInterval(loadAlerts, 10000);
    return () => clearInterval(interval);
  }, [token, severityFilter]);

  const handleAcknowledge = async (alertId: string) => {
    if (!token) return;
    
    try {
      setAcknowledgingId(alertId);
      await acknowledgeAlert(token, alertId);
      setAlerts(alerts.filter(a => a.alert_id !== alertId));
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAcknowledgingId(null);
    }
  };

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged_at);
  const acknowledgedAlerts = alerts.filter(a => a.acknowledged_at);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Alerts</h1>
          <p className="text-white/60">Threshold breach notifications</p>
        </div>

        {error && <AlertToast type="error" message={error} />}

        {/* Controls */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSeverityFilter(null)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              severityFilter === null
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSeverityFilter('warning')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              severityFilter === 'warning'
                ? 'bg-yellow-600 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Warnings
          </button>
          <button
            onClick={() => setSeverityFilter('critical')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              severityFilter === 'critical'
                ? 'bg-red-600 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Critical
          </button>
        </div>

        {/* Unacknowledged Alerts */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            Unacknowledged ({unacknowledgedAlerts.length})
          </h2>

          {loading && <LoadingSkeleton />}

          {!loading && unacknowledgedAlerts.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-3" />
              <p className="text-white/60">All alerts acknowledged!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unacknowledgedAlerts.map(alert => (
                <div
                  key={alert.alert_id}
                  className={`border rounded-lg p-4 ${
                    alert.severity === 'critical'
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-yellow-500/10 border-yellow-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.severity === 'critical'
                            ? 'bg-red-500/20 text-red-200'
                            : 'bg-yellow-500/20 text-yellow-200'
                        }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-white font-semibold">{alert.node_id}</span>
                      </div>
                      <p className="text-white/80 mb-1">
                        {alert.parameter.toUpperCase()} threshold breach
                      </p>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>Value: {alert.value.toFixed(1)}</span>
                        <span>Threshold: {alert.threshold.toFixed(1)}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(alert.triggered_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAcknowledge(alert.alert_id)}
                      disabled={acknowledgingId === alert.alert_id}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-white/10 text-white rounded-lg transition-colors whitespace-nowrap"
                    >
                      {acknowledgingId === alert.alert_id ? 'Acknowledging...' : 'Acknowledge'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acknowledged Alerts */}
        {acknowledgedAlerts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              Acknowledged ({acknowledgedAlerts.length})
            </h2>

            <div className="space-y-3">
              {acknowledgedAlerts.map(alert => (
                <div
                  key={alert.alert_id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 opacity-70"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-200">
                          ACKNOWLEDGED
                        </span>
                        <span className="text-white font-semibold">{alert.node_id}</span>
                      </div>
                      <p className="text-white/60 mb-1">
                        {alert.parameter.toUpperCase()} threshold breach
                      </p>
                      <div className="text-sm text-white/40">
                        Acknowledged by {alert.acknowledged_by} at {new Date(alert.acknowledged_at!).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
