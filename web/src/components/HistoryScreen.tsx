import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { getAllNodes, getReadingsHistory } from '../services/api';
import { ChartSkeleton } from './LoadingSkeleton';
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
import { Download, Calendar, Filter } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface HistoryReading {
  bucket_time: string;
  node_id: string;
  avg_temperature: number;
  avg_humidity: number;
  avg_pm25: number;
  avg_pm10: number;
  avg_aqi: number;
  max_aqi: number;
  reading_count: number;
}

export default function HistoryScreen() {
  const { token } = useAuth();
  const { nodeId } = useParams();

  const [nodes, setNodes] = useState<{node_id: string; name: string}[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(nodeId || null);
  const [historyData, setHistoryData] = useState<HistoryReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const loadNodes = async () => {
      try {
        if (!token) return;
        const response = await getAllNodes(token);
        const nodeList = Array.isArray(response) ? response : [];
        setNodes(nodeList);
        if (!selectedNode && nodeList.length > 0) setSelectedNode(nodeList[0].node_id);
      } catch (err: unknown) { setError((err as Error).message); }
    };
    loadNodes();
  }, [token, selectedNode]);

  const loadHistory = useCallback(async () => {
    if (!token || !selectedNode) return;
    try {
      setLoading(true);
      const days = (new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 60 * 60 * 24);
      const bucket = days > 7 ? '1h' : '5m';
      const data = await getReadingsHistory(token, `${fromDate}T00:00:00Z`, `${toDate}T23:59:59Z`, selectedNode, bucket);
      setHistoryData(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: unknown) { setError((err as Error).message); } finally { setLoading(false); }
  }, [token, selectedNode, fromDate, toDate]);

  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHistory(); 
  }, [loadHistory]);

  const chartData = {
    labels: historyData.map(d => new Date(d.bucket_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
    datasets: [
      { label: 'AQI', data: historyData.map(d => d.avg_aqi), borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', tension: 0.3, fill: true },
      { label: 'Temp (°C)', data: historyData.map(d => d.avg_temperature), borderColor: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.1)', tension: 0.3 },
      { label: 'PM2.5', data: historyData.map(d => d.avg_pm25), borderColor: '#eab308', backgroundColor: 'rgba(234, 179, 8, 0.1)', tension: 0.3 },
    ],
  };

  return (
    <DashboardLayout title="Historical Trends">
      <div className="space-y-6">
        {/* Controls */}
        <div className="liquid-glass rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-5 border border-white/5 shadow-xl">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-1.5"><Filter className="w-3 h-3" /> Node</label>
            <select
              value={selectedNode || ''}
              onChange={(e) => setSelectedNode(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none"
            >
              {nodes.map(node => <option key={node.node_id} value={node.node_id}>{node.name || node.node_id}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3 h-3" /> From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3 h-3" /> To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white" />
          </div>

          <div className="flex items-end">
            <button onClick={loadHistory} className="w-full h-[42px] bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10">
              <Download className="w-4 h-4" /> Reload
            </button>
          </div>
        </div>

        {error && <AlertToast type="error" message={error} />}

        {/* Chart */}
        <div className="liquid-glass rounded-3xl p-8 border border-white/5 shadow-2xl min-h-[450px]">
          {loading ? <ChartSkeleton /> : historyData.length > 0 ? (
            <div className="h-[400px]">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { position: 'top' as const, labels: { color: 'rgba(255, 255, 255, 0.7)', font: { size: 12, weight: 'bold' }, padding: 20 } },
                    tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, titleFont: { size: 14 }, bodyFont: { size: 13 }, cornerRadius: 12, displayColors: true }
                  },
                  scales: {
                    x: { ticks: { color: 'rgba(255, 255, 255, 0.4)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { ticks: { color: 'rgba(255, 255, 255, 0.4)' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                  },
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 text-white/40">
              <Calendar className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">No data available for this range</p>
            </div>
          )}
        </div>

        {/* Stats */}
        {historyData.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryTile label="Avg AQI" value={(historyData.reduce((sum, d) => sum + d.avg_aqi, 0) / historyData.length).toFixed(0)} />
            <SummaryTile label="Max AQI" value={Math.max(...historyData.map(d => d.max_aqi))} />
            <SummaryTile label="Avg Temp" value={`${(historyData.reduce((sum, d) => sum + d.avg_temperature, 0) / historyData.length).toFixed(1)}°C`} />
            <SummaryTile label="Data Points" value={historyData.reduce((sum, d) => sum + d.reading_count, 0)} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function SummaryTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="liquid-glass rounded-2xl p-5 border border-white/5 flex flex-col gap-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
