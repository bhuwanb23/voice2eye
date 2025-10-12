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
  LinearGradient,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccessibility } from '../components/AccessibilityProvider';
import AccessibleButton from '../components/AccessibleButton';
import StatusIndicator from '../components/StatusIndicator';
import * as Speech from 'expo-speech';

const { width, height } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const { settings, getThemeColors, updateSetting } = useAccessibility();
  const colors = getThemeColors();
  
  const [currentStatus, setCurrentStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  
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
  }, []);

  const announceScreenEntry = () => {
    const message = isEmergencyMode 
      ? "Emergency mode active. Main dashboard. Use voice commands or gestures to navigate."
      : "Main dashboard. Voice recognition and gesture detection ready.";
    
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
    setIsEmergencyMode(true);
    setCurrentStatus('emergency');
    setStatusMessage('Emergency mode activated!');
    
    // Haptic feedback
    if (settings.hapticFeedback) {
      Vibration.vibrate([0, 500, 200, 500]); // Emergency pattern
    }
    
    // Voice announcement
    Speech.speak("Emergency mode activated! Help is being contacted.", {
      rate: 0.7, // Slower for emergency
      pitch: 1.2, // Higher pitch for urgency
    });
    
    // Show emergency confirmation
    Alert.alert(
      'Emergency Mode',
      'Emergency mode has been activated. Help is being contacted. Do you want to cancel?',
      [
        {
          text: 'Cancel Emergency',
          onPress: () => {
            setIsEmergencyMode(false);
            setCurrentStatus('idle');
            setStatusMessage('Emergency cancelled');
          },
          style: 'destructive',
        },
        {
          text: 'Keep Emergency',
          style: 'default',
        },
      ]
    );
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
      color: '#4A90E2',
      onPress: () => navigation.navigate('Settings'),
      accessibilityLabel: 'Open settings',
    },
    {
      title: 'Contacts',
      subtitle: 'Manage emergency contacts',
      icon: '👥',
      color: '#2E7D32',
      onPress: () => navigation.navigate('Contacts'),
      accessibilityLabel: 'Manage emergency contacts',
    },
    {
      title: 'Gesture Training',
      subtitle: 'Learn hand gestures',
      icon: '✋',
      color: '#FF6B6B',
      onPress: () => navigation.navigate('GestureTraining'),
      accessibilityLabel: 'Open gesture training',
    },
    {
      title: 'Help & Tutorial',
      subtitle: 'Get help and learn',
      icon: '❓',
      color: '#FF9800',
      onPress: () => navigation.navigate('Help'),
      accessibilityLabel: 'Open help and tutorial',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#f8f9fa' }]}>
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
          <View style={styles.headerGradient}>
            <Text style={styles.title}>VOICE2EYE</Text>
            <Text style={styles.subtitle}>
              {isEmergencyMode ? 'Emergency Mode Active' : 'AI-Powered Assistive Technology'}
            </Text>
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
          <Text style={styles.sectionTitle}>Quick Actions</Text>
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
          <Text style={styles.sectionTitle}>Navigation</Text>
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
                  },
                ]}
              >
                <View style={[styles.navigationIcon, { backgroundColor: item.color }]}>
                  <Text style={styles.navigationEmoji}>{item.icon}</Text>
                </View>
                <Text style={styles.navigationTitle}>{item.title}</Text>
                <Text style={styles.navigationSubtitle}>{item.subtitle}</Text>
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
          <Text style={styles.sectionTitle}>Voice Commands</Text>
          <View style={styles.commandsContainer}>
            <View style={styles.commandItem}>
              <Text style={styles.commandIcon}>🎤</Text>
              <Text style={styles.commandText}>Say "Emergency" or "Help" for emergency mode</Text>
            </View>
            <View style={styles.commandItem}>
              <Text style={styles.commandIcon}>⚙️</Text>
              <Text style={styles.commandText}>Say "Settings" to open configuration</Text>
            </View>
            <View style={styles.commandItem}>
              <Text style={styles.commandIcon}>👥</Text>
              <Text style={styles.commandText}>Say "Contacts" to manage emergency contacts</Text>
            </View>
            <View style={styles.commandItem}>
              <Text style={styles.commandIcon}>📷</Text>
              <Text style={styles.commandText}>Say "Camera" to open camera view</Text>
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
              },
            ]}
          >
            <View style={styles.lastCommandHeader}>
              <Text style={styles.lastCommandIcon}>💬</Text>
              <Text style={styles.lastCommandLabel}>Last Command</Text>
            </View>
            <Text style={styles.lastCommandText}>"{lastCommand}"</Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    backgroundColor: '#667eea',
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 15,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionCardGradient: {
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  actionButton: {
    margin: 15,
    borderRadius: 8,
  },
  navigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  navigationCard: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  navigationEmoji: {
    fontSize: 24,
  },
  navigationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
    textAlign: 'center',
  },
  navigationSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 12,
  },
  navigationButton: {
    borderRadius: 8,
  },
  commandsSection: {
    marginTop: 8,
  },
  commandsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
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
    marginBottom: 12,
  },
  commandIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  commandText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
    lineHeight: 20,
  },
  lastCommandContainer: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
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
    marginBottom: 8,
  },
  lastCommandIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  lastCommandLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  lastCommandText: {
    fontSize: 16,
    color: '#2c3e50',
    fontStyle: 'italic',
  },
});

export default DashboardScreen;