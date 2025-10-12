/**
 * VOICE2EYE Mobile App
 * Main application with navigation and accessibility features
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { AccessibilityProvider } from './components/AccessibilityProvider';
import 'react-native-gesture-handler';

// Import screens
import DashboardScreen from './screens/DashboardScreen';
import EmergencyScreen from './screens/EmergencyScreen';
import SettingsScreen from './screens/SettingsScreen';
import GestureTrainingScreen from './screens/GestureTrainingScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AccessibilityProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Dashboard"
          screenOptions={{
            headerShown: false, // We use custom headers for accessibility
            gestureEnabled: true,
            animationEnabled: true,
          }}
        >
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              title: 'VOICE2EYE Dashboard',
            }}
          />
          <Stack.Screen
            name="Emergency"
            component={EmergencyScreen}
            options={{
              title: 'Emergency Mode',
              gestureEnabled: false, // Disable gestures in emergency mode
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Settings',
            }}
          />
          <Stack.Screen
            name="GestureTraining"
            component={GestureTrainingScreen}
            options={{
              title: 'Gesture Training',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AccessibilityProvider>
  );
}