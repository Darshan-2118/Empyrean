import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Reading {
  node_id: string;
  lat: number;
  lon: number;
  temperature: number;
  humidity: number;
  pm25: number;
  aqi: number;
  aqi_category: string;
  battery_v: number;
  timestamp: string;
}

interface MapProps {
  readings?: Reading[];
  markers?: Array<{ id: string; lat: number; lon: number; aqi: number; color: string; label: string }>;
  onMarkerClick?: (reading: Reading) => void;
  center?: [number, number];
  zoom?: number;
}

const RecenterAutomatically = ({ lat, lon }: { lat: number, lon: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon]);
  }, [lat, lon, map]);
  return null;
}

function getAQIColor(aqi: number): string {
  if (aqi <= 50) return '#22c55e'; // Green
  if (aqi <= 100) return '#eab308'; // Yellow
  if (aqi <= 150) return '#f97316'; // Orange
  if (aqi <= 200) return '#ef4444'; // Red
  if (aqi <= 300) return '#a855f7'; // Purple
  return '#7f1d1d'; // Maroon
}

export const Map: React.FC<MapProps> = ({ 
  readings = [], 
  markers = [], 
  onMarkerClick, 
  center = [12.9716, 77.5946], 
  zoom = 12 
}) => {
  // Support both old markers API and new readings API
  const displayData = readings.length > 0 ? readings : markers;
  const centerLat = displayData.length > 0 ? (displayData[0] as any).lat : center[0];
  const centerLon = displayData.length > 0 ? (displayData[0] as any).lon : center[1];

  useEffect(() => {
    // Fix for leaflet marker icons
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }, []);

  return (
    <div className="w-full h-full min-h-[350px] rounded-3xl overflow-hidden liquid-glass border border-white/10 relative" style={{ zIndex: 0 }}>
      <MapContainer 
        center={[centerLat, centerLon]} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {displayData.length > 0 && <RecenterAutomatically lat={centerLat} lon={centerLon} />}
        
        {readings.length > 0 ? (
          // Render readings with enhanced popup
          readings.map((reading) => (
            <CircleMarker
              key={reading.node_id}
              center={[reading.lat, reading.lon]}
              pathOptions={{ 
                color: getAQIColor(reading.aqi), 
                fillColor: getAQIColor(reading.aqi), 
                fillOpacity: 0.7, 
                weight: 2 
              }}
              radius={16}
              eventHandlers={{
                click: () => onMarkerClick?.(reading),
              }}
            >
              <Popup>
                <div className="p-3 bg-black/80 rounded-lg text-white space-y-2 text-sm">
                  <div className="font-semibold">{reading.node_id}</div>
                  <div>AQI: {reading.aqi} ({reading.aqi_category})</div>
                  <div>PM2.5: {reading.pm25.toFixed(1)} μg/m³</div>
                  <div>Temp: {reading.temperature.toFixed(1)}°C</div>
                  <div>Humidity: {reading.humidity.toFixed(0)}%</div>
                  <div>Battery: {reading.battery_v.toFixed(2)}V</div>
                  <div className="text-xs text-white/60">{new Date(reading.timestamp).toLocaleTimeString()}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))
        ) : (
          // Legacy markers support
          markers.map((m) => (
            <CircleMarker
              key={m.id}
              center={[m.lat, m.lon]}
              pathOptions={{ color: m.color, fillColor: m.color, fillOpacity: 0.8, weight: 2 }}
              radius={8}
            >
              <Popup className="custom-popup">
                <div className="text-black p-1">
                  <strong>{m.label}</strong><br />
                  AQI: {m.aqi}
                </div>
              </Popup>
            </CircleMarker>
          ))
        )}
      </MapContainer>
    </div>
  );
};
