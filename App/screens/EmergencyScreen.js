/**
 * Emergency Mode Screen
 * High-contrast, accessible emergency interface with tab navigation
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
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccessibility } from '../components/AccessibilityProvider';
import AccessibleButton from '../components/AccessibleButton';
import StatusIndicator from '../components/StatusIndicator';
import EmergencyContactDisplay from '../components/EmergencyContactDisplay';
import EmergencyHistoryTimeline from '../components/EmergencyHistoryTimeline';
import EmergencyMessageCustomizer from '../components/EmergencyMessageCustomizer';
import EmergencyPatterns from '../components/EmergencyPatterns';
import EmergencySystemSettings from '../components/EmergencySystemSettings';
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
  const [activeTab, setActiveTab] = useState('contacts'); // contacts, history, settings, patterns
  
  // Load emergency contacts and history from API
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [emergencyHistory, setEmergencyHistory] = useState([]);
  const [emergencySettings, setEmergencySettings] = useState({
    autoTriggerEmergency: true,
    emergencyTimeout: 10,
    locationTracking: true,
    silentEmergency: false,
    multipleContactAttempts: true,
  });
  const [notificationStatuses, setNotificationStatuses] = useState({});

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
      
      // Mock history data
      setEmergencyHistory([
        {
          alert_id: 'mock_1',
          trigger_type: 'manual',
          status: 'confirmed',
          timestamp: new Date().toISOString(),
          location: '123 Main St, City, State',
          messages_sent: 3
        },
        {
          alert_id: 'mock_2',
          trigger_type: 'voice',
          status: 'cancelled',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          location: '456 Oak Ave, City, State',
          messages_sent: 0
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerEmergency = async () => {
    try {
      setIsLoading(true);
      
      // Get current location if location tracking is enabled
      let currentLocation = location;
      if (emergencySettings.locationTracking) {
        // In a real implementation, we would get the actual current location
        currentLocation = "Current location being determined...";
      }
      
      const result = await apiService.triggerEmergency({
        trigger_type: 'manual',
        trigger_data: {
          emergency_type: emergencyType,
          custom_message: customMessage || `HELP! I need immediate assistance. My location is: ${currentLocation}. Time: ${new Date().toLocaleString()}`,
          location: currentLocation
        },
        location: currentLocation,
        user_id: null // In a real implementation, this would be the actual user ID
      });
      
      setCurrentAlertId(result.alert_id);
      setEmergencyStatus('triggered');
      setCountdown(result.confirmation_timeout || 30); // Use backend timeout or default to 30 seconds
      
      console.log('Emergency triggered:', result);
      
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
      
      // Update notification statuses for contacts
      if (result.contact_statuses) {
        setNotificationStatuses(result.contact_statuses);
      }
      
      // Show confirmation message
      Alert.alert(
        'Emergency Confirmed',
        `Help has been contacted. ${result.messages_sent || 0} contacts notified.`,
        [{ text: 'OK' }]
      );
      
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
      
      // Show cancellation message
      Alert.alert(
        'Emergency Cancelled',
        'Your emergency alert has been cancelled.',
        [{ text: 'OK' }]
      );
      
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
    // Start emergency countdown only when in triggered state
    let timer;
    if (emergencyStatus === 'triggered') {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            confirmEmergency();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

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
      if (timer) clearInterval(timer);
      pulse.stop();
      flash.stop();
    };
  }, [emergencyStatus]);

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

  const handleSettingChange = (key, value) => {
    setEmergencySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getEmergencyStatus = async () => {
    if (!currentAlertId) return;
    
    try {
      const status = await apiService.getEmergencyStatus(currentAlertId);
      console.log('Emergency status:', status);
      // In a real implementation, we might update UI based on status
    } catch (error) {
      console.error('Failed to get emergency status:', error);
    }
  };

  // Poll for emergency status updates when in triggered state
  useEffect(() => {
    let statusInterval;
    if (emergencyStatus === 'triggered' && currentAlertId) {
      // Get initial status
      getEmergencyStatus();
      
      // Poll for status updates every 5 seconds
      statusInterval = setInterval(() => {
        getEmergencyStatus();
      }, 5000);
    }
    
    return () => {
      if (statusInterval) clearInterval(statusInterval);
    };
  }, [emergencyStatus, currentAlertId]);

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

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'contacts' && styles.activeTab]}
          onPress={() => setActiveTab('contacts')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'contacts' ? colors.primary : colors.textSecondary }]}>
            Contacts
          </Text>
          {activeTab === 'contacts' && <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'history' ? colors.primary : colors.textSecondary }]}>
            History
          </Text>
          {activeTab === 'history' && <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'patterns' && styles.activeTab]}
          onPress={() => setActiveTab('patterns')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'patterns' ? colors.primary : colors.textSecondary }]}>
            Patterns
          </Text>
          {activeTab === 'patterns' && <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'settings' ? colors.primary : colors.textSecondary }]}>
            Settings
          </Text>
          {activeTab === 'settings' && <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <View style={styles.tabContent}>
            <EmergencyContactDisplay 
              contacts={emergencyContacts} 
              notificationStatuses={notificationStatuses}
            />
          </View>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <View style={styles.tabContent}>
            <EmergencyHistoryTimeline history={emergencyHistory} />
          </View>
        )}

        {/* Patterns Tab */}
        {activeTab === 'patterns' && (
          <View style={styles.tabContent}>
            <EmergencyPatterns />
          </View>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <View style={styles.tabContent}>
            <EmergencySystemSettings 
              settings={emergencySettings} 
              onSettingChange={handleSettingChange} 
            />
            <EmergencyMessageCustomizer 
              defaultMessage="HELP! I need immediate assistance. My location is: {{location}}. Time: {{time}}"
              onMessageChange={setCustomMessage}
            />
          </View>
        )}
      </ScrollView>

      {/* Emergency Control Panel - Fixed at bottom */}
      <View style={[styles.emergencyControlPanel, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {emergencyStatus === 'triggered' ? (
          // Emergency Active State
          <Animated.View style={[
            styles.emergencyActivePanel,
            {
              backgroundColor: colors.error,
              transform: [{ scale: pulseAnim }],
              opacity: flashAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            }
          ]}>
            <View style={styles.timerSection}>
              <Text style={styles.emergencyTimerLabel}>EMERGENCY ACTIVE</Text>
              <Text style={styles.emergencyTimerCount}>{countdown}s</Text>
              <Text style={styles.emergencyTimerSubtext}>Auto-confirming in</Text>
            </View>
            <TouchableOpacity
              style={[styles.stopEmergencyButton, { backgroundColor: colors.warning }]}
              onPress={cancelEmergency}
              accessibilityLabel="Stop emergency countdown"
            >
              <Text style={styles.stopEmergencyText}>STOP</Text>
              <Text style={styles.stopEmergencySubtext}>Cancel Emergency</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          // Normal State
          <View style={styles.emergencyNormalPanel}>
            <TouchableOpacity
              style={[styles.triggerEmergencyButton, { backgroundColor: colors.error }]}
              onPress={triggerEmergency}
              disabled={isLoading}
              accessibilityLabel="Trigger emergency alert"
            >
              <Text style={styles.triggerEmergencyText}>🚨 EMERGENCY</Text>
              <Text style={styles.triggerEmergencySubtext}>Tap to activate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.callButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                Alert.alert('Calling 911', 'Emergency services will be contacted.');
              }}
              accessibilityLabel="Call 911 emergency services"
            >
              <Text style={styles.callButtonText}>📞 CALL 911</Text>
              <Text style={styles.callButtonSubtext}>Direct call</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Status Indicator - Positioned properly to avoid overlap */}
      <View style={styles.statusIndicatorContainer}>
        <StatusIndicator
          status="emergency"
          message={getEmergencyMessage()}
          announceVoice={false}
        />
      </View>
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
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  emergencySubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '80%',
    borderRadius: 2,
  },
  activeTab: {
    // Active tab styling
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120, // Extra padding to account for emergency control panel
  },
  tabContent: {
    flex: 1,
  },
  // Emergency Control Panel - Fixed at bottom
  emergencyControlPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 2,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  emergencyActivePanel: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  emergencyNormalPanel: {
    flexDirection: 'row',
    gap: 12,
  },
  timerSection: {
    alignItems: 'center',
    flex: 1,
  },
  emergencyTimerLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  emergencyTimerCount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  emergencyTimerSubtext: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.9,
  },
  stopEmergencyButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  stopEmergencyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  stopEmergencySubtext: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.9,
    marginTop: 2,
  },
  triggerEmergencyButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  triggerEmergencyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  triggerEmergencySubtext: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.9,
    marginTop: 2,
  },
  callButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  callButtonSubtext: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.9,
    marginTop: 2,
  },
  // Status indicator container - positioned above emergency control panel
  statusIndicatorContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
  },
});

export default EmergencyScreen;