/**
 * Beautiful Modern Settings Screen
 * Enhanced with gradients, cards, and modern design
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccessibility } from '../components/AccessibilityProvider';
import AccessibleButton from '../components/AccessibleButton';
import * as Speech from 'expo-speech';
import apiService from '../api/services/apiService';

const { width } = Dimensions.get('window');

const SettingsScreen = ({ navigation }) => {
  const { settings, updateSetting, getThemeColors, resetToDefaults } = useAccessibility();
  const colors = getThemeColors();
  
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
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: () => {
            console.log('Settings reset requested');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const SettingItem = ({ title, description, value, onValueChange, type = 'switch', icon }) => (
    <Animated.View
      style={[
        styles.settingItem,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.settingContent}>
        <View style={styles.settingHeader}>
          <Text style={[styles.settingIcon, { color: colors.primary }]}>{icon}</Text>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        </View>
        {description && (
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{description}</Text>
        )}
      </View>
      <View style={styles.settingControl}>
        {type === 'switch' ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={value ? '#FFFFFF' : colors.textSecondary}
            accessible={true}
            accessibilityLabel={`${title} setting`}
            accessibilityHint={`Tap to ${value ? 'disable' : 'enable'} ${title}`}
          />
        ) : (
          <Text style={[styles.settingValue, { color: colors.primary }]}>{value}</Text>
        )}
      </View>
    </Animated.View>
  );

  const ButtonSizeSelector = () => (
    <Animated.View
      style={[
        styles.compactSettingItem,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.compactSettingHeader}>
        <Text style={[styles.settingIcon, { color: colors.primary }]}>📏</Text>
        <Text style={[styles.settingTitle, { color: colors.text }]}>Button Size</Text>
      </View>
      <View style={styles.compactButtonSizeContainer}>
        {['small', 'medium', 'large', 'extra-large'].map((size) => (
          <AccessibleButton
            key={size}
            title={size.replace('-', ' ').toUpperCase()}
            onPress={() => handleSettingChange('buttonSize', size)}
            variant={settings.buttonSize === size ? 'primary' : 'outline'}
            size="small"
            style={[
              styles.compactButtonSizeOption,
              settings.buttonSize === size && styles.selectedOption,
            ]}
            accessibilityLabel={`Set button size to ${size}`}
          />
        ))}
      </View>
    </Animated.View>
  );

  const TextScaleSelector = () => (
    <Animated.View
      style={[
        styles.compactSettingItem,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.compactSettingHeader}>
        <Text style={[styles.settingIcon, { color: colors.primary }]}>🔍</Text>
        <Text style={[styles.settingTitle, { color: colors.text }]}>Text Scale</Text>
      </View>
      <View style={styles.compactTextScaleContainer}>
        {[1.0, 1.25, 1.5, 1.75, 2.0].map((scale) => (
          <AccessibleButton
            key={scale}
            title={`${Math.round(scale * 100)}%`}
            onPress={() => handleSettingChange('textScale', scale)}
            variant={settings.textScale === scale ? 'primary' : 'outline'}
            size="small"
            style={[
              styles.compactTextScaleOption,
              settings.textScale === scale && styles.selectedOption,
            ]}
            accessibilityLabel={`Set text scale to ${Math.round(scale * 100)} percent`}
          />
        ))}
      </View>
    </Animated.View>
  );

  const ThemeSelector = () => (
    <Animated.View
      style={[
        styles.compactSettingItem,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.compactSettingHeader}>
        <Text style={[styles.settingIcon, { color: colors.primary }]}>🎨</Text>
        <Text style={[styles.settingTitle, { color: colors.text }]}>Theme</Text>
      </View>
      <View style={styles.compactThemeContainer}>
        {['light', 'dark', 'high-contrast'].map((theme) => (
          <AccessibleButton
            key={theme}
            title={theme.replace('-', ' ').toUpperCase()}
            onPress={() => handleSettingChange('theme', theme)}
            variant={settings.theme === theme ? 'primary' : 'outline'}
            size="small"
            style={[
              styles.compactThemeOption,
              settings.theme === theme && styles.selectedOption,
            ]}
            accessibilityLabel={`Set theme to ${theme}`}
          />
        ))}
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Simple Header */}
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
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Configure your VOICE2EYE experience</Text>
          </View>
        </Animated.View>

        {/* Test Card - Simple Hardcoded Content */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.card, { backgroundColor: '#FFFFFF', borderColor: '#000000' }]}>
            <Text style={[styles.cardTitle, { color: '#000000' }]}>✅ Test Card - Hardcoded</Text>
            <Text style={[styles.cardText, { color: '#333333' }]}>
              This is a test card with hardcoded colors
            </Text>
            <Text style={[styles.cardText, { color: '#333333' }]}>
              If you can see this, the rendering works!
            </Text>
            <Text style={[styles.cardText, { color: '#333333' }]}>
              Settings count: {Object.keys(testSettings).length}
            </Text>
          </View>
        </Animated.View>

        {/* Simple Settings Card */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Basic Settings</Text>
            <Text style={[styles.cardText, { color: colors.textSecondary }]}>
              Usage Analytics: {testSettings.usageAnalytics ? 'Enabled' : 'Disabled'}
            </Text>
            <Text style={[styles.cardText, { color: colors.textSecondary }]}>
              Performance Tracking: {testSettings.performanceTracking ? 'Enabled' : 'Disabled'}
            </Text>
            <Text style={[styles.cardText, { color: colors.textSecondary }]}>
              Voice Navigation: {testSettings.voiceNavigation ? 'Enabled' : 'Disabled'}
            </Text>
            <Text style={[styles.cardText, { color: colors.textSecondary }]}>
              Emergency Contacts: {testSettings.emergencyContacts} contacts
            </Text>
          </View>
        </Animated.View>

        {/* Interactive Settings Card */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Interactive Settings</Text>
            
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Voice Navigation</Text>
              <Switch
                value={testSettings.voiceNavigation}
                onValueChange={(value) => handleSettingChange('voiceNavigation', value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={testSettings.voiceNavigation ? '#FFFFFF' : colors.textSecondary}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Haptic Feedback</Text>
              <Switch
                value={testSettings.hapticFeedback}
                onValueChange={(value) => handleSettingChange('hapticFeedback', value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={testSettings.hapticFeedback ? '#FFFFFF' : colors.textSecondary}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Usage Analytics</Text>
              <Switch
                value={testSettings.usageAnalytics}
                onValueChange={(value) => handleSettingChange('usageAnalytics', value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={testSettings.usageAnalytics ? '#FFFFFF' : colors.textSecondary}
              />
            </View>
          </View>
        </Animated.View>

        {/* Reset Button */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <AccessibleButton
            title="Reset Settings"
            onPress={handleResetSettings}
            style={[styles.resetButton, { backgroundColor: colors.error }]}
            textStyle={[styles.resetButtonText, { color: 'white' }]}
          />
        </Animated.View>

        {/* Visual Settings */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Visual Settings</Text>
          
          <SettingItem
            title="High Contrast Mode"
            description="Increase contrast for better visibility"
            icon="🔆"
            value={settings.highContrast}
            onValueChange={(value) => handleSettingChange('highContrast', value)}
          />
          
          <SettingItem
            title="Large Text"
            description="Use larger text throughout the app"
            icon="📝"
            value={settings.largeText}
            onValueChange={(value) => handleSettingChange('largeText', value)}
          />
          
          <ButtonSizeSelector />
          <TextScaleSelector />
          <ThemeSelector />
        </Animated.View>

        {/* Audio Settings */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Audio Settings</Text>
          
          <SettingItem
            title="Voice Navigation"
            description="Enable voice announcements and navigation"
            icon="🎤"
            value={settings.voiceNavigation}
            onValueChange={(value) => handleSettingChange('voiceNavigation', value)}
          />
          
          <SettingItem
            title="Audio Only Mode"
            description="Use audio-only interface (no visual elements)"
            icon="🔊"
            value={settings.audioOnlyMode}
            onValueChange={(value) => handleSettingChange('audioOnlyMode', value)}
          />
          
          <SettingItem
            title="Haptic Feedback"
            description="Vibrate when interacting with buttons"
            icon="📳"
            value={settings.hapticFeedback}
            onValueChange={(value) => handleSettingChange('hapticFeedback', value)}
          />
          
          <SettingItem
            title="Sound Effects"
            description="Play sounds for system events"
            icon="🔔"
            value={settings.soundEffects}
            onValueChange={(value) => handleSettingChange('soundEffects', value)}
          />
        </Animated.View>

        {/* Navigation Settings */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Navigation Settings</Text>
          
          <SettingItem
            title="Gesture Navigation"
            description="Use hand gestures to navigate the app"
            icon="✋"
            value={settings.gestureNavigation}
            onValueChange={(value) => handleSettingChange('gestureNavigation', value)}
          />
          
          <SettingItem
            title="Screen Reader"
            description="Optimize for screen reader usage"
            icon="👁️"
            value={settings.screenReader}
            onValueChange={(value) => handleSettingChange('screenReader', value)}
          />
          
          <SettingItem
            title="Voice Commands"
            description="Enable voice command recognition"
            icon="🗣️"
            value={settings.voiceCommands}
            onValueChange={(value) => handleSettingChange('voiceCommands', value)}
          />
        </Animated.View>

        {/* System Settings */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>System Settings</Text>
          
          <SettingItem
            title="Animations"
            description="Enable smooth animations and transitions"
            icon="✨"
            value={settings.animations}
            onValueChange={(value) => handleSettingChange('animations', value)}
          />
          
          <SettingItem
            title="Emergency Mode"
            description="Emergency mode is currently disabled"
            icon="🚨"
            value={settings.emergencyMode}
            onValueChange={(value) => handleSettingChange('emergencyMode', value)}
          />
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.actionsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <AccessibleButton
            title="Reset to Defaults"
            onPress={handleResetSettings}
            variant="warning"
            size="large"
            accessibilityLabel="Reset all settings to default values"
            style={styles.actionButton}
          />
          
          <AccessibleButton
            title="Back to Dashboard"
            onPress={() => navigation.navigate('Dashboard')}
            variant="primary"
            size="large"
            accessibilityLabel="Return to main dashboard"
            style={styles.actionButton}
          />
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
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  resetButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
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
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  settingControl: {
    alignItems: 'flex-end',
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  compactSettingItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compactSettingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  compactButtonSizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  compactButtonSizeOption: {
    flex: 1,
    minWidth: 70,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  compactTextScaleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  compactTextScaleOption: {
    flex: 1,
    minWidth: 55,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  compactThemeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  compactThemeOption: {
    flex: 1,
    minWidth: 90,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  selectedOption: {
    backgroundColor: '#4CAF50',
  },
  actionsSection: {
    padding: 20,
    marginBottom: 20,
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 12,
  },
});

export default SettingsScreen;