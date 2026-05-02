import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Button } from 'react-native';
import { Chart } from '../components/Chart';

export const HistoryScreen: React.FC = () => {
  const [data, setData] = useState({
    labels: ["10:00", "10:05", "10:10", "10:15", "10:20"],
    aqi: [50, 55, 60, 58, 62],
    temp: [30, 30.5, 31, 31.2, 31.5]
  });

  const refreshData = () => {
    setData({
      labels: data.labels.map(l => {
        const parts = l.split(':');
        let mins = parseInt(parts[1]) + 5;
        let hrs = parseInt(parts[0]);
        if (mins >= 60) {
          mins -= 60;
          hrs += 1;
        }
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      }),
      aqi: data.aqi.map(v => Math.max(0, Math.min(500, v + Math.floor((Math.random() - 0.5) * 20)))),
      temp: data.temp.map(v => Math.max(10, Math.min(50, +(v + (Math.random() - 0.5) * 2).toFixed(1))))
    });
  };

  React.useEffect(() => {
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [data]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historical Data</Text>
        <Button title="Refresh" onPress={refreshData} />
      </View>
      <Chart title="AQI Trend" labels={data.labels} data={data.aqi} />
      <Chart title="Temperature (°C)" labels={data.labels} data={data.temp} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  }
});
