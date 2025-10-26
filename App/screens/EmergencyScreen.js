/**
 * Emergency Mode Screen
 * High-contrast, accessible emergency interface
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Vibration,
  Dimensions,
  Animated,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccessibility } from '../components/AccessibilityProvider';
import AccessibleButton from '../components/AccessibleButton';
import StatusIndicator from '../components/StatusIndicator';
import EmergencyContactDisplay from '../components/EmergencyContactDisplay';
import EmergencyHistoryTimeline from '../components/EmergencyHistoryTimeline';
import EmergencyTypeSelector from '../components/EmergencyTypeSelector';
import EmergencyMessageCustomizer from '../components/EmergencyMessageCustomizer';
import * as Speech from 'expo-speech';
import apiService from '../api/services/apiService';

const { width, height } = Dimensions.get('window');

const EmergencyScreen = ({ navigation, route }) => {
  const { settings, getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  
  const [emergencyStatus, setEmergencyStatus] = useState('idle'); // idle, triggered, confirmed, cancelled
  const [countdown, setCountdown] = useState(10);
  const [contactsNotified, setContactsNotified] = useState(0);
  const [location, setLocation] = useState('Location being determined...');
  const [emergencyType, setEmergencyType] = useState('general');
  const [customMessage, setCustomMessage] = useState('');
  const [currentAlertId, setCurrentAlertId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // Load emergency contacts and history from API
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [emergencyHistory, setEmergencyHistory] = useState([]);
  
  // Load data from backend on mount
  useEffect(() => {
    loadEmergencyData();
  }, []);

  const loadEmergencyData = async () => {
    setIsLoading(true);
    try {
      // Load emergency contacts
      const contactsData = await apiService.getEmergencyContacts();
      setEmergencyContacts(contactsData.contacts || []);
      
      // Load emergency history
      const historyData = await apiService.getEmergencyHistory(30, 10);
      setEmergencyHistory(historyData.alerts || []);
      
      setApiError(null);
      console.log('Emergency data loaded:', { contacts: contactsData.contacts, history: historyData.alerts });
    } catch (error) {
      console.warn('Failed to load emergency data:', error.message);
      setApiError('Backend not available - using mock data');
      // Fallback to mock data
      setEmergencyContacts([
        {
          id: '1',
          name: 'Emergency Services',
          phoneNumber: '911',
          priority: 'high',
          group: 'emergency',
          relationship: 'Emergency Services',
          isPrimary: true,
          enabled: true
        },
        {
          id: '2',
          name: 'Family Contact',
          phoneNumber: '+1234567890',
          priority: 'medium',
          group: 'family',
          relationship: 'Family',
          isPrimary: false,
          enabled: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerEmergency = async () => {
    try {
      setIsLoading(true);
      const result = await apiService.triggerEmergency({
        trigger_type: 'manual',
        trigger_data: {
          emergency_type: emergencyType,
          custom_message: customMessage,
          location: location
        }
      });
      
      setCurrentAlertId(result.alert_id);
      setEmergencyStatus('triggered');
      setCountdown(30); // 30 second confirmation window
      
      console.log('Emergency triggered:', result);
      
      // Start countdown
      startCountdown();
      
    } catch (error) {
      console.error('Failed to trigger emergency:', error);
      Alert.alert('Error', 'Failed to trigger emergency. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmEmergency = async () => {
    if (!currentAlertId) return;
    
    try {
      const result = await apiService.confirmEmergency(currentAlertId);
      setEmergencyStatus('confirmed');
      setContactsNotified(result.messages_sent || 0);
      
      console.log('Emergency confirmed:', result);
      
      // Reload history to show new emergency
      loadEmergencyData();
      
    } catch (error) {
      console.error('Failed to confirm emergency:', error);
      Alert.alert('Error', 'Failed to confirm emergency.');
    }
  };

  const cancelEmergency = async () => {
    if (!currentAlertId) return;
    
    try {
      await apiService.cancelEmergency(currentAlertId, 'User cancelled');
      setEmergencyStatus('cancelled');
      setCurrentAlertId(null);
      
      console.log('Emergency cancelled');
      
    } catch (error) {
      console.error('Failed to cancel emergency:', error);
      Alert.alert('Error', 'Failed to cancel emergency.');
    }
  };

  const startCountdown = () => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto-confirm if user doesn't cancel
          if (emergencyStatus === 'triggered') {
            confirmEmergency();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start emergency countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          confirmEmergency();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start pulsing animation
    const pulse = Animated.loop(
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
    );
    pulse.start();

    // Start flashing animation
    const flash = Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    flash.start();

    // Emergency voice announcement
    announceEmergency();

    // Haptic feedback
    if (settings.hapticFeedback) {
      Vibration.vibrate([0, 500, 200, 500, 200, 500]); // Emergency pattern
    }

    return () => {
      clearInterval(timer);
      pulse.stop();
      flash.stop();
    };
  }, []);

  const announceEmergency = () => {
    const message = `Emergency mode activated! Help will be contacted in ${countdown} seconds. Say "Cancel" to stop the emergency.`;
    
    Speech.speak(message, {
      rate: 0.6, // Slower for emergency
      pitch: 1.3, // Higher pitch for urgency
      language: 'en',
    });
  };

  const getEmergencyMessage = () => {
    switch (emergencyStatus) {
      case 'triggered':
        return `Emergency triggered! Help will be contacted in ${countdown} seconds.`;
      case 'confirmed':
        return 'Emergency confirmed! Help has been contacted.';
      case 'cancelled':
        return 'Emergency cancelled. You are safe.';
      default:
        return 'Emergency mode active.';
    }
  };

  const getStatusColor = () => {
    switch (emergencyStatus) {
      case 'triggered':
        return colors.warning;
      case 'confirmed':
        return colors.error;
      case 'cancelled':
        return colors.success;
      default:
        return colors.warning;
    }
  };

  // Show loading indicator while fetching data
  if (isLoading && emergencyContacts.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.error} />
        <Text style={[styles.loadingText, { color: colors.textSecondary, marginTop: 16 }]}>
          Loading emergency data...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Error Banner */}
      {apiError && (
        <View style={[styles.errorBanner, { backgroundColor: colors.warning }]}>
          <Text style={[styles.errorText, { color: 'white' }]}>
            ⚠️ {apiError}
          </Text>
        </View>
      )}

      {/* Emergency Header */}
      <Animated.View
        style={[
          styles.emergencyHeader,
          {
            backgroundColor: getStatusColor(),
            transform: [{ scale: pulseAnim }],
            opacity: flashAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          },
        ]}
      >
        <Text style={styles.emergencyTitle}>
          🚨 EMERGENCY MODE 🚨
        </Text>
        <Text style={styles.emergencySubtitle}>
          {getEmergencyMessage()}
        </Text>
      </Animated.View>

      {/* Main Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Information */}
        <View style={[styles.statusContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            Emergency Status
          </Text>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {emergencyStatus.toUpperCase()}
          </Text>
        </View>

        {/* Countdown Timer */}
        {emergencyStatus === 'triggered' && (
          <View style={[styles.countdownContainer, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.countdownLabel}>
              Auto-confirm in:
            </Text>
            <Text style={[styles.countdownText, { color: 'white' }]}>
              {countdown} seconds
            </Text>
          </View>
        )}

        {/* Emergency Type Selection */}
        <EmergencyTypeSelector 
          selectedType={emergencyType}
          onTypeChange={setEmergencyType}
        />

        {/* Emergency Contact Display with Priority Levels */}
        <EmergencyContactDisplay contacts={emergencyContacts} />

        {/* Location Information */}
        <View style={[styles.locationContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.locationLabel, { color: colors.text }]}>
            Your Location:
          </Text>
          <Text style={[styles.locationText, { color: colors.text }]}>
            {location}
          </Text>
        </View>

        {/* Emergency Message Customization */}
        <EmergencyMessageCustomizer 
          defaultMessage="HELP! I need immediate assistance. My location is: {{location}}. Time: {{time}}"
          onMessageChange={setCustomMessage}
        />

        {/* Contacts Notified */}
        {emergencyStatus === 'confirmed' && (
          <View style={[styles.contactsContainer, { backgroundColor: colors.success }]}>
            <Text style={styles.contactsLabel}>
              Emergency Contacts Notified:
            </Text>
            <Text style={styles.contactsText}>
              {contactsNotified} contacts
            </Text>
          </View>
        )}

        {/* Emergency History Timeline */}
        <EmergencyHistoryTimeline history={emergencyHistory} />

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {emergencyStatus === 'triggered' && (
            <AccessibleButton
              title="CANCEL EMERGENCY"
              onPress={cancelEmergency}
              variant="warning"
              size="extra-large"
              accessibilityLabel="Cancel emergency alert"
              accessibilityHint="Tap to cancel the emergency and stop contacting help"
              style={styles.cancelButton}
            />
          )}

          {emergencyStatus === 'confirmed' && (
            <AccessibleButton
              title="CANCEL EMERGENCY"
              onPress={cancelEmergency}
              variant="warning"
              size="extra-large"
              accessibilityLabel="Cancel emergency alert"
              accessibilityHint="Tap to cancel the emergency if help is no longer needed"
              style={styles.cancelButton}
            />
          )}

          <AccessibleButton
            title="CALL 911"
            onPress={() => {
              // In a real app, this would open the phone dialer
              Alert.alert('Calling 911', 'Emergency services will be contacted.');
            }}
            variant="error"
            size="extra-large"
            accessibilityLabel="Call 911 emergency services"
            accessibilityHint="Tap to directly call 911 emergency services"
            style={styles.emergencyButton}
          />
        </View>

        {/* Voice Commands */}
        <View style={[styles.voiceCommandsContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.voiceCommandsTitle, { color: colors.text }]}>
            Voice Commands:
          </Text>
          <Text style={[styles.voiceCommandText, { color: colors.text }]}>
            Say "Cancel" to cancel emergency
          </Text>
          <Text style={[styles.voiceCommandText, { color: colors.text }]}>
            Say "Help" for more assistance
          </Text>
          <Text style={[styles.voiceCommandText, { color: colors.text }]}>
            Say "Location" to hear your location
          </Text>
        </View>
      </ScrollView>

      {/* Status Indicator */}
      <StatusIndicator
        status="emergency"
        message={getEmergencyMessage()}
        announceVoice={false}
        style={styles.statusIndicator}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  emergencyHeader: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#FFFFFF',
  },
  emergencyTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  emergencySubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
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
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  countdownContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  countdownLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  locationContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 18,
  },
  contactsContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
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
  contactsLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  contactsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actionsContainer: {
    marginBottom: 20,
  },
  cancelButton: {
    marginBottom: 16,
    minHeight: 80,
  },
  emergencyButton: {
    minHeight: 80,
  },
  voiceCommandsContainer: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  voiceCommandsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  voiceCommandText: {
    fontSize: 14,
    marginBottom: 5,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 80, // Adjusted to account for bottom navigation bar
    left: 20,
    right: 20,
  },
});

export default EmergencyScreen;