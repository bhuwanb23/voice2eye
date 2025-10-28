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
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAccessibility } from '../components/AccessibilityProvider';
import StatusIndicator from '../components/StatusIndicator';
import DashboardHeader from '../components/DashboardHeader';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import QuickActions from '../components/QuickActions';
import NavigationMenu from '../components/NavigationMenu';
import VoiceCommandsGuide from '../components/VoiceCommandsGuide';
import LastCommandDisplay from '../components/LastCommandDisplay';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import apiService from '../api/services/apiService';

const { width, height } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const { settings, getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  
  const [currentStatus, setCurrentStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  
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
  
  // API-loaded data for analytics components
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

  // Load analytics data from API
  useEffect(() => {
    loadAnalyticsData();
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const health = await apiService.checkHealth();
      console.log('Backend health:', health);
      setApiError(null);
    } catch (error) {
      console.warn('Backend not available, using mock data:', error.message);
      setApiError('Backend not available - using mock data');
    }
  };

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Load usage statistics
      const usageData = await apiService.getUsageStatistics(7);
      setUsageStats({
        totalEvents: usageData.total_events || 0,
        voiceCommands: usageData.voice_commands || 0,
        gestureDetections: usageData.gesture_detections || 0,
        emergencyEvents: usageData.emergency_events || 0,
        averageSessionDuration: usageData.average_session_duration || 0
      });

      // Load performance metrics
      const perfData = await apiService.getPerformanceMetrics(7);
      if (perfData && perfData.metrics) {
        const latencyMetric = perfData.metrics.find(m => m.name === 'speech_recognition_latency');
        const gestureMetric = perfData.metrics.find(m => m.name === 'gesture_detection_latency');
        
        setMetrics({
          latency: latencyMetric?.value || 150,
          accuracy: 94.5, // Not in API response
          uptime: 99.8,
          cpuUsage: 45
        });
      }

      // Load emergency analytics
      const emergencyData = await apiService.getEmergencyAnalytics(30);
      if (emergencyData) {
        const timePatterns = emergencyData.hourly_patterns || {};
        const triggerTypes = emergencyData.trigger_types || {};
        
        setPatterns(prev => ({
          ...prev,
          timeOfDay: Object.keys(timePatterns).map((hour, idx) => ({
            hour: `${hour}-${parseInt(hour) + 6}`,
            count: timePatterns[hour],
            percentage: (timePatterns[hour] / (emergencyData.triggered_count || 1)) * 100
          })),
          triggerType: [
            { type: 'voice', count: triggerTypes.voice || 0, color: '#007AFF' },
            { type: 'gesture', count: triggerTypes.gesture || 0, color: '#FF9500' },
            { type: 'manual', count: triggerTypes.manual || 0, color: '#FF3B30' }
          ],
          totalEmergencies: emergencyData.triggered_count || 0,
          avgResponseTime: 5.2 // Not in API response
        }));

        setExportData(prev => ({
          ...prev,
          emergencies: emergencyData.triggered_count || 0
        }));
      }

    } catch (error) {
      console.error('Error loading analytics:', error);
      setApiError('Failed to load analytics - using mock data');
    } finally {
      setIsLoading(false);
    }
  };
  
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

  // Show loading indicator while fetching data
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary, marginTop: 16 }]}>
          Loading dashboard data...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Modern Compact Header */}
        <LinearGradient
          colors={[colors.primary, colors.primary + 'DD', colors.primary + '99']}
          style={styles.compactHeader}
        >
          <Animated.View 
            style={[
              styles.headerContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.headerTitle}>🏠 Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              {personalizedMessage || 'Voice & Gesture Control Center'}
            </Text>
            
            {/* Quick Stats */}
            <View style={styles.quickStats}>
              <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.statNumber}>{usageStats.voiceCommands}</Text>
                <Text style={styles.statLabel}>Voice</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.statNumber}>{usageStats.gestureDetections}</Text>
                <Text style={styles.statLabel}>Gestures</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.statNumber}>{metrics.accuracy}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Error Banner */}
          {apiError && (
            <View style={[styles.errorBanner, { backgroundColor: colors.warning }]}>
              <Text style={[styles.errorText, { color: 'white' }]}>
                ⚠️ {apiError}
              </Text>
            </View>
          )}

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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  compactHeader: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  headerContent: {
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 16,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
  },
  statCard: {
    padding: 12,
    borderRadius: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
    color: 'white',
    opacity: 0.8,
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
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorBanner: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default DashboardScreen;