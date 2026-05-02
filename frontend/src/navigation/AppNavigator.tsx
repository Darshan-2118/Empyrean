import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DashboardScreen } from '../screens/DashboardScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { AlertsScreen } from '../screens/AlertsScreen';

const Drawer = createDrawerNavigator();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        screenOptions={{
          drawerActiveTintColor: '#007AFF',
          drawerInactiveTintColor: 'gray',
          headerTitleAlign: 'center',
        }}
      >
        <Drawer.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ title: 'Live Map' }}
        />
        <Drawer.Screen 
          name="History" 
          component={HistoryScreen} 
          options={{ title: 'Trends' }}
        />
        <Drawer.Screen 
          name="Alerts" 
          component={AlertsScreen} 
          options={{ title: 'Alerts' }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};
