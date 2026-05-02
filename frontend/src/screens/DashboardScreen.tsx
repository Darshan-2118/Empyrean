import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, useWindowDimensions } from 'react-native';
import { Map } from '../components/Map';
import { NodeDetail } from '../components/NodeDetail';
import { SensorReading } from '../types';

export const DashboardScreen: React.FC = () => {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const { width } = useWindowDimensions();
  
  // PRD Breakpoints
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;

  // Dynamic dummy data for scaffolding
  useEffect(() => {
    const generateData = (): SensorReading[] => {
      const baseLat = 12.9716;
      const baseLon = 77.5946;
      return Array.from({ length: 3 }).map((_, i) => {
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

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return '#00e400';
    if (aqi <= 100) return '#ffff00';
    if (aqi <= 150) return '#ff7e00';
    if (aqi <= 200) return '#ff0000';
    if (aqi <= 300) return '#8f3f97';
    return '#7e0023';
  };

  const mapMarkers = readings.map(r => ({
    id: r.node_id,
    lat: r.lat,
    lon: r.lon,
    aqi: r.aqi,
    color: getAqiColor(r.aqi),
    label: r.node_id
  }));

  return (
    <View style={[styles.container, { flexDirection: isMobile ? 'column' : 'row' }]}>
      <View style={[styles.mapContainer, { flex: isMobile ? 1 : 0.6 }]}>
        <Map markers={mapMarkers} />
      </View>
      <View style={[styles.sidebarContainer, { flex: isMobile ? 1 : 0.4 }]}>
        <ScrollView style={styles.listContainer}>
          {readings.length === 0 ? <Text style={styles.emptyText}>No data available</Text> : null}
          {readings.map(r => (
            <NodeDetail key={r.node_id} reading={r} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    minHeight: 300,
  },
  sidebarContainer: {
    backgroundColor: '#f5f5f5',
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  listContainer: {
    flex: 1,
    padding: 10,
  },
  emptyText: {
    padding: 20,
    textAlign: 'center',
    color: '#666'
  }
});
