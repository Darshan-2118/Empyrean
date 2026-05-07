import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../services/useAuth';
import { getLatestReadings, getAlerts } from '../services/api';
import { Map } from './Map';
import { AQIBadge } from './AQIBadge';
import { LoadingSkeleton } from './LoadingSkeleton';
import { AlertToast } from './AlertToast';
import { Activity, Wind, Thermometer, Droplets, Battery, Bell, LogOut, LayoutDashboard, History as HistoryIcon, Settings, AlertTriangle, Users } from 'lucide-react';

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

export default function DashboardPage() {
  const navigate = useNavigate();
  const { token, logout, user } = useAuth();

  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load readings and alerts
  useEffect(() => {
    const loadData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        
        // Load latest readings
        const readingsResponse = await getLatestReadings(token);
        const readingsList = Array.isArray(readingsResponse) ? readingsResponse : [readingsResponse];
        setReadings(readingsList);

        // Load unacknowledged alerts
        const alertsResponse = await getAlerts(token, 10);
        const alertsList = Array.isArray(alertsResponse) ? alertsResponse : [];
        setAlerts(alertsList.filter(a => !a.acknowledged_at));

        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // Poll every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNodeClick = (nodeId: string) => {
    navigate(`/dashboard/node/${nodeId}`);
  };

  const avgAqi = readings.length ? Math.round(readings.reduce((acc, r) => acc + r.aqi, 0) / readings.length) : 0;
  const avgTemp = readings.length ? (readings.reduce((acc, r) => acc + r.temperature, 0) / readings.length).toFixed(1) : 0;
  const onlineNodes = readings.length;

  return (
    <div className="relative min-h-screen w-full bg-black text-white font-sans overflow-hidden flex">
      
      {/* Background Video (Static) */}
      <video
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-40"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4#t=0.1"
      />

      {/* Sidebar */}
      <aside className="relative z-10 w-64 liquid-glass-strong border-r border-white/10 flex flex-col justify-between py-8 px-4 h-screen backdrop-blur-2xl">
        <div>
          <div className="flex items-center gap-3 px-4 mb-10">
            <img src="/finallogo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-semibold tracking-wide">EMPYREAN</span>
          </div>

          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white shadow-inner transition-all"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>
            <button 
              onClick={() => navigate('/dashboard/history')} 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <HistoryIcon className="w-5 h-5" />
              <span className="font-medium">History</span>
            </button>
            <button 
              onClick={() => navigate('/dashboard/alerts')} 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all relative"
            >
              <Bell className="w-5 h-5" />
              <span className="font-medium">Alerts</span>
              {alerts.length > 0 && (
                <span className="absolute right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
            
            {user?.role === 'admin' && (
              <>
                <hr className="my-2 border-white/10" />
                <button 
                  onClick={() => navigate('/admin/nodes')} 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Nodes</span>
                </button>
                <button 
                  onClick={() => navigate('/admin/settings')} 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </button>
              </>
            )}
          </nav>
        </div>

        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="w-full h-20 liquid-glass border-b border-white/5 flex items-center justify-between px-8 backdrop-blur-xl shrink-0">
          <h1 className="text-2xl font-semibold">Live Dashboard</h1>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center border border-white/20 shadow-lg">
            <span className="font-semibold text-sm">{user?.username?.[0]?.toUpperCase() || 'U'}</span>
          </div>
        </header>

        {/* Dashboard View */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
            
            {error && <AlertToast type="error" message={error} />}

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="liquid-glass rounded-2xl p-6 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                  <Activity className="w-4 h-4 text-blue-400" /> Active Nodes
                </div>
                <span className="text-3xl font-bold">{onlineNodes}</span>
              </div>
              <div className="liquid-glass rounded-2xl p-6 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                  <Wind className="w-4 h-4 text-teal-400" /> Avg AQI
                </div>
                <span className="text-3xl font-bold">{avgAqi}</span>
              </div>
              <div className="liquid-glass rounded-2xl p-6 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                  <Thermometer className="w-4 h-4 text-orange-400" /> Avg Temp
                </div>
                <span className="text-3xl font-bold">{avgTemp}°C</span>
              </div>
              <div className="liquid-glass rounded-2xl p-6 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                  <AlertTriangle className="w-4 h-4 text-red-400" /> Active Alerts
                </div>
                <span className="text-3xl font-bold">{alerts.length}</span>
              </div>
            </div>

            <h2 className="text-xl font-semibold mt-4 border-b border-white/10 pb-2">Live Sensor Network</h2>

            {/* Map & Node List */}
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Map */}
                <div className="h-full min-h-[500px]">
                  <Map 
                    readings={readings}
                    onMarkerClick={(reading) => handleNodeClick(reading.node_id)}
                  />
                </div>

                {/* Node Cards */}
                <div className="grid grid-cols-1 gap-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                  <AnimatePresence>
                    {readings.length === 0 ? (
                      <div className="col-span-1 text-center py-12 text-white/60">
                        No sensor readings available
                      </div>
                    ) : (
                      readings.map((reading) => (
                        <motion.div 
                          key={reading.node_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="liquid-glass rounded-3xl p-6 relative overflow-hidden group cursor-pointer hover:bg-white/10 transition-all"
                          onClick={() => handleNodeClick(reading.node_id)}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold flex items-center gap-2">
                                {reading.node_id}
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                              </h3>
                              <p className="text-white/50 text-xs mt-1">
                                {reading.lat.toFixed(4)}, {reading.lon.toFixed(4)}
                              </p>
                            </div>
                            <AQIBadge aqi={reading.aqi} category={reading.aqi_category} size="sm" />
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                            <div className="bg-black/20 rounded-xl p-3 flex flex-col gap-1">
                              <span className="text-white/50 text-xs flex items-center gap-1"><Wind className="w-3 h-3" /> PM2.5</span>
                              <span className="font-semibold">{reading.pm25.toFixed(0)}</span>
                            </div>
                            <div className="bg-black/20 rounded-xl p-3 flex flex-col gap-1">
                              <span className="text-white/50 text-xs flex items-center gap-1"><Thermometer className="w-3 h-3" /> Temp</span>
                              <span className="font-semibold">{reading.temperature.toFixed(1)}°C</span>
                            </div>
                            <div className="bg-black/20 rounded-xl p-3 flex flex-col gap-1">
                              <span className="text-white/50 text-xs flex items-center gap-1"><Droplets className="w-3 h-3" /> Humid</span>
                              <span className="font-semibold">{reading.humidity.toFixed(0)}%</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-xs text-white/40 mt-4 pt-3 border-t border-white/5">
                            <span className="flex items-center gap-1"><Battery className="w-3 h-3" /> {reading.battery_v.toFixed(2)}V</span>
                            <span>{new Date(reading.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Recent Alerts */}
            {alerts.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mt-8 border-b border-white/10 pb-2">Recent Alerts</h2>
                <div className="grid grid-cols-1 gap-3">
                  {alerts.slice(0, 5).map(alert => (
                    <div 
                      key={alert.alert_id} 
                      className={`liquid-glass rounded-2xl p-4 border-l-4 ${
                        alert.severity === 'critical' ? 'border-l-red-500' : 'border-l-yellow-500'
                      } flex justify-between items-center`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`w-5 h-5 mt-0.5 ${alert.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'}`} />
                        <div>
                          <p className="font-semibold text-sm">{alert.node_id} - {alert.parameter.toUpperCase()} Alert</p>
                          <p className="text-white/60 text-xs">Value: {alert.value.toFixed(1)} (Threshold: {alert.threshold.toFixed(1)})</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/dashboard/alerts')}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-medium transition-all"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
