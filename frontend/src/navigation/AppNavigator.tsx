import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/DashboardScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { AlertsScreen } from '../screens/AlertsScreen';

const Tab = createBottomTabNavigator();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
        }}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ title: 'Live Map' }}
        />
        <Tab.Screen 
          name="History" 
          component={HistoryScreen} 
          options={{ title: 'Trends' }}
        />
        <Tab.Screen 
          name="Alerts" 
          component={AlertsScreen} 
          options={{ title: 'Alerts' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
