/**
 * Beautiful Modern Dashboard Screen
 * Stunning UI with gradients, animations, and professional design
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
import AccessibleButton from '../components/AccessibleButton';
import StatusIndicator from '../components/StatusIndicator';
import AnalyticsCards from '../components/AnalyticsCards';
import ServiceStatus from '../components/ServiceStatus';
import EmergencyHistory from '../components/EmergencyHistory';
import * as Speech from 'expo-speech';

const { width, height } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const { settings, getThemeColors, updateSetting } = useAccessibility();
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
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
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
    
    // Start pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
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
      pulseAnim.stopAnimation();
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
        {/* Beautiful Header with Gradient */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.headerGradient, { backgroundColor: colors.primary }]}>
            <Text style={styles.title}>VOICE2EYE</Text>
            <Text style={styles.subtitle}>
              {isEmergencyMode ? 'Emergency Mode Active' : 'AI-Powered Assistive Technology'}
            </Text>
            {personalizedMessage ? (
              <Text style={styles.welcomeMessage}>{personalizedMessage}</Text>
            ) : null}
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: isEmergencyMode ? '#ff6b6b' : '#4CAF50' }]} />
              <Text style={styles.statusText}>
                {isEmergencyMode ? 'Emergency Active' : 'System Ready'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Status Indicator */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <StatusIndicator
            status={currentStatus}
            message={statusMessage}
            announceVoice={true}
          />
        </Animated.View>

        {/* Analytics/Statistics Display Section */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <AnalyticsCards usageStats={usageStats} />
        </Animated.View>

        {/* Real-time Status Indicators */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <ServiceStatus serviceStatus={serviceStatus} />
        </Animated.View>

        {/* Quick Actions with Beautiful Cards */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.actionCard,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <View style={[styles.actionCardGradient, { backgroundColor: action.gradient[0] }]}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
                <AccessibleButton
                  title="Activate"
                  onPress={action.onPress}
                  variant="primary"
                  size="medium"
                  accessibilityLabel={action.accessibilityLabel}
                  accessibilityHint={action.accessibilityHint}
                  style={styles.actionButton}
                />
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Emergency Alert History Preview */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <EmergencyHistory emergencyHistory={emergencyHistory} />
        </Animated.View>

        {/* Navigation Menu with Beautiful Cards */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Navigation</Text>
          <View style={styles.navigationGrid}>
            {navigationItems.map((item, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.navigationCard,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateY: slideAnim },
                      { scale: pulseAnim },
                    ],
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <View style={[styles.navigationIcon, { backgroundColor: item.color }]}>
                  <Text style={styles.navigationEmoji}>{item.icon}</Text>
                </View>
                <Text style={[styles.navigationTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.navigationSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                <AccessibleButton
                  title="Open"
                  onPress={item.onPress}
                  variant="outline"
                  size="small"
                  accessibilityLabel={item.accessibilityLabel}
                  style={[styles.navigationButton, { borderColor: item.color }]}
                />
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Voice Commands Reference with Beautiful Design */}
        <Animated.View
          style={[
            styles.section,
            styles.commandsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Voice Commands</Text>
          <View style={[styles.commandsContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.commandItem}>
              <Text style={styles.commandIcon}>🎤</Text>
              <Text style={[styles.commandText, { color: colors.text }]}>
                Say "Emergency" or "Help" for emergency mode
              </Text>
            </View>
            <View style={styles.commandItem}>
              <Text style={styles.commandIcon}>⚙️</Text>
              <Text style={[styles.commandText, { color: colors.text }]}>
                Say "Settings" to open configuration
              </Text>
            </View>
            <View style={styles.commandItem}>
              <Text style={styles.commandIcon}>👥</Text>
              <Text style={[styles.commandText, { color: colors.text }]}>
                Say "Contacts" to manage emergency contacts
              </Text>
            </View>
            <View style={styles.commandItem}>
              <Text style={styles.commandIcon}>📷</Text>
              <Text style={[styles.commandText, { color: colors.text }]}>
                Say "Camera" to open camera view
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Last Command Display with Beautiful Design */}
        {lastCommand && (
          <Animated.View
            style={[
              styles.lastCommandContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                backgroundColor: colors.surface,
              },
            ]}
          >
            <View style={styles.lastCommandHeader}>
              <Text style={styles.lastCommandIcon}>💬</Text>
              <Text style={[styles.lastCommandLabel, { color: colors.textSecondary }]}>
                Last Command
              </Text>
            </View>
            <Text style={[styles.lastCommandText, { color: colors.text }]}>
              "{lastCommand}"
            </Text>
          </Animated.View>
        )}
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
    paddingBottom: 20,
  },
  header: {
    marginBottom: 10,
  },
  headerGradient: {
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 4,
  },
  welcomeMessage: {
    fontSize: 13,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionCardGradient: {
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 11,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  actionButton: {
    margin: 12,
    borderRadius: 6,
  },
  navigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  navigationCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navigationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  navigationEmoji: {
    fontSize: 20,
  },
  navigationTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  navigationSubtitle: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 10,
  },
  navigationButton: {
    borderRadius: 6,
  },
  commandsSection: {
    marginTop: 4,
  },
  commandsContainer: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  commandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  commandIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  commandText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  lastCommandContainer: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lastCommandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  lastCommandIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  lastCommandLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  lastCommandText: {
    fontSize: 15,
    fontStyle: 'italic',
  },
});

export default DashboardScreen;