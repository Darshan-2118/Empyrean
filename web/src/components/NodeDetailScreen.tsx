import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { getLatestReadings, getReadingsHistory, getForecast } from '../services/api';
import { AQIBadge } from './AQIBadge';
import { ChartSkeleton, LoadingSkeleton } from './LoadingSkeleton';
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
import { ArrowLeft, Battery, Thermometer, Droplets, Wind, Clock } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
  const navigate = useNavigate();
  const { nodeId } = useParams<{ nodeId: string }>();
  const { token } = useAuth();

  const [reading, setReading] = useState<Reading | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load latest reading
  useEffect(() => {
    const loadData = async () => {
      if (!token || !nodeId) return;

      try {
        setLoading(true);

        // Get latest reading
        const latestResponse = await getLatestReadings(token, nodeId);
        const readings = Array.isArray(latestResponse) ? latestResponse : [latestResponse];
        if (readings.length > 0) {
          setReading(readings[0]);
        }

        // Get forecast
        const forecastResponse = await getForecast(token, nodeId);
        setForecast(Array.isArray(forecastResponse) ? forecastResponse : []);

        // Get 24-hour history
        const now = new Date();
        const from24hAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const historyResponse = await getReadingsHistory(
          token,
          from24hAgo.toISOString(),
          now.toISOString(),
          nodeId,
          '1h'
        );
        setHistoryData(Array.isArray(historyResponse) ? historyResponse : []);

        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // Poll every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [token, nodeId]);

  if (!reading) return <LoadingSkeleton />;

  const historyChartData = {
    labels: historyData.map(d => new Date(d.bucket_time).toLocaleTimeString()),
    datasets: [
      {
        label: 'AQI',
        data: historyData.map(d => d.avg_aqi),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const forecastChartData = {
    labels: forecast.slice(0, 12).map(f => new Date(f.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'AQI Forecast',
        data: forecast.slice(0, 12).map(f => f.aqi_forecast),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
          <h1 className="text-4xl font-bold mb-2">{nodeId}</h1>
          <p className="text-white/60">Individual Node Dashboard</p>
        </div>

        {error && <AlertToast type="error" message={error} />}

        {/* Main Stats */}
        {!loading && reading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Left Panel: Key Metrics */}
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4">Air Quality Index</h2>
                  <AQIBadge aqi={reading.aqi} category={reading.aqi_category} size="lg" />
                  <p className="text-white/60 text-sm mt-2">Fuzzy Score: {reading.fuzzy_score.toFixed(1)}/100</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4">Environmental Data</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-5 h-5 text-orange-400" />
                        <span>Temperature</span>
                      </div>
                      <span className="font-semibold">{reading.temperature.toFixed(1)}°C</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-blue-400" />
                        <span>Humidity</span>
                      </div>
                      <span className="font-semibold">{reading.humidity.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wind className="w-5 h-5 text-cyan-400" />
                        <span>Pressure</span>
                      </div>
                      <span className="font-semibold">{reading.pressure.toFixed(1)} hPa</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4">Pollutants</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>PM1</span>
                      <span className="font-semibold">{reading.pm1.toFixed(1)} μg/m³</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>PM2.5</span>
                      <span className="font-semibold">{reading.pm25.toFixed(1)} μg/m³</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>PM10</span>
                      <span className="font-semibold">{reading.pm10.toFixed(1)} μg/m³</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>MQ135 CO2</span>
                      <span className="font-semibold">{reading.mq135_ppm.toFixed(0)} ppm</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4">Device Status</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Battery className="w-5 h-5 text-green-400" />
                        <span>Battery</span>
                      </div>
                      <span className="font-semibold">{reading.battery_v.toFixed(2)}V</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-white/50" />
                        <span>Last Update</span>
                      </div>
                      <span className="font-semibold text-sm">{new Date(reading.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Location</span>
                      <span className="font-semibold text-sm">{reading.lat.toFixed(4)}, {reading.lon.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel: Charts */}
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4">24-Hour Trend</h2>
                  {loading ? (
                    <ChartSkeleton />
                  ) : historyData.length > 0 ? (
                    <Line
                      data={historyChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                          legend: { labels: { color: 'rgba(255, 255, 255, 0.7)' } },
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
                    <p className="text-white/60 text-center py-4">No historical data</p>
                  )}
                </div>

                {forecast.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">AQI Forecast (Next 12h)</h2>
                    <Line
                      data={forecastChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                          legend: { labels: { color: 'rgba(255, 255, 255, 0.7)' } },
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
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
