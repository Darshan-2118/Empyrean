import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Wind, Thermometer, Droplets, Battery, MapPin, Search, Bell, LogOut, LayoutDashboard, History, Settings } from 'lucide-react';

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

export default function DashboardPage() {
    const navigate = useNavigate();
    const [readings, setReadings] = useState<SensorReading[]>([]);
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        const generateData = (): SensorReading[] => {
            const baseLat = 12.9716;
            const baseLon = 77.5946;
            return Array.from({ length: 4 }).map((_, i) => {
                const pm25 = Math.floor(Math.random() * 200);
                let aqi_cat = "Good";
                if (pm25 > 50) aqi_cat = "Moderate";
                if (pm25 > 100) aqi_cat = "Unhealthy";
                if (pm25 > 150) aqi_cat = "Hazardous";

                return {
                    node_id: `ESP32-0${i + 1}`,
                    lat: baseLat + (Math.random() - 0.5) * 0.05,
                    lon: baseLon + (Math.random() - 0.5) * 0.05,
                    temperature: +(30 + Math.random() * 5).toFixed(1),
                    humidity: +(60 + Math.random() * 20).toFixed(1),
                    pressure: 1013,
                    voc_ohm: Math.floor(40000 + Math.random() * 10000),
                    mq135_ppm: Math.floor(300 + Math.random() * 200),
                    pm1: Math.floor(pm25 * 0.5),
                    pm25: pm25,
                    pm10: Math.floor(pm25 * 1.5),
                    fuzzy_score: pm25,
                    aqi: pm25,
                    aqi_category: aqi_cat,
                    battery_v: +(3.5 + Math.random() * 0.7).toFixed(2),
                    timestamp: new Date().toISOString()
                };
            });
        };

        setReadings(generateData());
        const interval = setInterval(() => {
            setReadings(generateData());
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const getAqiColorClass = (aqi: number) => {
        if (aqi <= 50) return 'text-green-400 border-green-400/50 bg-green-400/10';
        if (aqi <= 100) return 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10';
        if (aqi <= 150) return 'text-orange-400 border-orange-400/50 bg-orange-400/10';
        if (aqi <= 200) return 'text-red-400 border-red-400/50 bg-red-400/10';
        if (aqi <= 300) return 'text-purple-400 border-purple-400/50 bg-purple-400/10';
        return 'text-rose-600 border-rose-600/50 bg-rose-600/10';
    };

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className="relative min-h-screen w-full bg-black text-white font-sans overflow-hidden flex">
            
            {/* Background Video (Static) */}
            <video
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0 opacity-40"
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4#t=0.1"
            />

            {/* Sidebar Overlay */}
            <aside className="relative z-10 w-64 liquid-glass-strong border-r border-white/10 flex flex-col justify-between py-8 px-4 h-screen backdrop-blur-2xl">
                <div>
                    <div className="flex items-center gap-3 px-4 mb-10">
                        <img src="/finallogo.png" alt="Logo" className="w-8 h-8 object-contain" />
                        <span className="text-xl font-semibold tracking-wide">EMPYREAN</span>
                    </div>

                    <nav className="flex flex-col gap-2">
                        <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-white/20 text-white shadow-inner' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="font-medium">Dashboard</span>
                        </button>
                        <button onClick={() => setActiveTab('history')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-white/20 text-white shadow-inner' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
                            <History className="w-5 h-5" />
                            <span className="font-medium">History</span>
                        </button>
                        <button onClick={() => setActiveTab('alerts')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'alerts' ? 'bg-white/20 text-white shadow-inner' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
                            <Bell className="w-5 h-5" />
                            <span className="font-medium">Alerts</span>
                        </button>
                        <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-white/20 text-white shadow-inner' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
                            <Settings className="w-5 h-5" />
                            <span className="font-medium">Settings</span>
                        </button>
                    </nav>
                </div>

                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all mt-auto">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">
                {/* Topbar */}
                <header className="w-full h-20 liquid-glass border-b border-white/5 flex items-center justify-between px-8 backdrop-blur-xl shrink-0">
                    <h1 className="text-2xl font-semibold capitalize">{activeTab}</h1>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input 
                                type="text" 
                                placeholder="Search nodes..." 
                                className="bg-black/30 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 w-64 transition-all placeholder:text-white/30"
                            />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center border border-white/20 shadow-lg">
                            <span className="font-semibold text-sm">VD</span>
                        </div>
                    </div>
                </header>

                {/* Dashboard View */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {activeTab === 'dashboard' && (
                        <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
                            
                            {/* Overview Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="liquid-glass rounded-2xl p-6 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                                        <Activity className="w-4 h-4 text-blue-400" /> Active Nodes
                                    </div>
                                    <span className="text-3xl font-bold">{readings.length}</span>
                                </div>
                                <div className="liquid-glass rounded-2xl p-6 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                                        <Wind className="w-4 h-4 text-teal-400" /> Avg AQI
                                    </div>
                                    <span className="text-3xl font-bold">
                                        {readings.length ? Math.round(readings.reduce((acc, r) => acc + r.aqi, 0) / readings.length) : 0}
                                    </span>
                                </div>
                                <div className="liquid-glass rounded-2xl p-6 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                                        <Thermometer className="w-4 h-4 text-orange-400" /> Avg Temp
                                    </div>
                                    <span className="text-3xl font-bold">
                                        {readings.length ? (readings.reduce((acc, r) => acc + r.temperature, 0) / readings.length).toFixed(1) : 0}°C
                                    </span>
                                </div>
                                <div className="liquid-glass rounded-2xl p-6 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                                        <MapPin className="w-4 h-4 text-purple-400" /> Area Coverage
                                    </div>
                                    <span className="text-3xl font-bold">12 km²</span>
                                </div>
                            </div>

                            <h2 className="text-xl font-semibold mt-4 border-b border-white/10 pb-2">Live Node Status</h2>

                            {/* Node Grid */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <AnimatePresence>
                                    {readings.map((reading) => (
                                        <motion.div 
                                            key={reading.node_id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="liquid-glass rounded-3xl p-6 relative overflow-hidden group"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                                        {reading.node_id}
                                                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                                    </h3>
                                                    <p className="text-white/50 text-xs mt-1">Lat: {reading.lat.toFixed(4)}, Lon: {reading.lon.toFixed(4)}</p>
                                                </div>
                                                <div className={`px-4 py-1.5 rounded-full border text-sm font-bold flex items-center gap-2 ${getAqiColorClass(reading.aqi)}`}>
                                                    AQI: {reading.aqi} <span className="text-xs font-medium uppercase opacity-80">({reading.aqi_category})</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                                <div className="bg-black/20 rounded-xl p-3 flex flex-col gap-1">
                                                    <span className="text-white/50 text-xs flex items-center gap-1"><Wind className="w-3 h-3" /> PM2.5</span>
                                                    <span className="font-semibold">{reading.pm25} <span className="text-xs font-normal opacity-50">µg/m³</span></span>
                                                </div>
                                                <div className="bg-black/20 rounded-xl p-3 flex flex-col gap-1">
                                                    <span className="text-white/50 text-xs flex items-center gap-1"><Wind className="w-3 h-3" /> PM10</span>
                                                    <span className="font-semibold">{reading.pm10} <span className="text-xs font-normal opacity-50">µg/m³</span></span>
                                                </div>
                                                <div className="bg-black/20 rounded-xl p-3 flex flex-col gap-1">
                                                    <span className="text-white/50 text-xs flex items-center gap-1"><Thermometer className="w-3 h-3" /> Temp</span>
                                                    <span className="font-semibold">{reading.temperature}°C</span>
                                                </div>
                                                <div className="bg-black/20 rounded-xl p-3 flex flex-col gap-1">
                                                    <span className="text-white/50 text-xs flex items-center gap-1"><Droplets className="w-3 h-3" /> Humidity</span>
                                                    <span className="font-semibold">{reading.humidity}%</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center text-xs text-white/40 mt-6 pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center gap-1"><Battery className="w-3 h-3" /> {reading.battery_v}V</span>
                                                    <span>VOC: {reading.voc_ohm}Ω</span>
                                                </div>
                                                <span>Updated: {new Date(reading.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {activeTab !== 'dashboard' && (
                        <div className="flex flex-col items-center justify-center h-full text-white/50">
                            <h2 className="text-2xl font-medium mb-2 capitalize">{activeTab}</h2>
                            <p>This module is under construction.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
