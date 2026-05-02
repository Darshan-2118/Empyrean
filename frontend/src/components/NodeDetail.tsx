import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SensorReading } from '../types';
import { Badge } from './Badge';

interface NodeDetailProps {
  reading: SensorReading;
}

export const NodeDetail: React.FC<NodeDetailProps> = ({ reading }) => {
  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return '#00e400';
    if (aqi <= 100) return '#ffff00';
    if (aqi <= 150) return '#ff7e00';
    if (aqi <= 200) return '#ff0000';
    if (aqi <= 300) return '#8f3f97';
    return '#7e0023';
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Node: {reading.node_id}</Text>
      <Badge label={`AQI: ${reading.aqi} - ${reading.aqi_category}`} color={getAqiColor(reading.aqi)} />
      
      <View style={styles.detailsRow}>
        <Text>Temp: {reading.temperature}°C</Text>
        <Text>Humidity: {reading.humidity}%</Text>
      </View>
      <View style={styles.detailsRow}>
        <Text>PM2.5: {reading.pm25} µg/m³</Text>
        <Text>PM10: {reading.pm10} µg/m³</Text>
      </View>
      <View style={styles.detailsRow}>
        <Text>VOC: {reading.voc_ohm} Ω</Text>
        <Text>CO2 est: {reading.mq135_ppm} ppm</Text>
      </View>
      <Text style={styles.footer}>Last updated: {new Date(reading.timestamp).toLocaleString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    margin: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  footer: {
    marginTop: 10,
    fontSize: 12,
    color: '#888',
  }
});
