import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text, Button } from 'react-native';
import { Alert } from '../types';
import { AlertToast } from '../components/AlertToast';

export const AlertsScreen: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      alert_id: "1",
      node_id: "ESP32-01",
      parameter: "aqi",
      value: 155,
      threshold: 150,
      severity: "critical",
      triggered_at: new Date().toISOString(),
      acknowledged_at: null,
      acknowledged_by: null
    },
    {
      alert_id: "2",
      node_id: "ESP32-02",
      parameter: "pm25",
      value: 45,
      threshold: 35,
      severity: "warning",
      triggered_at: new Date().toISOString(),
      acknowledged_at: null,
      acknowledged_by: null
    }
  ]);

  const acknowledgeAlert = (id: string) => {
    setAlerts(alerts.map(a => 
      a.alert_id === id ? { ...a, acknowledged_at: new Date().toISOString(), acknowledged_by: 'admin' } : a
    ));
  };

  const renderItem = ({ item }: { item: Alert }) => (
    <View style={styles.alertItem}>
      <AlertToast 
        message={`${item.severity.toUpperCase()}: ${item.node_id} ${item.parameter} is ${item.value} (Threshold: ${item.threshold})`} 
        severity={item.severity} 
      />
      {!item.acknowledged_at ? (
        <Button title="Acknowledge" onPress={() => acknowledgeAlert(item.alert_id)} />
      ) : (
        <Text style={styles.ackText}>Acknowledged at {new Date(item.acknowledged_at).toLocaleTimeString()}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={alerts}
        keyExtractor={item => item.alert_id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No active alerts</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  alertItem: {
    marginBottom: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 2,
  },
  emptyText: {
    padding: 20,
    textAlign: 'center',
    color: '#666'
  },
  ackText: {
    marginTop: 5,
    fontSize: 12,
    color: '#888',
    textAlign: 'right'
  }
});
