import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AlertToastProps {
  message: string;
  severity: 'warning' | 'critical';
}

export const AlertToast: React.FC<AlertToastProps> = ({ message, severity }) => {
  return (
    <View style={[styles.container, severity === 'critical' ? styles.critical : styles.warning]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  warning: {
    backgroundColor: '#FFCC00',
  },
  critical: {
    backgroundColor: '#FF3333',
  },
  text: {
    color: '#000000',
  },
});
