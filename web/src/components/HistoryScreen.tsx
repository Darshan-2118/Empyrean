import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { getAllNodes, getReadingsHistory } from '../services/api';
import { ChartSkeleton } from './LoadingSkeleton';
import { AlertToast } from './AlertToast';
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
import { ArrowLeft, Download, Calendar } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
  const navigate = useNavigate();
  const { token } = useAuth();
  const { nodeId } = useParams();

  const [nodes, setNodes] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(nodeId || null);
  const [historyData, setHistoryData] = useState<HistoryReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Default to 7 days ago
    return date.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Load nodes
  useEffect(() => {
    const loadNodes = async () => {
      try {
        if (!token) return;
        const response = await getAllNodes(token);
        const nodeList = Array.isArray(response) ? response : [];
        setNodes(nodeList);
        if (!selectedNode && nodeList.length > 0) {
          setSelectedNode(nodeList[0].node_id);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };
    loadNodes();
  }, [token, selectedNode]);

  // Load history
  const loadHistory = useCallback(async () => {
    if (!token || !selectedNode) return;
    
    try {
      setLoading(true);
      const range = new Date(toDate).getTime() - new Date(fromDate).getTime();
      const days = range / (1000 * 60 * 60 * 24);
      const bucket = days > 7 ? '1h' : '5m';

      const data = await getReadingsHistory(
        token,
        `${fromDate}T00:00:00Z`,
        `${toDate}T23:59:59Z`,
        selectedNode,
        bucket
      );
      
      setHistoryData(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, selectedNode, fromDate, toDate]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const chartData = {
    labels: historyData.map(d => new Date(d.bucket_time).toLocaleTimeString()),
    datasets: [
      {
        label: 'AQI',
        data: historyData.map(d => d.avg_aqi),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.1,
      },
      {
        label: 'Temperature (°C)',
        data: historyData.map(d => d.avg_temperature),
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.1,
      },
      {
        label: 'PM2.5 (μg/m³)',
        data: historyData.map(d => d.avg_pm25),
        borderColor: '#eab308',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        tension: 0.1,
      },
    ],
  };

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
          <h1 className="text-4xl font-bold mb-2">Historical Trends</h1>
          <p className="text-white/60">Analyze sensor data over time</p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-2">Sensor Node</label>
            <select
              value={selectedNode || ''}
              onChange={(e) => setSelectedNode(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              {nodes.map(node => (
                <option key={node.node_id} value={node.node_id}>
                  {node.name || node.node_id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={loadHistory}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Reload
            </button>
          </div>
        </div>

        {error && <AlertToast type="error" message={error} />}

        {/* Chart */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          {loading ? (
            <ChartSkeleton />
          ) : historyData.length > 0 ? (
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    labels: { color: 'rgba(255, 255, 255, 0.7)' },
                  },
                  title: {
                    display: true,
                    text: 'Sensor Readings Over Time',
                    color: 'rgba(255, 255, 255, 0.9)',
                  },
                },
                scales: {
                  x: {
                    ticks: { color: 'rgba(255, 255, 255, 0.5)' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                  },
                  y: {
                    ticks: { color: 'rgba(255, 255, 255, 0.5)' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                  },
                },
              }}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-white/60">No data available for the selected date range</p>
            </div>
          )}
        </div>

        {/* Stats */}
        {historyData.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-white/60 text-sm">Avg AQI</p>
              <p className="text-2xl font-bold">{(historyData.reduce((sum, d) => sum + d.avg_aqi, 0) / historyData.length).toFixed(0)}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-white/60 text-sm">Max AQI</p>
              <p className="text-2xl font-bold">{Math.max(...historyData.map(d => d.max_aqi))}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-white/60 text-sm">Avg Temp</p>
              <p className="text-2xl font-bold">{(historyData.reduce((sum, d) => sum + d.avg_temperature, 0) / historyData.length).toFixed(1)}°C</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-white/60 text-sm">Readings</p>
              <p className="text-2xl font-bold">{historyData.reduce((sum, d) => sum + d.reading_count, 0)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
