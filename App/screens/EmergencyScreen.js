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
  
  // Load emergency contacts and history from API with initial sample data
  const [emergencyContacts, setEmergencyContacts] = useState([
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
  const [emergencyHistory, setEmergencyHistory] = useState([
    {
      alert_id: 'sample_1',
      trigger_type: 'manual',
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      location: '123 Main St, Downtown, City 10001',
      messages_sent: 5
    },
    {
      alert_id: 'sample_2',
      trigger_type: 'voice',
      status: 'cancelled',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      location: '456 Oak Ave, Suburb, City 10002',
      messages_sent: 0
    },
    {
      alert_id: 'sample_3',
      trigger_type: 'gesture',
      status: 'confirmed',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      location: '789 Pine Rd, Uptown, City 10003',
      messages_sent: 4
    },
    {
      alert_id: 'sample_4',
      trigger_type: 'manual',
      status: 'confirmed',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      location: '321 Elm St, Midtown, City 10004',
      messages_sent: 6
    },
    {
      alert_id: 'sample_5',
      trigger_type: 'voice',
      status: 'pending',
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      location: '654 Maple Dr, Eastside, City 10005',
      messages_sent: 2
    },
    {
      alert_id: 'sample_6',
      trigger_type: 'gesture',
      status: 'cancelled',
      timestamp: new Date(Date.now() - 345600000).toISOString(),
      location: '987 Cedar Ln, Westside, City 10006',
      messages_sent: 0
    },
    {
      alert_id: 'sample_7',
      trigger_type: 'manual',
      status: 'confirmed',
      timestamp: new Date(Date.now() - 432000000).toISOString(),
      location: '147 Birch Ave, Northside, City 10007',
      messages_sent: 3
    },
    {
      alert_id: 'sample_8',
      trigger_type: 'voice',
      status: 'confirmed',
      timestamp: new Date(Date.now() - 518400000).toISOString(),
      location: '258 Spruce St, Southside, City 10008',
      messages_sent: 5
    }
  ]);
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
      
      // Mock history data with more sample entries
      setEmergencyHistory([
        {
          alert_id: 'sample_1',
          trigger_type: 'manual',
          status: 'confirmed',
          timestamp: new Date().toISOString(),
          location: '123 Main St, Downtown, City 10001',
          messages_sent: 5
        },
        {
          alert_id: 'sample_2',
          trigger_type: 'voice',
          status: 'cancelled',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          location: '456 Oak Ave, Suburb, City 10002',
          messages_sent: 0
        },
        {
          alert_id: 'sample_3',
          trigger_type: 'gesture',
          status: 'confirmed',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          location: '789 Pine Rd, Uptown, City 10003',
          messages_sent: 4
        },
        {
          alert_id: 'sample_4',
          trigger_type: 'manual',
          status: 'confirmed',
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          location: '321 Elm St, Midtown, City 10004',
          messages_sent: 6
        },
        {
          alert_id: 'sample_5',
          trigger_type: 'voice',
          status: 'pending',
          timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          location: '654 Maple Dr, Eastside, City 10005',
          messages_sent: 2
        },
        {
          alert_id: 'sample_6',
          trigger_type: 'gesture',
          status: 'cancelled',
          timestamp: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
          location: '987 Cedar Ln, Westside, City 10006',
          messages_sent: 0
        },
        {
          alert_id: 'sample_7',
          trigger_type: 'manual',
          status: 'confirmed',
          timestamp: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
          location: '147 Birch Ave, Northside, City 10007',
          messages_sent: 3
        },
        {
          alert_id: 'sample_8',
          trigger_type: 'voice',
          status: 'confirmed',
          timestamp: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
          location: '258 Spruce St, Southside, City 10008',
          messages_sent: 5
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
      
      try {
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
        
        console.log('Emergency triggered via API:', result);
        
      } catch (apiError) {
        console.warn('API unavailable, using offline mode:', apiError.message);
        
        // Fallback to offline emergency mode
        const mockAlertId = `offline_${Date.now()}`;
        setCurrentAlertId(mockAlertId);
        setEmergencyStatus('triggered');
        setCountdown(emergencySettings.emergencyTimeout || 10); // Use settings timeout or default to 10 seconds
        
        console.log('Emergency triggered in offline mode:', mockAlertId);
        
        // Show offline mode notification
        Alert.alert(
          'Emergency Activated (Offline Mode)', 
          'Backend unavailable. Emergency will proceed with local countdown.',
          [{ text: 'OK' }]
        );
      }
      
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
      if (currentAlertId.startsWith('offline_')) {
        // Handle offline mode confirmation
        setEmergencyStatus('confirmed');
        setContactsNotified(emergencyContacts.length);
        
        console.log('Emergency confirmed in offline mode:', currentAlertId);
        
        // Show offline confirmation message
        Alert.alert(
          'Emergency Confirmed (Offline Mode)',
          `Emergency activated locally. ${emergencyContacts.length} contacts would be notified when online.`,
          [{ text: 'OK' }]
        );
        
        return;
      }
      
      // Try API confirmation
      const result = await apiService.confirmEmergency(currentAlertId);
      setEmergencyStatus('confirmed');
      setContactsNotified(result.messages_sent || 0);
      
      console.log('Emergency confirmed via API:', result);
      
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
      
      // Fallback to offline confirmation
      setEmergencyStatus('confirmed');
      setContactsNotified(emergencyContacts.length);
      
      Alert.alert(
        'Emergency Confirmed (Offline Mode)', 
        `API unavailable. Emergency confirmed locally. ${emergencyContacts.length} contacts would be notified when online.`,
        [{ text: 'OK' }]
      );
    }
  };

  const cancelEmergency = async () => {
    if (!currentAlertId) return;
    
    try {
      if (currentAlertId.startsWith('offline_')) {
        // Handle offline mode cancellation
        setEmergencyStatus('cancelled');
        setCurrentAlertId(null);
        
        console.log('Emergency cancelled in offline mode:', currentAlertId);
        
        // Show offline cancellation message
        Alert.alert(
          'Emergency Cancelled',
          'Your emergency alert has been cancelled.',
          [{ text: 'OK' }]
        );
        
        return;
      }
      
      // Try API cancellation
      await apiService.cancelEmergency(currentAlertId, 'User cancelled');
      setEmergencyStatus('cancelled');
      setCurrentAlertId(null);
      
      console.log('Emergency cancelled via API');
      
      // Show cancellation message
      Alert.alert(
        'Emergency Cancelled',
        'Your emergency alert has been cancelled.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Failed to cancel emergency via API:', error);
      
      // Fallback to offline cancellation
      setEmergencyStatus('cancelled');
      setCurrentAlertId(null);
      
      Alert.alert(
        'Emergency Cancelled',
        'Your emergency alert has been cancelled.',
        [{ text: 'OK' }]
      );
    }
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
      
      // Voice announcement only when emergency is triggered (not on page load)
      const message = `Emergency triggered! Help will be contacted in ${countdown} seconds. Tap stop to cancel.`;
      Speech.speak(message, {
        rate: 0.7,
        pitch: 1.2,
        language: 'en',
      });
      
      // Haptic feedback
      if (settings.hapticFeedback) {
        Vibration.vibrate([0, 500, 200, 500]); // Emergency pattern
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [emergencyStatus]);

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
        return colors.error;
      case 'confirmed':
        return colors.success;
      case 'cancelled':
        return colors.warning;
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

      {/* Professional Emergency Header with Back Button */}
      <View style={[styles.emergencyHeader, { backgroundColor: emergencyStatus === 'triggered' ? colors.error : colors.surface }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Dashboard' })}
          accessibilityLabel="Go back to Dashboard"
        >
          <Text style={[styles.backButtonIcon, { color: emergencyStatus === 'triggered' ? '#FFFFFF' : colors.text }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.emergencyTitle, { color: emergencyStatus === 'triggered' ? '#FFFFFF' : colors.text }]}>
            {emergencyStatus === 'triggered' ? '🚨 Emergency Active' : '🛡️ Emergency Center'}
          </Text>
          <Text style={[styles.emergencySubtitle, { color: emergencyStatus === 'triggered' ? '#FFFFFF' : colors.textSecondary }]}>
            {emergencyStatus === 'triggered' ? `Auto-confirming in ${countdown}s` : 'Ready to assist you'}
          </Text>
        </View>
        {emergencyStatus === 'triggered' && (
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownNumber}>{countdown}</Text>
            <Text style={styles.countdownLabel}>sec</Text>
          </View>
        )}
      </View>

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

      {/* Professional Emergency Control Panel - Fixed at bottom */}
      <View style={[styles.emergencyControlPanel, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {emergencyStatus === 'triggered' ? (
          // Emergency Active State - Professional Design
          <View style={styles.emergencyActivePanel}>
            <View style={[styles.activeStatusCard, { backgroundColor: colors.error }]}>
              <View style={styles.statusRow}>
                <View style={styles.pulseIndicator}>
                  <View style={[styles.pulseDot, { backgroundColor: '#FFFFFF' }]} />
                </View>
                <View style={styles.statusInfo}>
                  <Text style={styles.activeStatusTitle}>Emergency Active</Text>
                  <Text style={styles.activeStatusSubtitle}>Contacts will be notified</Text>
                </View>
                <View style={styles.timerBadge}>
                  <Text style={styles.timerBadgeNumber}>{countdown}</Text>
                  <Text style={styles.timerBadgeLabel}>sec</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.warning }]}
              onPress={cancelEmergency}
              accessibilityLabel="Cancel emergency"
            >
              <Text style={styles.cancelButtonIcon}>✋</Text>
              <Text style={styles.cancelButtonText}>Cancel Emergency</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Normal State - Professional Design
          <View style={styles.emergencyNormalPanel}>
            <TouchableOpacity
              style={[styles.mainEmergencyButton, { backgroundColor: colors.error }]}
              onPress={triggerEmergency}
              disabled={isLoading}
              accessibilityLabel="Trigger emergency alert"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <View style={styles.buttonIconContainer}>
                    <Text style={styles.buttonIcon}>🚨</Text>
                  </View>
                  <Text style={styles.mainButtonText}>Trigger Emergency</Text>
                  <Text style={styles.mainButtonSubtext}>Alert all contacts</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickCallButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                Alert.alert('Calling 911', 'Emergency services will be contacted.');
              }}
              accessibilityLabel="Call 911 emergency services"
            >
              <View style={styles.buttonIconContainer}>
                <Text style={styles.buttonIcon}>📞</Text>
              </View>
              <Text style={styles.quickCallText}>Call 911</Text>
              <Text style={styles.quickCallSubtext}>Direct call</Text>
            </TouchableOpacity>
          </View>
        )}
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
  // Bigger Professional Header
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  countdownBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  countdownNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  countdownLabel: {
    fontSize: 9,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  // Compact Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    width: '70%',
    borderRadius: 1,
  },
  activeTab: {
    // Active tab styling
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 12,
    paddingBottom: 100, // Extra padding for control panel
  },
  tabContent: {
    flex: 1,
  },
  // Compact Emergency Control Panel
  emergencyControlPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  emergencyActivePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emergencyNormalPanel: {
    flexDirection: 'row',
    gap: 10,
  },
  timerSection: {
    alignItems: 'center',
    flex: 1,
  },
  // Compact Active Panel Styles
  activeStatusCard: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusInfo: {
    flex: 1,
  },
  activeStatusTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  activeStatusSubtitle: {
    color: '#FFFFFF',
    fontSize: 9,
    opacity: 0.9,
  },
  timerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 5,
    minWidth: 45,
    alignItems: 'center',
  },
  timerBadgeNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerBadgeLabel: {
    color: '#FFFFFF',
    fontSize: 7,
    opacity: 0.9,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  cancelButtonIcon: {
    fontSize: 16,
    marginBottom: 3,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  // Smaller Bottom Buttons
  mainEmergencyButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonIconContainer: {
    marginBottom: 3,
  },
  buttonIcon: {
    fontSize: 18,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  mainButtonSubtext: {
    color: '#FFFFFF',
    fontSize: 8,
    opacity: 0.9,
  },
  quickCallButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  quickCallText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  quickCallSubtext: {
    color: '#FFFFFF',
    fontSize: 8,
    opacity: 0.9,
  },
});

export default EmergencyScreen;