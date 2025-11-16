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
  }, []);

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
        {/* Compact Header */}
        <LinearGradient
          colors={[colors.primary, colors.primary + 'E6', colors.primary + 'CC']}
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
            <Text style={styles.headerTitle}>🏠 Dashboard</Text>
            <Text style={styles.headerSubtitle}>Voice & Gesture Control</Text>

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
            <View style={[styles.errorBanner, { backgroundColor: colors.warning }]}>
              <Text style={[styles.errorText, { color: 'white' }]}>
                ⚠️ {apiError}
              </Text>
            </View>
          )}

          {/* Status Indicator - Only show when active */}
          {currentStatus !== 'idle' && (
            <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statusTitle, { color: colors.text }]}>
                {currentStatus === 'listening' ? '🎤 Listening...' : 
                 currentStatus === 'processing' ? '⚙️ Processing...' : 'Status'}
              </Text>
              <Text style={[styles.statusMessage, { color: colors.textSecondary }]}>{statusMessage}</Text>
            </View>
          )}

          {/* Consolidated Quick Actions & Stats */}
          <View style={[styles.mainCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>⚡ Quick Actions</Text>
            
            {/* Action Buttons Grid */}
            <View style={styles.actionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.actionCard, { backgroundColor: colors.background }]}
                  onPress={action.onPress}
                >
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <Text style={[styles.actionTitle, { color: colors.text }]}>{action.title}</Text>
                  <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                    {action.subtitle}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Performance Metrics */}
            <View style={styles.metricsSection}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>Performance</Text>
              <View style={styles.metricsRow}>
                <View style={[styles.metricItem, { backgroundColor: colors.background }]}>
                  <Text style={[styles.metricValue, { color: colors.primary }]}>{metrics.latency}ms</Text>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Response</Text>
                </View>
                <View style={[styles.metricItem, { backgroundColor: colors.background }]}>
                  <Text style={[styles.metricValue, { color: colors.success }]}>{metrics.uptime}%</Text>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Uptime</Text>
                </View>
                <View style={[styles.metricItem, { backgroundColor: colors.background }]}>
                  <Text style={[styles.metricValue, { color: colors.accent }]}>{patterns.totalEmergencies}</Text>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Emergencies</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Real-time Charts */}
          <View style={[styles.chartsCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>📈 Real-time Analytics</Text>
            
            {/* Usage Chart */}
            <View style={styles.chartSection}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Usage Over Time</Text>
              <View style={[styles.chartContainer, { backgroundColor: colors.background }]}>
                <View style={styles.chartBars}>
                  {chartData.map((height, index) => (
                    <Animated.View key={index} style={styles.barContainer}>
                      <Animated.View 
                        style={[
                          styles.chartBar, 
                          { 
                            height: `${height}%`,
                            backgroundColor: index === 6 ? colors.primary : colors.primary + '60'
                          }
                        ]} 
                      />
                      <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                      </Text>
                    </Animated.View>
                  ))}
                </View>
                <View style={styles.chartLegend}>
                  <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                    📊 Live Usage Data • Updates every 3s
                  </Text>
                </View>
              </View>
            </View>

            {/* Performance Trends */}
            <View style={styles.chartSection}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Performance Trends</Text>
              <View style={[styles.trendContainer, { backgroundColor: colors.background }]}>
                <View style={styles.trendRow}>
                  <View style={styles.trendItem}>
                    <Text style={[styles.trendValue, { color: colors.success }]}>↑ {metrics.accuracy}%</Text>
                    <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>Accuracy</Text>
                  </View>
                  <View style={styles.trendItem}>
                    <Text style={[styles.trendValue, { color: colors.primary }]}>↓ {metrics.latency}ms</Text>
                    <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>Latency</Text>
                  </View>
                </View>
                <View style={styles.progressIndicators}>
                  <View style={styles.progressItem}>
                    <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                      Voice Recognition ({Math.round(performanceData.voiceAccuracy)}%)
                    </Text>
                    <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                      <Animated.View style={[
                        styles.progressFill, 
                        { 
                          width: `${performanceData.voiceAccuracy}%`, 
                          backgroundColor: colors.success 
                        }
                      ]} />
                    </View>
                  </View>
                  <View style={styles.progressItem}>
                    <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                      Gesture Detection ({Math.round(performanceData.gestureAccuracy)}%)
                    </Text>
                    <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                      <Animated.View style={[
                        styles.progressFill, 
                        { 
                          width: `${performanceData.gestureAccuracy}%`, 
                          backgroundColor: colors.accent 
                        }
                      ]} />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Navigation Menu - Fixed 2x2 Grid */}
          <View style={[styles.navCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>📱 Navigation</Text>
            <View style={styles.navGrid}>
              {navigationItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.navItem, { backgroundColor: colors.background }]}
                  onPress={item.onPress}
                >
                  <Text style={styles.navIcon}>{item.icon}</Text>
                  <Text style={[styles.navTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                  <Text style={[styles.navSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Last Command & Voice Guide Combined */}
          {(lastCommand || currentStatus !== 'idle') && (
            <View style={[styles.commandCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>🎤 Voice Control</Text>
              {lastCommand && (
                <View style={[styles.lastCommand, { backgroundColor: colors.background }]}>
                  <Text style={[styles.commandText, { color: colors.text }]}>Last: "{lastCommand}"</Text>
                </View>
              )}
              <View style={styles.voiceHints}>
                <Text style={[styles.hintText, { color: colors.textSecondary }]}>Try: "Emergency", "Settings", "Contacts"</Text>
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
  },
  // Status Card
  statusCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
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
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  // Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  actionCard: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 9,
    textAlign: 'center',
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
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  // Navigation Card
  navCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  navItem: {
    width: '48%',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 6,
  },
  navTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  navSubtitle: {
    fontSize: 9,
    textAlign: 'center',
  },
  // Command Card
  commandCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  lastCommand: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  commandText: {
    fontSize: 12,
    fontWeight: '600',
  },
  voiceHints: {
    paddingTop: 8,
  },
  hintText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  // Charts Styles
  chartsCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartSection: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  chartContainer: {
    height: 120,
    borderRadius: 8,
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
    width: 16,
    borderRadius: 2,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 8,
    fontWeight: '600',
  },
  trendContainer: {
    borderRadius: 8,
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  trendLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  progressIndicators: {
    gap: 8,
  },
  progressItem: {
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
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
    fontSize: 10,
    fontWeight: '600',
  },
});

export default DashboardScreen;