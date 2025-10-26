/**
 * Beautiful Modern Settings Screen
 * Enhanced with gradients, cards, and modern design
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccessibility } from '../components/AccessibilityProvider';
import AccessibleButton from '../components/AccessibleButton';
import AnalyticsPreferences from '../components/AnalyticsPreferences';
import AdvancedAccessibility from '../components/AdvancedAccessibility';
import EmergencySystemSettings from '../components/EmergencySystemSettings';
import NotificationPreferences from '../components/NotificationPreferences';
import DataPrivacyControls from '../components/DataPrivacyControls';
import BackupRestore from '../components/BackupRestore';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');

const SettingsScreen = ({ navigation }) => {
  const { settings, updateSetting, getThemeColors, resetToDefaults } = useAccessibility();
  const colors = getThemeColors();
  
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  React.useEffect(() => {
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

  const handleSettingChange = (key, value) => {
    updateSetting(key, value);
    
    // Provide audio feedback for setting changes
    if (settings.voiceNavigation) {
      const settingName = key.replace(/([A-Z])/g, ' $1').toLowerCase();
      Speech.speak(`${settingName} ${value ? 'enabled' : 'disabled'}`, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
      });
    }
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
            resetToDefaults();
            if (settings.voiceNavigation) {
              Speech.speak('Settings reset to default values', {
                rate: settings.speechRate,
                pitch: settings.speechPitch,
              });
            }
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
        {/* Beautiful Header */}
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

        {/* Analytics & Preferences Section */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <AnalyticsPreferences 
            settings={settings} 
            onSettingChange={handleSettingChange} 
          />
        </Animated.View>

        {/* Advanced Accessibility Section */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <AdvancedAccessibility 
            settings={settings} 
            onSettingChange={handleSettingChange} 
          />
        </Animated.View>

        {/* Emergency System Settings */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <EmergencySystemSettings 
            settings={settings} 
            onSettingChange={handleSettingChange} 
          />
        </Animated.View>

        {/* Notification Preferences */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <NotificationPreferences 
            settings={settings} 
            onSettingChange={handleSettingChange} 
          />
        </Animated.View>

        {/* Data Privacy Controls */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <DataPrivacyControls 
            settings={settings} 
            onSettingChange={handleSettingChange} 
          />
        </Animated.View>

        {/* Backup & Restore */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <BackupRestore 
            settings={settings} 
            onSettingChange={handleSettingChange} 
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