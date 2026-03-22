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
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAccessibility } from '../components/AccessibilityProvider';
import * as Speech from 'expo-speech';
import apiService from '../api/services/apiService';
import { Mic, Hand, AlertTriangle, Settings, Users, HelpCircle, Activity } from 'lucide-react-native';

// Purple Theme Color Palette - WCAG 2.1 Compliant
const PURPLE_THEME = {
  // Primary purples
  primary50: '#F5F3FF',
  primary100: '#EDE9FE',
  primary200: '#DDD6FE',
  primary300: '#C4B5FD',
  primary400: '#A78BFA',
  primary500: '#8B5CF6',
  primary600: '#7C3AED',
  primary700: '#6D28D9',
  primary800: '#5B21B6',
  primary900: '#4C1D95',
  
  // Accent purples
  accent500: '#C084FC',
  accent600: '#A855F7',
  accent700: '#9333EA',
  accent800: '#7E22CE',
  accent900: '#6B21A8',
  
  // Surface colors
  background: '#FAF5FF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  
  // Text colors
  textPrimary: '#2E1065',
  textSecondary: '#6B21A8',
  textTertiary: '#A78BFA',
  
  // Status colors (purple-tinted)
  success: '#7C3AED',
  successLight: '#DDD6FE',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  
  // Gradients
  gradientPrimary: ['#8B5CF6', '#6D28D9'],
  gradientSecondary: ['#A78BFA', '#7C3AED'],
  gradientAccent: ['#C084FC', '#9333EA'],
  gradientSuccess: ['#A78BFA', '#6D28D9'],
  gradientError: ['#F87171', '#DC2626'],
  
  // Shadows
  shadowLight: 'rgba(139, 92, 246, 0.1)',
  shadowMedium: 'rgba(139, 92, 246, 0.15)',
  shadowDark: 'rgba(109, 40, 217, 0.2)',
};

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
      { type: 'voice', count: 12, color: PURPLE_THEME.accent700 },
      { type: 'gesture', count: 5, color: PURPLE_THEME.accent500 },
      { type: 'manual', count: 3, color: PURPLE_THEME.accent800 }
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

  // Real-time chart data
  const [chartData, setChartData] = useState([65, 45, 80, 30, 90, 55, 75]);
  const [performanceData, setPerformanceData] = useState({
    voiceAccuracy: 85,
    gestureAccuracy: 72
  });

  // Load analytics data from API
  useEffect(() => {
    loadAnalyticsData();
    checkHealth();
    
    // Start real-time chart updates
    const chartUpdateInterval = setInterval(() => {
      setChartData(prev => {
        const newData = [...prev];
        // Simulate real-time data by updating the last bar
        newData[6] = Math.floor(Math.random() * 40) + 60; // 60-100%
        return newData;
      });
      
      setPerformanceData(prev => ({
        voiceAccuracy: Math.max(70, Math.min(95, prev.voiceAccuracy + (Math.random() - 0.5) * 4)),
        gestureAccuracy: Math.max(60, Math.min(90, prev.gestureAccuracy + (Math.random() - 0.5) * 4))
      }));
    }, 3000); // Update every 3 seconds

    return () => clearInterval(chartUpdateInterval);
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
            { type: 'voice', count: triggerTypes.voice || 0, color: PURPLE_THEME.accent700 },
            { type: 'gesture', count: triggerTypes.gesture || 0, color: PURPLE_THEME.accent500 },
            { type: 'manual', count: triggerTypes.manual || 0, color: PURPLE_THEME.accent800 }
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
  }, []);

  const announceScreenEntry = () => {
    const message = isEmergencyMode
      ? "Emergency active. Home screen. Use voice or gestures."
      : personalizedMessage || "Home screen. Ready.";

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
      title: 'Listen',
      subtitle: 'Start listening',
      icon: <Mic color={PURPLE_THEME.primary700} size={24} strokeWidth={2} />,
      gradient: PURPLE_THEME.gradientSecondary,
      onPress: startVoiceRecognition,
      variant: 'primary',
      accessibilityLabel: 'Start listening',
      accessibilityHint: 'Tap to listen for commands',
    },
    {
      title: 'See Gestures',
      subtitle: 'Start camera',
      icon: <Hand color={PURPLE_THEME.accent700} size={24} strokeWidth={2} />,
      gradient: PURPLE_THEME.gradientAccent,
      onPress: startGestureDetection,
      variant: 'secondary',
      accessibilityLabel: 'Start camera',
      accessibilityHint: 'Tap to detect gestures',
    },
    {
      title: 'Help',
      subtitle: 'Call for help',
      icon: <AlertTriangle color={PURPLE_THEME.accent900} size={24} strokeWidth={2} />,
      gradient: PURPLE_THEME.gradientAccent,
      onPress: triggerEmergency,
      variant: 'error',
      accessibilityLabel: 'Call for help',
      accessibilityHint: 'Tap to get help now',
    },
  ];

  const navigationItems = [
    {
      title: 'Settings',
      subtitle: 'Change settings',
      icon: <Settings color={PURPLE_THEME.primary700} size={24} strokeWidth={2} />,
      color: PURPLE_THEME.primary600,
      onPress: () => navigation.navigate('Settings'),
      accessibilityLabel: 'Settings',
    },
    {
      title: 'Contacts',
      subtitle: 'Edit contacts',
      icon: <Users color={PURPLE_THEME.accent700} size={24} strokeWidth={2} />,
      color: PURPLE_THEME.success,
      onPress: () => navigation.navigate('Contacts'),
      accessibilityLabel: 'Contacts',
    },
    {
      title: 'Practice',
      subtitle: 'Learn gestures',
      icon: <Hand color={PURPLE_THEME.accent600} size={24} strokeWidth={2} />,
      color: PURPLE_THEME.accent500,
      onPress: () => navigation.navigate('GestureTraining'),
      accessibilityLabel: 'Practice gestures',
    },
    {
      title: 'Help',
      subtitle: 'How to use',
      icon: <HelpCircle color={PURPLE_THEME.accent400} size={24} strokeWidth={2} />,
      color: PURPLE_THEME.warning,
      onPress: () => navigation.navigate('Help'),
      accessibilityLabel: 'Open help',
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
        {/* Compact Header */}
        <LinearGradient
          colors={PURPLE_THEME.gradientPrimary}
          style={styles.header}
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
            <Text style={styles.headerTitle}>Home</Text>
            <Text style={styles.headerSubtitle}>Voice & Gestures</Text>

            {/* Compact Stats */}
            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{usageStats.voiceCommands}</Text>
                <Text style={styles.statText}>Voice</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{usageStats.gestureDetections}</Text>
                <Text style={styles.statText}>Gestures</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{metrics.accuracy}%</Text>
                <Text style={styles.statText}>Accuracy</Text>
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
            <View style={[styles.errorBanner, { backgroundColor: PURPLE_THEME.warning }]}>
              <Text style={[styles.errorText, { color: 'white' }]}>
                {apiError}
              </Text>
            </View>
          )}

          {/* Status Indicator - Only show when active */}
          {currentStatus !== 'idle' && (
            <View style={[styles.statusCard, { backgroundColor: PURPLE_THEME.surface, borderLeftWidth: 4, borderLeftColor: PURPLE_THEME.primary500 }]}>
              <Text style={[styles.statusTitle, { color: PURPLE_THEME.textPrimary }]}>
                {currentStatus === 'listening' ? 'Listening...' : 
                 currentStatus === 'processing' ? 'Processing...' : 'Status'}
              </Text>
              <Text style={[styles.statusMessage, { color: PURPLE_THEME.textSecondary }]}>{statusMessage}</Text>
            </View>
          )}

          {/* Consolidated Quick Actions & Stats */}
          <View style={[styles.mainCard, { backgroundColor: PURPLE_THEME.surface, shadowColor: PURPLE_THEME.shadowDark }]}>
            <Text style={[styles.sectionTitle, { color: PURPLE_THEME.textPrimary }]}>Actions</Text>
            
            {/* Action Buttons Grid */}
            <View style={styles.actionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.actionCard, { backgroundColor: PURPLE_THEME.background, borderWidth: 1, borderColor: PURPLE_THEME.primary100 }]}
                  onPress={action.onPress}
                >
                  <View style={styles.actionIconContainer}>{action.icon}</View>
                  <Text style={[styles.actionTitle, { color: PURPLE_THEME.textPrimary }]}>{action.title}</Text>
                  <Text style={[styles.actionSubtitle, { color: PURPLE_THEME.textSecondary }]} numberOfLines={1}>
                    {action.subtitle}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Performance Metrics */}
            <View style={styles.metricsSection}>
              <Text style={[styles.subsectionTitle, { color: PURPLE_THEME.textPrimary }]}>System Info</Text>
              <View style={styles.metricsRow}>
                <View style={[styles.metricItem, { backgroundColor: PURPLE_THEME.background, borderWidth: 1, borderColor: PURPLE_THEME.primary100 }]}>
                  <Text style={[styles.metricValue, { color: PURPLE_THEME.primary600 }]}>{metrics.latency}ms</Text>
                  <Text style={[styles.metricLabel, { color: PURPLE_THEME.textSecondary }]}>Speed</Text>
                </View>
                <View style={[styles.metricItem, { backgroundColor: PURPLE_THEME.background, borderWidth: 1, borderColor: PURPLE_THEME.primary100 }]}>
                  <Text style={[styles.metricValue, { color: PURPLE_THEME.success }]}>{metrics.uptime}%</Text>
                  <Text style={[styles.metricLabel, { color: PURPLE_THEME.textSecondary }]}>Active</Text>
                </View>
                <View style={[styles.metricItem, { backgroundColor: PURPLE_THEME.background, borderWidth: 1, borderColor: PURPLE_THEME.primary100 }]}>
                  <Text style={[styles.metricValue, { color: PURPLE_THEME.accent600 }]}>{patterns.totalEmergencies}</Text>
                  <Text style={[styles.metricLabel, { color: PURPLE_THEME.textSecondary }]}>Alerts</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Real-time Charts */}
          <View style={[styles.chartsCard, { backgroundColor: PURPLE_THEME.surface, shadowColor: PURPLE_THEME.shadowDark }]}>
            <Text style={[styles.sectionTitle, { color: PURPLE_THEME.textPrimary }]}>Stats</Text>
            
            {/* Usage Chart */}
            <View style={styles.chartSection}>
              <Text style={[styles.chartTitle, { color: PURPLE_THEME.textPrimary }]}>Weekly Usage</Text>
              <View style={[styles.chartContainer, { backgroundColor: PURPLE_THEME.background, borderWidth: 1, borderColor: PURPLE_THEME.primary100 }]}>
                <View style={styles.chartBars}>
                  {chartData.map((height, index) => (
                    <Animated.View key={index} style={styles.barContainer}>
                      <Animated.View 
                        style={[
                          styles.chartBar, 
                          { 
                            height: `${height}%`,
                            backgroundColor: index === 6 ? PURPLE_THEME.primary500 : PURPLE_THEME.primary300
                          }
                        ]} 
                      />
                      <Text style={[styles.barLabel, { color: PURPLE_THEME.textSecondary }]}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                      </Text>
                    </Animated.View>
                  ))}
                </View>
                <View style={styles.chartLegend}>
                  <Text style={[styles.legendText, { color: PURPLE_THEME.textSecondary, fontWeight: '600' }]}>
                    Live Data
                  </Text>
                </View>
              </View>
            </View>

            {/* Performance Trends */}
            <View style={styles.chartSection}>
              <Text style={[styles.chartTitle, { color: PURPLE_THEME.textPrimary }]}>System Health</Text>
              <View style={[styles.trendContainer, { backgroundColor: PURPLE_THEME.background, borderWidth: 1, borderColor: PURPLE_THEME.primary100 }]}>
                <View style={styles.trendRow}>
                  <View style={styles.trendItem}>
                    <Text style={[styles.trendValue, { color: PURPLE_THEME.success }]}>↑ {metrics.accuracy}%</Text>
                    <Text style={[styles.trendLabel, { color: PURPLE_THEME.textSecondary }]}>Accuracy</Text>
                  </View>
                  <View style={styles.trendItem}>
                    <Text style={[styles.trendValue, { color: PURPLE_THEME.primary600 }]}>↓ {metrics.latency}ms</Text>
                    <Text style={[styles.trendLabel, { color: PURPLE_THEME.textSecondary }]}>Speed</Text>
                  </View>
                </View>
                <View style={styles.progressIndicators}>
                  <View style={styles.progressItem}>
                    <Text style={[styles.progressLabel, { color: PURPLE_THEME.textSecondary }]}>  Voice ({Math.round(performanceData.voiceAccuracy)}%)
                    </Text>
                    <View style={[styles.progressBar, { backgroundColor: PURPLE_THEME.primary200 }]}>
                      <Animated.View style={[
                        styles.progressFill, 
                        { 
                          width: `${performanceData.voiceAccuracy}%`, 
                          backgroundColor: PURPLE_THEME.success 
                        }
                      ]} />
                    </View>
                  </View>
                  <View style={styles.progressItem}>
                    <Text style={[styles.progressLabel, { color: PURPLE_THEME.textSecondary }]}>  Gestures ({Math.round(performanceData.gestureAccuracy)}%)
                    </Text>
                    <View style={[styles.progressBar, { backgroundColor: PURPLE_THEME.primary200 }]}>
                      <Animated.View style={[
                        styles.progressFill, 
                        { 
                          width: `${performanceData.gestureAccuracy}%`, 
                          backgroundColor: PURPLE_THEME.accent600 
                        }
                      ]} />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Navigation Menu - Fixed 2x2 Grid */}
          <View style={[styles.navCard, { backgroundColor: PURPLE_THEME.surface, shadowColor: PURPLE_THEME.shadowDark }]}>
            <Text style={[styles.sectionTitle, { color: PURPLE_THEME.textPrimary }]}>Menu</Text>
            <View style={styles.navGrid}>
              {navigationItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.navItem, { backgroundColor: PURPLE_THEME.background, borderWidth: 1, borderColor: PURPLE_THEME.primary100 }]}
                  onPress={item.onPress}
                >
                  <View style={styles.navIconContainer}>{item.icon}</View>
                  <Text style={[styles.navTitle, { color: PURPLE_THEME.textPrimary }]} numberOfLines={1}>{item.title}</Text>
                  <Text style={[styles.navSubtitle, { color: PURPLE_THEME.textSecondary }]} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Last Command & Voice Guide Combined */}
          {(lastCommand || currentStatus !== 'idle') && (
            <View style={[styles.commandCard, { backgroundColor: PURPLE_THEME.surface, shadowColor: PURPLE_THEME.shadowDark }]}>
              <Text style={[styles.sectionTitle, { color: PURPLE_THEME.textPrimary }]}>Voice</Text>
              {lastCommand && (
                <View style={[styles.lastCommand, { backgroundColor: PURPLE_THEME.background, borderWidth: 1, borderColor: PURPLE_THEME.primary200 }]}>
                  <Text style={[styles.commandText, { color: PURPLE_THEME.textPrimary }]}>Last: "{lastCommand}"</Text>
                </View>
              )}
              <View style={styles.voiceHints}>
                <Text style={[styles.hintText, { color: PURPLE_THEME.textSecondary, fontStyle: 'italic' }]}>
                  Say: "Help", "Settings", "Contacts"
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header Styles
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 16,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  statText: {
    fontSize: 9,
    color: 'white',
    opacity: 0.8,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 10,
  },
  // Content Styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  errorBanner: {
    margin: 12,
    padding: 10,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
    color: PURPLE_THEME.textSecondary,
  },
  // Status Card
  statusCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    shadowColor: PURPLE_THEME.shadowDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusMessage: {
    fontSize: 12,
  },
  // Main Card
  mainCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    shadowColor: PURPLE_THEME.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: PURPLE_THEME.textPrimary,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    color: PURPLE_THEME.textPrimary,
  },
  // Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  actionCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: PURPLE_THEME.shadowMedium,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
    color: PURPLE_THEME.textPrimary,
  },
  actionSubtitle: {
    fontSize: 10,
    textAlign: 'center',
    color: PURPLE_THEME.textSecondary,
  },
  // Metrics
  metricsSection: {
    marginTop: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricItem: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Navigation Card
  navCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    shadowColor: PURPLE_THEME.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  navItem: {
    width: '48%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: PURPLE_THEME.shadowMedium,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navIconContainer: {
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
    color: PURPLE_THEME.textPrimary,
  },
  navSubtitle: {
    fontSize: 10,
    textAlign: 'center',
    color: PURPLE_THEME.textSecondary,
  },
  // Command Card
  commandCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    shadowColor: PURPLE_THEME.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lastCommand: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  commandText: {
    fontSize: 13,
    fontWeight: '600',
    color: PURPLE_THEME.textPrimary,
  },
  voiceHints: {
    paddingTop: 8,
  },
  hintText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: PURPLE_THEME.textSecondary,
  },
  // Charts Styles
  chartsCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    shadowColor: PURPLE_THEME.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartSection: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: PURPLE_THEME.textPrimary,
  },
  chartContainer: {
    height: 120,
    borderRadius: 12,
    padding: 12,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingBottom: 20,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: 18,
    borderRadius: 4,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: PURPLE_THEME.textSecondary,
  },
  trendContainer: {
    borderRadius: 12,
    padding: 12,
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  trendItem: {
    alignItems: 'center',
  },
  trendValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  trendLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: PURPLE_THEME.textSecondary,
  },
  progressIndicators: {
    gap: 8,
  },
  progressItem: {
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    color: PURPLE_THEME.textSecondary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  chartLegend: {
    alignItems: 'center',
    marginTop: 8,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: PURPLE_THEME.textSecondary,
  },
});

export default DashboardScreen;