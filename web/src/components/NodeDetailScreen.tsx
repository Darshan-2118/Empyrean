import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { getLatestReadings, getReadingsHistory, getForecast } from '../services/api';
import { AQIBadge } from './AQIBadge';
import { LoadingSkeleton } from './LoadingSkeleton';
import { AlertToast } from './AlertToast';
import DashboardLayout from './DashboardLayout';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Battery, Thermometer, Droplets, Clock, ShieldCheck, Zap } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Reading {
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

interface ForecastData {
  timestamp: string;
  aqi_forecast: number;
}

export default function NodeDetailScreen() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { token } = useAuth();

  const [reading, setReading] = useState<Reading | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!token || !nodeId) return;
      try {
        setLoading(true);
        const latestResponse = await getLatestReadings(token, nodeId);
        const readings = Array.isArray(latestResponse) ? latestResponse : [latestResponse];
        if (readings.length > 0) setReading(readings[0]);

        const forecastResponse = await getForecast(token, nodeId);
        setForecast(Array.isArray(forecastResponse) ? forecastResponse : []);

        const now = new Date();
        const from24hAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const historyResponse = await getReadingsHistory(token, from24hAgo.toISOString(), now.toISOString(), nodeId, '1h');
        setHistoryData(Array.isArray(historyResponse) ? historyResponse : []);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [token, nodeId]);

  if (loading && !reading) return <DashboardLayout title="Loading Node..."><LoadingSkeleton /></DashboardLayout>;
  if (!reading) return <DashboardLayout title="Error"><div className="text-center py-20 text-white/50">Node not found or data unavailable.</div></DashboardLayout>;

  const historyChartData = {
    labels: historyData.map(d => new Date(d.bucket_time).toLocaleTimeString([], { hour: '2-digit' })),
    datasets: [{ label: '24h AQI Trend', data: historyData.map(d => d.avg_aqi), borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', tension: 0.4, fill: true }],
  };

  const forecastChartData = {
    labels: forecast.slice(0, 12).map(f => new Date(f.timestamp).toLocaleTimeString([], { hour: '2-digit' })),
    datasets: [{ label: '12h AQI Forecast', data: forecast.slice(0, 12).map(f => f.aqi_forecast), borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', tension: 0.4, fill: true }],
  };

  return (
    <DashboardLayout title={`Node: ${nodeId}`}>
      <div className="space-y-6">
        {error && <AlertToast type="error" message={error} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Index & Pollutants */}
          <div className="lg:col-span-1 space-y-6">
            <div className="liquid-glass rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col items-center text-center">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/40 mb-6">Current Air Quality</h2>
              <AQIBadge aqi={reading.aqi} category={reading.aqi_category} size="lg" />
              <div className="mt-6 flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span className="text-xs font-bold text-white/70">Fuzzy Logic Score: {reading.fuzzy_score.toFixed(1)}</span>
              </div>
            </div>

            <div className="liquid-glass rounded-3xl p-6 border border-white/10 space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-white/40 border-b border-white/5 pb-3">Pollutant Breakdown</h2>
              <PollutantRow label="PM 2.5" value={reading.pm25.toFixed(1)} unit="μg/m³" />
              <PollutantRow label="PM 10" value={reading.pm10.toFixed(1)} unit="μg/m³" />
              <PollutantRow label="PM 1.0" value={reading.pm1.toFixed(1)} unit="μg/m³" />
              <PollutantRow label="CO2 (MQ135)" value={reading.mq135_ppm.toFixed(0)} unit="ppm" />
            </div>
          </div>

          {/* Middle Column: Environment & Status */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatusCard icon={Thermometer} label="Temperature" value={`${reading.temperature.toFixed(1)}°C`} color="text-orange-400" />
              <StatusCard icon={Droplets} label="Humidity" value={`${reading.humidity.toFixed(0)}%`} color="text-blue-400" />
              <StatusCard icon={Zap} label="VOC Resistance" value={`${(reading.voc_ohm / 1000).toFixed(1)}kΩ`} color="text-purple-400" />
            </div>

            <div className="liquid-glass rounded-3xl p-8 border border-white/10 shadow-xl">
              <h2 className="text-sm font-bold mb-6 flex items-center gap-2"><Clock className="w-4 h-4 text-white/40" /> 24-Hour Trend Analysis</h2>
              <div className="h-[250px]">
                {historyData.length > 0 ? (
                  <Line data={historyChartData} options={chartOptions} />
                ) : <div className="flex items-center justify-center h-full text-white/20">Insufficient history data</div>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="liquid-glass rounded-3xl p-6 border border-white/10">
                  <h2 className="text-sm font-bold mb-4 flex items-center gap-2"><Battery className="w-4 h-4 text-green-400" /> Power & System</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-white/40">Voltage</span><span className="font-mono">{reading.battery_v.toFixed(2)}V</span></div>
                    <div className="flex justify-between"><span className="text-white/40">Last Sync</span><span>{new Date(reading.timestamp).toLocaleTimeString()}</span></div>
                  </div>
               </div>
               {forecast.length > 0 && (
                  <div className="liquid-glass rounded-3xl p-6 border border-white/10">
                    <h2 className="text-sm font-bold mb-4">AQI Forecast (12h)</h2>
                    <div className="h-[100px]">
                      <Line data={forecastChartData} options={{...chartOptions, plugins: {legend: {display: false}}}} />
                    </div>
                  </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function PollutantRow({ label, value, unit }: any) {
  return (
    <div className="flex justify-between items-center group">
      <span className="text-sm text-white/60 group-hover:text-white transition-colors">{label}</span>
      <div className="text-right">
        <span className="font-bold">{value}</span>
        <span className="text-[10px] text-white/30 ml-1 uppercase">{unit}</span>
      </div>
    </div>
  );
}

function StatusCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="liquid-glass rounded-2xl p-5 border border-white/5 flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-white/5 ${color}`}><Icon className="w-5 h-5" /></div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-tighter text-white/30">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { cornerRadius: 8, padding: 10 } },
  scales: {
    x: { ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } }, grid: { display: false } },
    y: { ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } }
  }
};
