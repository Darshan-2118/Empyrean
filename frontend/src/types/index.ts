export interface SensorReading {
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

export interface NodeMetadata {
  node_id: string;
  name: string;
  location_name: string;
  lat: number;
  lon: number;
  status: 'online' | 'offline';
  last_seen: string;
  firmware_version: string;
  active: boolean;
  battery_v: number;
}

export interface Alert {
  alert_id: string;
  node_id: string;
  parameter: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'critical';
  triggered_at: string;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
}
