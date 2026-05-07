import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DashboardScreen } from '../screens/DashboardScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { AlertsScreen } from '../screens/AlertsScreen';
import { LandingScreen } from '../screens/LandingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const MainDrawer = () => (
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
);

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Landing">
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainDrawer" component={MainDrawer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
