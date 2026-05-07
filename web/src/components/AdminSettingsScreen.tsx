import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { AlertToast } from './AlertToast';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';

interface Settings {
  aqi_warning_threshold: number;
  aqi_critical_threshold: number;
  pm25_warning_threshold: number;
  pm25_critical_threshold: number;
  pm10_warning_threshold: number;
  pm10_critical_threshold: number;
  data_retention_days: number;
  alert_email: string;
}

export default function AdminSettingsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [settings, setSettings] = useState<Settings>({
    aqi_warning_threshold: 100,
    aqi_critical_threshold: 150,
    pm25_warning_threshold: 35,
    pm25_critical_threshold: 55,
    pm10_warning_threshold: 55,
    pm10_critical_threshold: 155,
    data_retention_days: 365,
    alert_email: 'admin@example.com',
  });

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: keyof Settings, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: typeof value === 'number' ? value : isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const handleSave = async () => {
    try {
      // In a real app, you would send this to the backend
      // For now, we'll just save to localStorage as a mock
      localStorage.setItem('empyrean_settings', JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    }
  };

  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 text-red-200">
            <p>Access Denied: Admin role required</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">System Settings</h1>
          <p className="text-white/60">Configure alert thresholds and system parameters</p>
        </div>

        {saved && <AlertToast type="success" message="Settings saved successfully!" />}
        {error && <AlertToast type="error" message={error} />}

        <div className="space-y-8">
          {/* AQI Thresholds */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              AQI Alert Thresholds
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Warning Threshold (AQI)</label>
                <input
                  type="number"
                  value={settings.aqi_warning_threshold}
                  onChange={(e) => handleChange('aqi_warning_threshold', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                />
                <p className="text-xs text-white/40 mt-2">Triggers warning alerts</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Critical Threshold (AQI)</label>
                <input
                  type="number"
                  value={settings.aqi_critical_threshold}
                  onChange={(e) => handleChange('aqi_critical_threshold', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
                <p className="text-xs text-white/40 mt-2">Triggers critical alerts</p>
              </div>
            </div>
          </div>

          {/* PM2.5 Thresholds */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              PM2.5 Alert Thresholds (μg/m³)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Warning Threshold</label>
                <input
                  type="number"
                  value={settings.pm25_warning_threshold}
                  onChange={(e) => handleChange('pm25_warning_threshold', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Critical Threshold</label>
                <input
                  type="number"
                  value={settings.pm25_critical_threshold}
                  onChange={(e) => handleChange('pm25_critical_threshold', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>
            </div>
          </div>

          {/* PM10 Thresholds */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              PM10 Alert Thresholds (μg/m³)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Warning Threshold</label>
                <input
                  type="number"
                  value={settings.pm10_warning_threshold}
                  onChange={(e) => handleChange('pm10_warning_threshold', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Critical Threshold</label>
                <input
                  type="number"
                  value={settings.pm10_critical_threshold}
                  onChange={(e) => handleChange('pm10_critical_threshold', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>
            </div>
          </div>

          {/* Data Retention & Notifications */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Data & Notifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Data Retention (days)</label>
                <input
                  type="number"
                  value={settings.data_retention_days}
                  onChange={(e) => handleChange('data_retention_days', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <p className="text-xs text-white/40 mt-2">Days to keep sensor data before deletion</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Alert Email Address</label>
                <input
                  type="email"
                  value={settings.alert_email}
                  onChange={(e) => handleChange('alert_email', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <p className="text-xs text-white/40 mt-2">Email for alert notifications</p>
              </div>
            </div>
          </div>

          {/* Reference Ranges */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">AQI Reference Ranges</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
                <p className="font-semibold text-green-300">Good</p>
                <p className="text-white/60">0 - 50</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3">
                <p className="font-semibold text-yellow-300">Moderate</p>
                <p className="text-white/60">51 - 100</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded p-3">
                <p className="font-semibold text-orange-300">Unhealthy (SG)</p>
                <p className="text-white/60">101 - 150</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
                <p className="font-semibold text-red-300">Unhealthy</p>
                <p className="text-white/60">151 - 200</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded p-3">
                <p className="font-semibold text-purple-300">Very Unhealthy</p>
                <p className="text-white/60">201 - 300</p>
              </div>
              <div className="bg-red-900/20 border border-red-700/30 rounded p-3">
                <p className="font-semibold text-red-200">Hazardous</p>
                <p className="text-white/60">301+</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
