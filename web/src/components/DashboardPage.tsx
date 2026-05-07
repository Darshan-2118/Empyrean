import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../services/useAuth';
import { getLatestReadings, getAlerts } from '../services/api';
import { Map } from './Map';
import { AQIBadge } from './AQIBadge';
import { LoadingSkeleton } from './LoadingSkeleton';
import { AlertToast } from './AlertToast';
import DashboardLayout from './DashboardLayout';
import { Activity, Wind, Thermometer, Battery, AlertTriangle, Cpu } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SensorReading {
  node_id: string;
  lat: number;
  lon: number;
  temperature: number;
  humidity: number;
  pressure: number;
  voc_ohm: number;
  mq135_ppm: number;
  pm1: number;
  pm25: number;
  pm10: number;
  fuzzy_score: number;
  aqi: number;
  aqi_category: string;
  battery_v: number;
  timestamp: string;
}

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

// Demo readings keyed by node_id
const DEMO_READINGS: Record<string, SensorReading> = {
  'node1': {
    node_id: 'node1', lat: 12.88705, lon: 77.450153,
    temperature: 31.2, humidity: 45, pressure: 1012.5, voc_ohm: 45000,
    mq135_ppm: 320, pm1: 12.5, pm25: 34.7, pm10: 45.2,
    fuzzy_score: 95, aqi: 98, aqi_category: 'Moderate',
    battery_v: 3.82, timestamp: new Date().toISOString(),
  },
  'node2': {
    node_id: 'node2', lat: 12.8767, lon: 77.4475,
    temperature: 29.8, humidity: 55, pressure: 1013.2, voc_ohm: 48000,
    mq135_ppm: 280, pm1: 8.4, pm25: 22.4, pm10: 30.1,
    fuzzy_score: 98, aqi: 68, aqi_category: 'Moderate',
    battery_v: 3.71, timestamp: new Date().toISOString(),
  },
  'node3': {
    node_id: 'node3', lat: 12.896255, lon: 77.461852,
    temperature: 33.5, humidity: 70, pressure: 1011.8, voc_ohm: 38000,
    mq135_ppm: 450, pm1: 28.9, pm25: 58.3, pm10: 78.4,
    fuzzy_score: 88, aqi: 153, aqi_category: 'Unhealthy for Sensitive Groups',
    battery_v: 3.61, timestamp: new Date().toISOString(),
  },
};

