/**
 * Beautiful Modern Dashboard Screen
 * Completely redesigned with stunning UI, improved layout, and professional design
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  Vibration,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccessibility } from '../components/AccessibilityProvider';
import StatusIndicator from '../components/StatusIndicator';
import DashboardHeader from '../components/DashboardHeader';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import QuickActions from '../components/QuickActions';
import NavigationMenu from '../components/NavigationMenu';
import VoiceCommandsGuide from '../components/VoiceCommandsGuide';
import LastCommandDisplay from '../components/LastCommandDisplay';
import * as Speech from 'expo-speech';

const { width, height } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const { settings, getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  
  const [currentStatus, setCurrentStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  
  // New states for enhanced features
  const [usageStats, setUsageStats] = useState({
    totalEvents: 0,
    voiceCommands: 0,
    gestureDetections: 0,
    emergencyEvents: 0,
    averageSessionDuration: 0
  });
  
  const [serviceStatus, setServiceStatus] = useState({
    speech: 'ready',
    gesture: 'ready',
    emergency: 'ready',
    camera: 'ready'
  });
  
  const [emergencyHistory, setEmergencyHistory] = useState([]);
  const [personalizedMessage, setPersonalizedMessage] = useState('');
  
  // Mock data for new analytics components
  const [metrics, setMetrics] = useState({
    latency: 150,
    accuracy: 94.5,
    uptime: 99.8,
    cpuUsage: 45
  });
  
  const [patterns, setPatterns] = useState({
    timeOfDay: [
      { hour: '00-06', count: 2, percentage: 10 },
      { hour: '06-12', count: 8, percentage: 40 },
      { hour: '12-18', count: 6, percentage: 30 },
      { hour: '18-24', count: 4, percentage: 20 }
    ],
    dayOfWeek: [
      { day: 'Mon', count: 3 },
      { day: 'Tue', count: 5 },
      { day: 'Wed', count: 2 },
      { day: 'Thu', count: 4 },
      { day: 'Fri', count: 6 },
      { day: 'Sat', count: 1 },
      { day: 'Sun', count: 1 }
    ],
    triggerType: [
      { type: 'voice', count: 12, color: '#007AFF' },
      { type: 'gesture', count: 5, color: '#FF9500' },
      { type: 'manual', count: 3, color: '#FF3B30' }
    ],
    avgResponseTime: 5.2,
    totalEmergencies: 22
  });
  
  const [exportData, setExportData] = useState({
    voiceCommands: 145,
    gestures: 89,
    emergencies: 12,
    avgAccuracy: 94.5,
    avgResponseTime: 4.2
  });
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Entrance animations with staggered timing
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Initialize voice navigation if enabled
    if (settings.voiceNavigation) {
      announceScreenEntry();
    }
    
    // Load mock data for enhanced features
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Simulate loading analytics/statistics data
    setTimeout(() => {
      setUsageStats({
        totalEvents: 127,
        voiceCommands: 89,
        gestureDetections: 36,
        emergencyEvents: 2,
        averageSessionDuration: 145.6
      });
      
      // Simulate emergency history
      setEmergencyHistory([
        { id: '1', type: 'voice', time: '2023-10-15 14:30', status: 'confirmed' },
        { id: '2', type: 'gesture', time: '2023-10-10 09:15', status: 'cancelled' }
      ]);
      
      // Set personalized welcome message
      const hours = new Date().getHours();
      let greeting = 'Welcome';
      if (hours < 12) greeting = 'Good morning';
      else if (hours < 18) greeting = 'Good afternoon';
      else greeting = 'Good evening';
      
      setPersonalizedMessage(`${greeting}! Ready to assist you.`);
    }, 500);
  };

  const announceScreenEntry = () => {
    const message = isEmergencyMode 
      ? "Emergency mode active. Main dashboard. Use voice commands or gestures to navigate."
      : personalizedMessage || "Main dashboard. Voice recognition and gesture detection ready.";
    
    Speech.speak(message, {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
      language: 'en',
    });
  };

  const handleVoiceCommand = (command) => {
    setLastCommand(command);
    setCurrentStatus('processing');
    setStatusMessage('Processing voice command...');

    // Simulate command processing
    setTimeout(() => {
      processVoiceCommand(command);
    }, 1500);
  };

  const processVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('emergency') || lowerCommand.includes('help')) {
      triggerEmergency();
    } else if (lowerCommand.includes('settings')) {
      navigation.navigate('Settings');
    } else if (lowerCommand.includes('contacts')) {
      navigation.navigate('Contacts');
    } else if (lowerCommand.includes('gesture')) {
      navigation.navigate('GestureTraining');
    } else if (lowerCommand.includes('help') || lowerCommand.includes('tutorial')) {
      navigation.navigate('Help');
    } else if (lowerCommand.includes('camera')) {
      navigation.navigate('Camera');
    } else {
      // Default response
      setStatusMessage(`Command received: ${command}`);
      Speech.speak(`I heard: ${command}. How can I help you?`, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
      });
    }
    
    setCurrentStatus('idle');
  };

  const triggerEmergency = () => {
    // Navigate to emergency screen instead of showing alert
    navigation.navigate('Emergency');
  };

  const startVoiceRecognition = () => {
    setCurrentStatus('listening');
    setStatusMessage('Listening for voice commands...');
    
    // Simulate voice recognition
    setTimeout(() => {
      const mockCommands = [
        "Open settings",
        "Show contacts",
        "Start gesture training",
        "Open camera",
        "Emergency help",
        "Show help",
      ];
      const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
      handleVoiceCommand(randomCommand);
    }, 2000);
  };

  const startGestureDetection = () => {
    setCurrentStatus('processing');
    setStatusMessage('Detecting gestures...');
    
    // Simulate gesture detection
    setTimeout(() => {
      const gestures = ['Open hand', 'Fist', 'Two fingers', 'Thumbs up', 'Pointing'];
      const randomGesture = gestures[Math.floor(Math.random() * gestures.length)];
      setStatusMessage(`Gesture detected: ${randomGesture}`);
      setCurrentStatus('idle');
      
      Speech.speak(`Gesture detected: ${randomGesture}`, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
      });
    }, 1500);
  };

  const quickActions = [
    {
      title: 'Voice Recognition',
      subtitle: 'Start listening for commands',
      icon: '🎤',
      gradient: ['#667eea', '#764ba2'],
      onPress: startVoiceRecognition,
      variant: 'primary',
      accessibilityLabel: 'Start voice recognition',
      accessibilityHint: 'Tap to begin listening for voice commands',
    },
    {
      title: 'Gesture Detection',
      subtitle: 'Detect hand gestures',
      icon: '✋',
      gradient: ['#f093fb', '#f5576c'],
      onPress: startGestureDetection,
      variant: 'secondary',
      accessibilityLabel: 'Start gesture detection',
      accessibilityHint: 'Tap to begin detecting hand gestures',
    },
    {
      title: 'Emergency',
      subtitle: 'Trigger emergency alert',
      icon: '🚨',
      gradient: ['#ff6b6b', '#ee5a24'],
      onPress: triggerEmergency,
      variant: 'error',
      accessibilityLabel: 'Trigger emergency alert',
      accessibilityHint: 'Tap to activate emergency mode and contact help',
    },
  ];

  const navigationItems = [
    {
      title: 'Settings',
      subtitle: 'Configure preferences',
      icon: '⚙️',
      color: colors.primary,
      onPress: () => navigation.navigate('Settings'),
      accessibilityLabel: 'Open settings',
    },
    {
      title: 'Contacts',
      subtitle: 'Manage emergency contacts',
      icon: '👥',
      color: colors.success,
      onPress: () => navigation.navigate('Contacts'),
      accessibilityLabel: 'Manage emergency contacts',
    },
    {
      title: 'Gesture Training',
      subtitle: 'Learn hand gestures',
      icon: '✋',
      color: colors.accent,
      onPress: () => navigation.navigate('GestureTraining'),
      accessibilityLabel: 'Open gesture training',
    },
    {
      title: 'Help & Tutorial',
      subtitle: 'Get help and learn',
      icon: '❓',
      color: colors.warning,
      onPress: () => navigation.navigate('Help'),
      accessibilityLabel: 'Open help and tutorial',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Beautiful Header */}
        <Animated.View
          style={[
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ],
            },
          ]}
        >
          <DashboardHeader 
            personalizedMessage={personalizedMessage}
            isEmergencyMode={isEmergencyMode}
          />
        </Animated.View>

        {/* Status Indicator - Only show when there's an active status */}
        {currentStatus !== 'idle' && (
          <Animated.View
            style={[
              styles.statusContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <StatusIndicator
              status={currentStatus}
              message={statusMessage}
              announceVoice={true}
            />
          </Animated.View>
        )}

        {/* Analytics Dashboard */}
        <Animated.View
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <AnalyticsDashboard 
            usageStats={usageStats} 
            serviceStatus={serviceStatus}
            metrics={metrics}
            patterns={patterns}
            exportData={exportData}
          />
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <QuickActions actions={quickActions} />
        </Animated.View>

        {/* Navigation Menu */}
        <Animated.View
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <NavigationMenu items={navigationItems} />
        </Animated.View>

        {/* Voice Commands Guide */}
        <Animated.View
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <VoiceCommandsGuide />
        </Animated.View>

        {/* Last Command Display */}
        <Animated.View
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LastCommandDisplay lastCommand={lastCommand} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  statusContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
});

export default DashboardScreen;