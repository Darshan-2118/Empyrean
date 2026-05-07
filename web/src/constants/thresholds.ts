// Default sensor alert thresholds — single source of truth.
// AdminThresholds page reads from here; in production these would be
// overridden per-node from Firestore.

export interface Threshold {
  parameter: string;
  unit: string;
  warning: number;
  critical: number;
  description: string;
}

export const DEFAULT_THRESHOLDS: Threshold[] = [
  { parameter: 'PM2.5',       unit: 'µg/m³', warning: 55.4,  critical: 150.4, description: 'Fine particulate matter (health risk indicator)' },
  { parameter: 'PM10',        unit: 'µg/m³', warning: 154,   critical: 354,   description: 'Coarse particulate matter' },
  { parameter: 'PM1.0',       unit: 'µg/m³', warning: 35,    critical: 75,    description: 'Ultra-fine particles (<1µm)' },
  { parameter: 'AQI',         unit: '',       warning: 100,   critical: 150,   description: 'Composite Air Quality Index score' },
  { parameter: 'Temperature', unit: '°C',     warning: 38,    critical: 42,    description: 'Ambient temperature (sensor health)' },
  { parameter: 'Humidity',    unit: '%',      warning: 80,    critical: 90,    description: 'Relative humidity (condensation risk)' },
  { parameter: 'VOC',         unit: 'kΩ',    warning: 100,   critical: 200,   description: 'Volatile organic compound resistance' },
  { parameter: 'MQ-135',      unit: 'ppm',   warning: 450,   critical: 800,   description: 'CO₂/NOx proxy sensor reading' },
  { parameter: 'Battery',     unit: 'V',     warning: 3.5,   critical: 3.2,   description: 'Node battery level (operational)' },
];

// AQI colour / category breakpoints (for badge + map rendering)
export const AQI_CATEGORIES = [
  { max: 50,  label: 'Good',                         color: '#22c55e' },
  { max: 100, label: 'Moderate',                     color: '#eab308' },
  { max: 150, label: 'Unhealthy for Sensitive Groups', color: '#f97316' },
  { max: 200, label: 'Unhealthy',                    color: '#ef4444' },
  { max: 300, label: 'Very Unhealthy',               color: '#dc2626' },
  { max: Infinity, label: 'Hazardous',               color: '#7f1d1d' },
] as const;
