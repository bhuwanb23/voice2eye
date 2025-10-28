/**
 * Beautiful Modern Settings Screen
 * Redesigned with stunning UI, animations, and modern components
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Dimensions,
  Animated,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccessibility } from '../components/AccessibilityProvider';
import AccessibleButton from '../components/AccessibleButton';
import * as Speech from 'expo-speech';
import apiService from '../api/services/apiService';

const { width, height } = Dimensions.get('window');

// Beautiful UI Components
const StatusItem = ({ label, value, colors }) => (
  <View style={styles.statusItem}>
    <Text style={[styles.statusLabel, { color: colors?.textSecondary || '#6C757D' }]}>{label}</Text>
    <Text style={[styles.statusValue, { color: colors?.text || '#212529' }]}>{value}</Text>
  </View>
);

const SettingCard = ({ title, description, icon, value, onValueChange, colors }) => (
  <View style={[styles.settingCard, { backgroundColor: colors?.surface || '#F8F9FA', borderColor: colors?.border || '#DEE2E6' }]}>
    <View style={styles.settingCardHeader}>
      <Text style={styles.settingCardIcon}>{icon}</Text>
      <View style={styles.settingCardContent}>
        <Text style={[styles.settingCardTitle, { color: colors?.text || '#212529' }]}>{title}</Text>
        <Text style={[styles.settingCardDescription, { color: colors?.textSecondary || '#6C757D' }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors?.border || '#DEE2E6', true: colors?.primary || '#4A90E2' }}
        thumbColor={value ? '#FFFFFF' : colors?.textSecondary || '#6C757D'}
      />
    </View>
  </View>
);

const AdvancedSettingItem = ({ title, description, value, onValueChange, colors }) => (
  <View style={styles.advancedSettingItem}>
    <View style={styles.advancedSettingContent}>
      <Text style={[styles.advancedSettingTitle, { color: colors?.text || '#212529' }]}>{title}</Text>
      <Text style={[styles.advancedSettingDescription, { color: colors?.textSecondary || '#6C757D' }]}>{description}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors?.border || '#DEE2E6', true: colors?.primary || '#4A90E2' }}
      thumbColor={value ? '#FFFFFF' : colors?.textSecondary || '#6C757D'}
    />
  </View>
);

const SettingsScreen = ({ navigation }) => {
  const { settings, updateSetting, getThemeColors, resetToDefaults } = useAccessibility();
  const colors = getThemeColors() || {
    // Fallback colors in case getThemeColors returns undefined
    primary: '#4A90E2',
    secondary: '#2E7D32',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#212529',
    textSecondary: '#6C757D',
    accent: '#FF6B6B',
    error: '#DC3545',
    success: '#28A745',
    warning: '#FFC107',
    border: '#DEE2E6',
  };
  
  // Simple hardcoded settings for testing
  const testSettings = {
    usageAnalytics: true,
    performanceTracking: true,
    featureSuggestions: false,
    screenMagnification: false,
    colorInversion: false,
    voiceNavigation: true,
    emergencyMode: false,
    emergencyContacts: 3,
    voiceCommands: true,
    hapticFeedback: true,
    highContrast: false,
    textScale: 1.0,
    largeText: false,
    buttonSize: 'medium',
    audioOnlyMode: false,
    speechRate: 1.0,
    speechPitch: 1.0,
    gestureNavigation: false,
    screenReader: false,
  };
  
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [backendSettings, setBackendSettings] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Load backend settings on mount
  useEffect(() => {
    loadBackendSettings();
    
    // Start animations
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
  }, []);

  const loadBackendSettings = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getSettings();
      setBackendSettings(data.settings);
      setApiError(null);
      console.log('✅ Backend settings loaded:', data.settings);
    } catch (error) {
      console.warn('❌ Failed to load backend settings:', error.message);
      setApiError('Backend not available - using local settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    console.log(`Setting changed: ${key} = ${value}`);
    // For now, just log the change
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', onPress: () => { console.log('Settings reset requested'); }, style: 'destructive' }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Beautiful Header with Gradient */}
        <Animated.View
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.headerGradient, { backgroundColor: colors?.primary || '#4A90E2' }]}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>⚙️ Settings</Text>
              <Text style={styles.headerSubtitle}>Customize your VOICE2EYE experience</Text>
            </View>
            <View style={styles.headerDecoration}>
              <View style={[styles.decorationCircle, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
              <View style={[styles.decorationCircle, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
            </View>
          </View>
        </Animated.View>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={[styles.loadingContainer, { backgroundColor: colors?.background || '#FFFFFF' }]}>
            <ActivityIndicator size="large" color={colors?.primary || '#4A90E2'} />
            <Text style={[styles.loadingText, { color: colors?.textSecondary || '#6C757D', marginTop: 16 }]}>
              Loading settings...
            </Text>
          </View>
        )}

        {/* Error Banner */}
        {apiError && (
          <Animated.View
            style={[
              styles.errorBanner,
              { backgroundColor: colors?.warning || '#FFC107' },
              {
                opacity: fadeAnim,
                transform: [{ scale: fadeAnim }],
              },
            ]}
          >
            <Text style={[styles.errorText, { color: 'white' }]}>
              ⚠️ {apiError}
            </Text>
          </Animated.View>
        )}

        {/* Backend Status Card */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.statusCard, { backgroundColor: colors?.surface || '#F8F9FA', borderColor: colors?.border || '#DEE2E6' }]}>
            <View style={styles.statusHeader}>
              <Text style={[styles.statusTitle, { color: colors?.text || '#212529' }]}>🔗 Backend Status</Text>
              <View style={[styles.statusIndicator, { backgroundColor: backendSettings ? colors?.success || '#28A745' : colors?.error || '#DC3545' }]} />
            </View>
            {backendSettings ? (
              <View style={styles.statusContent}>
                <StatusItem label="Audio Confidence" value={`${backendSettings.audio?.confidence_threshold || 'N/A'}`} colors={colors} />
                <StatusItem label="Emergency Timeout" value={`${backendSettings.emergency?.confirmation_timeout || 'N/A'}s`} colors={colors} />
                <StatusItem label="Gesture Hold Time" value={`${backendSettings.gesture?.hold_time || 'N/A'}s`} colors={colors} />
                <StatusItem label="Sample Rate" value={`${backendSettings.audio?.sample_rate || 'N/A'}Hz`} colors={colors} />
              </View>
            ) : (
              <Text style={[styles.statusText, { color: colors?.textSecondary || '#6C757D' }]}>
                Backend data not loaded yet...
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Settings Categories */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors?.text || '#212529' }]}>🎛️ Preferences</Text>
          
          <View style={styles.settingsGrid}>
            <SettingCard
              title="Voice Navigation"
              description="Enable voice feedback for interactions"
              icon="🎤"
              value={testSettings.voiceNavigation}
              onValueChange={(value) => handleSettingChange('voiceNavigation', value)}
              colors={colors}
            />
            
            <SettingCard
              title="Haptic Feedback"
              description="Vibrate on interactions"
              icon="📳"
              value={testSettings.hapticFeedback}
              onValueChange={(value) => handleSettingChange('hapticFeedback', value)}
              colors={colors}
            />
            
            <SettingCard
              title="Usage Analytics"
              description="Help improve the app"
              icon="📊"
              value={testSettings.usageAnalytics}
              onValueChange={(value) => handleSettingChange('usageAnalytics', value)}
              colors={colors}
            />
            
            <SettingCard
              title="Performance Tracking"
              description="Monitor app performance"
              icon="⚡"
              value={testSettings.performanceTracking}
              onValueChange={(value) => handleSettingChange('performanceTracking', value)}
              colors={colors}
            />
          </View>
        </Animated.View>

        {/* Advanced Settings */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors?.text || '#212529' }]}>🔧 Advanced</Text>
          
          <View style={[styles.advancedCard, { backgroundColor: colors?.surface || '#F8F9FA', borderColor: colors?.border || '#DEE2E6' }]}>
            <AdvancedSettingItem
              title="Screen Magnification"
              description="Zoom in on content"
              value={testSettings.screenMagnification}
              onValueChange={(value) => handleSettingChange('screenMagnification', value)}
              colors={colors}
            />
            
            <AdvancedSettingItem
              title="Color Inversion"
              description="Invert colors for better visibility"
              value={testSettings.colorInversion}
              onValueChange={(value) => handleSettingChange('colorInversion', value)}
              colors={colors}
            />
            
            <AdvancedSettingItem
              title="High Contrast"
              description="Increase contrast for accessibility"
              value={testSettings.highContrast}
              onValueChange={(value) => handleSettingChange('highContrast', value)}
              colors={colors}
            />
          </View>
        </Animated.View>

        {/* Emergency Settings */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors?.text || '#212529' }]}>🚨 Emergency</Text>
          
          <View style={[styles.emergencyCard, { backgroundColor: colors?.surface || '#F8F9FA', borderColor: colors?.border || '#DEE2E6' }]}>
            <View style={styles.emergencyHeader}>
              <Text style={[styles.emergencyTitle, { color: colors?.text || '#212529' }]}>Emergency Mode</Text>
              <Switch
                value={testSettings.emergencyMode}
                onValueChange={(value) => handleSettingChange('emergencyMode', value)}
                trackColor={{ false: colors?.border || '#DEE2E6', true: colors?.error || '#DC3545' }}
                thumbColor={testSettings.emergencyMode ? '#FFFFFF' : colors?.textSecondary || '#6C757D'}
              />
            </View>
            <Text style={[styles.emergencyDescription, { color: colors?.textSecondary || '#6C757D' }]}>
              Enable emergency mode for quick access to emergency features
            </Text>
            <View style={styles.emergencyStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors?.primary || '#4A90E2' }]}>{testSettings.emergencyContacts}</Text>
                <Text style={[styles.statLabel, { color: colors?.textSecondary || '#6C757D' }]}>Contacts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors?.success || '#28A745' }]}>Active</Text>
                <Text style={[styles.statLabel, { color: colors?.textSecondary || '#6C757D' }]}>Status</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.resetButton, { backgroundColor: colors?.error || '#DC3545' }]}
              onPress={handleResetSettings}
            >
              <Text style={[styles.actionButtonText, { color: 'white' }]}>🔄 Reset Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton, { backgroundColor: colors?.primary || '#4A90E2' }]}
              onPress={() => console.log('Settings saved')}
            >
              <Text style={[styles.actionButtonText, { color: 'white' }]}>💾 Save Changes</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
        
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
  
  // Loading & Error States
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  
  // Beautiful Header
  headerContainer: {
    marginBottom: 24,
  },
  headerGradient: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  headerDecoration: {
    position: 'absolute',
    top: -20,
    right: -20,
    zIndex: 1,
  },
  decorationCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  
  // Status Card
  statusCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusContent: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Settings Grid
  settingsGrid: {
    marginHorizontal: 16,
    gap: 12,
  },
  settingCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  settingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingCardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settingCardContent: {
    flex: 1,
  },
  settingCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingCardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  
  // Advanced Settings
  advancedCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  advancedSettingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  advancedSettingContent: {
    flex: 1,
  },
  advancedSettingTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  advancedSettingDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  
  // Emergency Card
  emergencyCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emergencyDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  emergencyStats: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButton: {
    // backgroundColor set dynamically
  },
  saveButton: {
    // backgroundColor set dynamically
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Bottom Spacing
  bottomSpacing: {
    height: 40,
  },
});

export default SettingsScreen;
