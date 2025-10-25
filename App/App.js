/**
 * VOICE2EYE Mobile App
 * Main application with navigation and accessibility features
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { AccessibilityProvider } from './components/AccessibilityProvider';
import 'react-native-gesture-handler';

// Import screens
import DashboardScreen from './screens/DashboardScreen';
import EmergencyScreen from './screens/EmergencyScreen';
import SettingsScreen from './screens/SettingsScreen';
import GestureTrainingScreen from './screens/GestureTrainingScreen';
import ContactsScreen from './screens/ContactsScreen';
import ContactForm from './components/ContactForm';
import HelpScreen from './screens/HelpScreen';
import CameraScreen from './screens/CameraScreen';

// Import navigation component
import BottomNavigationBar from './components/BottomNavigationBar';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main tab navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNavigationBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Contacts" component={ContactsScreen} />
      <Tab.Screen name="GestureTraining" component={GestureTrainingScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AccessibilityProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="MainTabs"
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            animationEnabled: true,
          }}
        >
          <Stack.Screen
            name="MainTabs"
            component={TabNavigator}
            options={{
              title: 'VOICE2EYE',
            }}
          />
          <Stack.Screen
            name="Emergency"
            component={EmergencyScreen}
            options={{
              title: 'Emergency Mode',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="ContactForm"
            component={ContactForm}
            options={{
              title: 'Contact Form',
            }}
          />
          <Stack.Screen
            name="Help"
            component={HelpScreen}
            options={{
              title: 'Help & Tutorial',
            }}
          />
          <Stack.Screen
            name="Camera"
            component={CameraScreen}
            options={{
              title: 'Camera View',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AccessibilityProvider>
  );
}