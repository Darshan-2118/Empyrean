import AdminLayout from '../../components/admin/AdminLayout';
import { BarChart2, TrendingUp, Wind, Thermometer, Activity } from 'lucide-react';

const NODES = ['node1', 'node2', 'node3'];

const DEMO_METRICS = [
  { node: 'node1', avgAqi: 88, avgPm25: 28.4, avgTemp: 30.1, readings: 1440, uptime: '99.8%' },
  { node: 'node2', avgAqi: 62, avgPm25: 18.9, avgTemp: 28.6, readings: 1380, uptime: '95.6%' },
  { node: 'node3', avgAqi: 134, avgPm25: 49.1, avgTemp: 32.8, readings: 1440, uptime: '99.9%' },
];

function AqiBar({ aqi }: { aqi: number }) {
  const w = Math.min((aqi / 200) * 100, 100);
  const color =
    aqi <= 50 ? '#22c55e' :
    aqi <= 100 ? '#eab308' :
    aqi <= 150 ? '#f97316' :
    '#ef4444';
  return (
    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
      <div style={{ width: `${w}%`, backgroundColor: color }} className="h-full rounded-full transition-all" />
    </div>
  );
}

export default function AdminAnalyticsScreen() {
  const systemAvgAqi = Math.round(DEMO_METRICS.reduce((s, m) => s + m.avgAqi, 0) / DEMO_METRICS.length);
  const systemAvgPm25 = (DEMO_METRICS.reduce((s, m) => s + m.avgPm25, 0) / DEMO_METRICS.length).toFixed(1);
  const totalReadings = DEMO_METRICS.reduce((s, m) => s + m.readings, 0);

  return (
    <AdminLayout title="System Analytics">
      <div className="flex flex-col gap-6">

        {/* System-wide summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard icon={Activity} label="System Avg AQI" value={systemAvgAqi} color="text-teal-400" />
          <MetricCard icon={Wind} label="Avg PM2.5" value={`${systemAvgPm25} µg`} color="text-purple-400" />
          <MetricCard icon={Thermometer} label="Nodes Monitored" value={NODES.length} color="text-blue-400" />
          <MetricCard icon={BarChart2} label="Total Readings (24h)" value={totalReadings.toLocaleString()} color="text-amber-400" />
        </div>

        {/* Per-node breakdown */}
        <div className="liquid-glass rounded-2xl p-6 border border-white/5">
          <h2 className="text-base font-bold mb-5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            Node Performance — Last 24 Hours
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/5">
                  <th className="py-3 pr-6">Node</th>
                  <th className="py-3 pr-6">Avg AQI</th>
                  <th className="py-3 pr-6">Avg PM2.5</th>
                  <th className="py-3 pr-6">Avg Temp</th>
                  <th className="py-3 pr-6">Readings</th>
                  <th className="py-3">Uptime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {DEMO_METRICS.map(m => (
                  <tr key={m.node} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 pr-6">
                      <span className="font-mono text-sm font-bold text-white/80">{m.node}</span>
                    </td>
                    <td className="py-4 pr-6">
                      <div className="flex flex-col gap-1.5 min-w-[100px]">
                        <span className="font-bold text-sm">{m.avgAqi}</span>
                        <AqiBar aqi={m.avgAqi} />
                      </div>
                    </td>
                    <td className="py-4 pr-6"><span className="text-sm">{m.avgPm25} µg/m³</span></td>
                    <td className="py-4 pr-6"><span className="text-sm">{m.avgTemp}°C</span></td>
                    <td className="py-4 pr-6"><span className="text-sm text-white/60">{m.readings.toLocaleString()}</span></td>
                    <td className="py-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        parseFloat(m.uptime) >= 99 ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                      }`}>{m.uptime}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AQI distribution chart (CSS-based bar chart) */}
        <div className="liquid-glass rounded-2xl p-6 border border-white/5">
          <h2 className="text-base font-bold mb-5 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-400" />
            AQI Distribution (Simulated 24h)
          </h2>
          <div className="flex items-end gap-2 h-32">
            {[
              { label: '0-50', height: 15, color: '#22c55e', count: 210 },
              { label: '51-100', height: 55, color: '#eab308', count: 780 },
              { label: '101-150', height: 25, color: '#f97316', count: 350 },
              { label: '151-200', height: 10, color: '#ef4444', count: 140 },
              { label: '200+', height: 5, color: '#dc2626', count: 60 },
            ].map(bar => (
              <div key={bar.label} className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-[10px] text-white/40">{bar.count}</span>
                <div
                  className="w-full rounded-t-lg transition-all"
                  style={{ height: `${bar.height * 0.9}%`, backgroundColor: bar.color, opacity: 0.8 }}
                />
                <span className="text-[10px] text-white/40">{bar.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 flex-wrap">
            {[
              { label: 'Good', color: '#22c55e' },
              { label: 'Moderate', color: '#eab308' },
              { label: 'USG', color: '#f97316' },
              { label: 'Unhealthy', color: '#ef4444' },
              { label: 'Very Unhealthy', color: '#dc2626' },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1.5 text-xs text-white/50">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function MetricCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="liquid-glass rounded-2xl p-5 flex flex-col gap-2 border border-white/5">
      <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-70 ${color}`}>
        <Icon className="w-4 h-4" /> {label}
      </div>
      <span className="text-3xl font-bold tracking-tight">{value}</span>
    </div>
  );
}