const DEMO_ALERTS: Alert[] = [
  {
    alert_id: 'demo-alert-1', node_id: 'node3', parameter: 'pm25',
    value: 58.3, threshold: 55.4, severity: 'warning',
    triggered_at: new Date().toISOString(), acknowledged_at: null, acknowledged_by: null,
  },
  {
    alert_id: 'demo-alert-2', node_id: 'node3', parameter: 'aqi',
    value: 153, threshold: 150, severity: 'critical',
    triggered_at: new Date().toISOString(), acknowledged_at: null, acknowledged_by: null,
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const isDemo = token?.startsWith('demo-token');
  
  // The user's assigned node — from auth context (set by admin or demo seed)
  const assignedNode = user?.assignedNode || 'node1';

  // Health conditions from auth context or localStorage
  const healthConditions = user?.healthConditions ?? 
    JSON.parse(localStorage.getItem('empyrean_health_conditions') || '[]');
  const hasSensitiveCondition = healthConditions.some((c: string) =>
    ['Asthma', 'COPD', 'Elderly (60+)', 'Child (under 12)', 'Pregnant'].includes(c)
  );

  // Filter demo data to only the assigned node
  const demoReading = DEMO_READINGS[assignedNode] || DEMO_READINGS['node1'];
  const demoAlerts = DEMO_ALERTS.filter(a => a.node_id === assignedNode);

  const [reading, setReading] = useState<SensorReading | null>(isDemo ? demoReading : null);
  const [alerts, setAlerts] = useState<Alert[]>(isDemo ? demoAlerts : []);
  const [loading, setLoading] = useState(!isDemo);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemo) return;
    const loadData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        // Fetch only the assigned node's reading
        const readingsResponse = await getLatestReadings(token, assignedNode);
        const readingsList = Array.isArray(readingsResponse) ? readingsResponse : [readingsResponse];
        const nodeReading = readingsList.find((r: SensorReading) => r.node_id === assignedNode) || readingsList[0];
        setReading(nodeReading || null);

        const alertsResponse = await getAlerts(token, 20);
        const alertsList = Array.isArray(alertsResponse) ? alertsResponse : [];
        // Only show alerts for this user's node
        setAlerts(alertsList.filter((a: Alert) => !a.acknowledged_at && a.node_id === assignedNode));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [token, isDemo, assignedNode]);

  const showHealthWarning = hasSensitiveCondition && (reading?.aqi ?? 0) >= 51;

  return (
    <DashboardLayout title="My Dashboard" alertCount={alerts.length}>
      <div className="flex flex-col gap-6">
        {error && <AlertToast type="error" message={error} />}

        {/* Assigned Node Banner */}
        <div className="flex items-center gap-3 px-5 py-3.5 bg-blue-500/8 border border-blue-500/20 rounded-2xl">
          <Cpu className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-300/50">Your Assigned Node</p>
            <p className="text-sm font-bold text-blue-200">{assignedNode}</p>
          </div>
          {reading && (
            <div className="ml-auto">
              <span className={`w-2 h-2 rounded-full inline-block animate-pulse mr-1.5 ${
                reading.aqi <= 50 ? 'bg-green-400' :
                reading.aqi <= 100 ? 'bg-yellow-400' :
                reading.aqi <= 150 ? 'bg-orange-400' : 'bg-red-500'
              }`} />
              <span className="text-xs text-white/50">Live</span>
            </div>
          )}
        </div>

        {/* Health Warning Banner */}
        {showHealthWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="liquid-glass rounded-xl p-4 border border-yellow-500/30 bg-yellow-500/10 flex items-center gap-4 shadow-lg shadow-yellow-500/5"
          >
            <AlertTriangle className="w-6 h-6 text-yellow-400 shrink-0" />
            <div>
              <p className="font-bold text-yellow-200">Personalized Health Advisory</p>
              <p className="text-sm text-yellow-100/70">
                Current AQI is {reading?.aqi} ({reading?.aqi_category}). Due to your health conditions, consider reducing prolonged outdoor exertion.
              </p>
            </div>
          </motion.div>
        )}

        {/* Overview Stats */}
        {reading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Activity} label="AQI" value={reading.aqi} color="text-teal-400" />
            <StatCard icon={Wind} label="PM2.5" value={`${reading.pm25.toFixed(1)} µg`} color="text-purple-400" />
            <StatCard icon={Thermometer} label="Temperature" value={`${reading.temperature.toFixed(1)}°C`} color="text-orange-400" />
            <StatCard icon={AlertTriangle} label="Active Alerts" value={alerts.length} color="text-red-400" />
          </div>
        )}

        <h2 className="text-xl font-semibold mt-2 border-b border-white/10 pb-2">Live Sensor Data</h2>

        {loading ? (
          <LoadingSkeleton />
        ) : !reading ? (
          <div className="text-center py-16 text-white/40">
            <Cpu className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No readings available for {assignedNode}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="h-[480px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <Map readings={[reading]} onMarkerClick={() => navigate(`/dashboard/node/${reading.node_id}`)} />
            </div>

            <div className="flex flex-col gap-4">
              <AnimatePresence>
                <motion.div
                  key={reading.node_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="liquid-glass rounded-2xl p-6 border border-white/5 hover:border-white/15 transition-all cursor-pointer"
                  onClick={() => navigate(`/dashboard/node/${reading.node_id}`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{reading.node_id}</h3>
                      <span className={`w-2 h-2 rounded-full animate-pulse ${
                        reading.aqi <= 50 ? 'bg-green-400' :
                        reading.aqi <= 100 ? 'bg-yellow-400' :
                        reading.aqi <= 150 ? 'bg-orange-400' :
                        'bg-red-500'
                      }`} />
                    </div>
                    <AQIBadge aqi={reading.aqi} category={reading.aqi_category} size="sm" />
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <DetailStat label="PM1.0" value={`${reading.pm1.toFixed(0)} µg`} />
                    <DetailStat label="PM2.5" value={`${reading.pm25.toFixed(0)} µg`} />
                    <DetailStat label="PM10" value={`${reading.pm10.toFixed(0)} µg`} />
                    <DetailStat label="Temperature" value={`${reading.temperature.toFixed(1)}°C`} />
                    <DetailStat label="Humidity" value={`${reading.humidity.toFixed(0)}%`} />
                    <DetailStat label="Pressure" value={`${reading.pressure.toFixed(0)} hPa`} />
                    <DetailStat label="VOC" value={`${(reading.voc_ohm / 1000).toFixed(0)}kΩ`} />
                    <DetailStat label="MQ-135" value={`${reading.mq135_ppm.toFixed(0)} ppm`} />
                    <DetailStat label="Fuzzy Score" value={reading.fuzzy_score.toFixed(0)} />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-white/30 pt-3 border-t border-white/5">
                    <span className="flex items-center gap-1"><Battery className="w-3 h-3" /> {reading.battery_v.toFixed(2)}V</span>
                    <span>Updated {new Date(reading.timestamp).toLocaleTimeString()}</span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Active Alerts */}
              {alerts.length > 0 && (
                <div className="liquid-glass rounded-2xl p-5 border border-red-500/20 bg-red-500/5">
                  <h4 className="font-bold text-sm text-red-300 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Active Alerts for {assignedNode}
                  </h4>
                  <div className="space-y-2">
                    {alerts.slice(0, 5).map(alert => (
                      <div key={alert.alert_id} className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg ${
                        alert.severity === 'critical' ? 'bg-red-500/15 text-red-200' : 'bg-yellow-500/15 text-yellow-200'
                      }`}>
                        <span className="font-bold uppercase">{alert.parameter}</span>
                        <span>{alert.value.toFixed(1)} {'>'} {alert.threshold}</span>
                        <span className="uppercase font-black tracking-wider text-[9px] opacity-70">{alert.severity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div className="liquid-glass rounded-2xl p-5 flex flex-col gap-2 border border-white/5">
      <div className="flex items-center gap-2 text-white/60 text-xs font-medium uppercase tracking-wider">
        <Icon className={`w-4 h-4 ${color}`} /> {label}
      </div>
      <span className="text-3xl font-bold tracking-tight">{value}</span>
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-black/20 rounded-lg p-2.5 border border-white/5">
      <p className="text-white/40 text-[10px] uppercase font-bold tracking-tighter">{label}</p>
      <p className="font-semibold text-sm mt-0.5">{value}</p>
    </div>
  );
}
