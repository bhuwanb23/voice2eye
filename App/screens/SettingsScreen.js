/**
 * Settings Screen - Ultimate App Experience
 * Next-level settings interface with modern UI/UX and mobile optimization
 */
import React, { useState, useEffect, useRef } from 'react';
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
  TextInput,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAccessibility } from '../components/AccessibilityProvider';
import AccessibleButton from '../components/AccessibleButton';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
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
  
  // State for settings
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [backendSettings, setBackendSettings] = useState({});
  const [localSettings, setLocalSettings] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savingKey, setSavingKey] = useState(null); // Track which setting is being saved
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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
      setBackendSettings(data.settings || {});
      setLocalSettings(data.settings || {});
      setApiError(null);
      console.log('✅ Backend settings loaded:', data.settings);
    } catch (error) {
      console.warn('❌ Failed to load backend settings:', error.message);
      setApiError('Backend not available - using local settings');
      // Initialize with default settings
      const defaultSettings = {
        voiceNavigation: true,
        highContrast: false,
        hapticFeedback: true,
        usageAnalytics: true,
        performanceTracking: true,
        emergencyMode: false,
        voiceCommands: true,
        audioOnlyMode: false,
        speechRate: 1.0,
        speechPitch: 1.0,
      };
      setBackendSettings(defaultSettings);
      setLocalSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = async (key, value) => {
    console.log(`Setting changed: ${key} = ${value}`);
    
    // Add haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Update local settings immediately for UI feedback
    const updatedSettings = {
      ...localSettings,
      [key]: value
    };
    setLocalSettings(updatedSettings);
    setHasUnsavedChanges(true);
    setSavingKey(key);
    setIsSaving(true);
    
    // Save to backend immediately
    try {
      await apiService.updateSetting(key, value);
      // Update backend settings to reflect what was saved
      setBackendSettings(prev => ({
        ...prev,
        [key]: value
      }));
      setHasUnsavedChanges(false);
      console.log(`✅ Setting ${key} saved to backend`);
      
      // Provide user feedback
      if (localSettings.voiceNavigation) {
        Speech.speak(`${key.replace(/([A-Z])/g, ' $1')} updated`, {
          rate: localSettings.speechRate,
          pitch: localSettings.speechPitch,
        });
      }
    } catch (error) {
      console.error(`❌ Failed to save setting ${key}:`, error.message);
      setApiError(`Failed to save ${key}: ${error.message}`);
      
      // Provide user feedback
      if (localSettings.voiceNavigation) {
        Speech.speak(`Failed to update ${key.replace(/([A-Z])/g, ' $1')}`, {
          rate: localSettings.speechRate,
          pitch: localSettings.speechPitch,
        });
      }
    } finally {
      setIsSaving(false);
      setSavingKey(null);
    }
    
    // For immediate UI feedback, also update accessibility context
    updateSetting(key, value);
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          onPress: () => { 
            const defaultSettings = {
              voiceNavigation: true,
              highContrast: false,
              hapticFeedback: true,
              usageAnalytics: true,
              performanceTracking: true,
              emergencyMode: false,
              voiceCommands: true,
              audioOnlyMode: false,
              speechRate: 1.0,
              speechPitch: 1.0,
            };
            setLocalSettings(defaultSettings);
            setHasUnsavedChanges(true);
            console.log('Settings reset to defaults');
          }, 
          style: 'destructive' 
        }
      ]
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Compact Modern Header */}
        <LinearGradient
          colors={[colors.primary, colors.primary + 'DD', colors.primary + '99']}
          style={styles.compactHeader}
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
            <Text style={styles.headerTitle}>⚙️ Settings</Text>
            <Text style={styles.headerSubtitle}>Customize your experience</Text>
            
            {/* Quick Stats */}
            <View style={styles.quickStats}>
              <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.statNumber}>{Object.keys(localSettings).filter(key => localSettings[key]).length}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>Categories</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.statNumber}>{hasUnsavedChanges ? 'UNSAVED' : 'SYNCED'}</Text>
                <Text style={styles.statLabel}>Status</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Search and Filter Section */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              }]}
              placeholder="Search settings..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          {/* Category Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
          >
            {[
              { key: 'all', label: 'All', icon: '📋' },
              { key: 'accessibility', label: 'Accessibility', icon: '♿' },
              { key: 'privacy', label: 'Privacy', icon: '🔒' },
              { key: 'emergency', label: 'Emergency', icon: '🚨' },
              { key: 'audio', label: 'Audio', icon: '🔊' }
            ].map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryTab,
                  activeCategory === category.key && [styles.activeCategoryTab, { backgroundColor: colors.primary }]
                ]}
                onPress={() => setActiveCategory(category.key)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryLabel,
                  { color: activeCategory === category.key ? 'white' : colors.textSecondary }
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Loading Indicator */}
          {isLoading && (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary, marginTop: 16 }]}>
                Loading settings...
              </Text>
            </View>
          )}

          {/* Error Banner */}
          {apiError && (
            <Animated.View
              style={[
                styles.errorBanner,
                { backgroundColor: colors.warning },
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

          {/* Compact Settings Sections */}
          <View style={styles.settingsContainer}>
            
            {/* Accessibility Section */}
            <View style={[styles.settingSection, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>♿ Accessibility</Text>
              
              <View style={styles.compactSettingItem}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Voice Navigation</Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Audio feedback</Text>
                </View>
                <Switch
                  value={localSettings.voiceNavigation ?? true}
                  onValueChange={(value) => handleSettingChange('voiceNavigation', value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={localSettings.voiceNavigation ? '#FFFFFF' : colors.textSecondary}
                />
              </View>

              <View style={styles.compactSettingItem}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>High Contrast</Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Better visibility</Text>
                </View>
                <Switch
                  value={localSettings.highContrast ?? false}
                  onValueChange={(value) => handleSettingChange('highContrast', value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={localSettings.highContrast ? '#FFFFFF' : colors.textSecondary}
                />
              </View>

              <View style={styles.compactSettingItem}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Haptic Feedback</Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Vibration on touch</Text>
                </View>
                <Switch
                  value={localSettings.hapticFeedback ?? true}
                  onValueChange={(value) => handleSettingChange('hapticFeedback', value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={localSettings.hapticFeedback ? '#FFFFFF' : colors.textSecondary}
                />
              </View>
            </View>

            {/* Privacy Section */}
            <View style={[styles.settingSection, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>🔒 Privacy</Text>
              
              <View style={styles.compactSettingItem}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Usage Analytics</Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Help improve app</Text>
                </View>
                <Switch
                  value={localSettings.usageAnalytics ?? true}
                  onValueChange={(value) => handleSettingChange('usageAnalytics', value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={localSettings.usageAnalytics ? '#FFFFFF' : colors.textSecondary}
                />
              </View>

              <View style={styles.compactSettingItem}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Performance Tracking</Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Monitor performance</Text>
                </View>
                <Switch
                  value={localSettings.performanceTracking ?? true}
                  onValueChange={(value) => handleSettingChange('performanceTracking', value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={localSettings.performanceTracking ? '#FFFFFF' : colors.textSecondary}
                />
              </View>
            </View>

            {/* Emergency Section */}
            <View style={[styles.settingSection, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>🚨 Emergency</Text>
              
              <View style={styles.compactSettingItem}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Emergency Mode</Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Quick emergency access</Text>
                </View>
                <Switch
                  value={localSettings.emergencyMode ?? false}
                  onValueChange={(value) => handleSettingChange('emergencyMode', value)}
                  trackColor={{ false: colors.border, true: colors.error }}
                  thumbColor={localSettings.emergencyMode ? '#FFFFFF' : colors.textSecondary}
                />
              </View>

              <View style={styles.emergencyStats}>
                <View style={styles.emergencyStat}>
                  <Text style={[styles.statValue, { color: colors.primary }]}>3</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Contacts</Text>
                </View>
                <View style={styles.emergencyStat}>
                  <Text style={[styles.statValue, { color: colors.success }]}>Active</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Status</Text>
                </View>
              </View>
            </View>

            {/* Audio Section */}
            <View style={[styles.settingSection, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>🔊 Audio</Text>
              
              <View style={styles.compactSettingItem}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Voice Commands</Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Voice control</Text>
                </View>
                <Switch
                  value={localSettings.voiceCommands ?? true}
                  onValueChange={(value) => handleSettingChange('voiceCommands', value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={localSettings.voiceCommands ? '#FFFFFF' : colors.textSecondary}
                />
              </View>

              <View style={styles.compactSettingItem}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Audio Only Mode</Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Audio interface only</Text>
                </View>
                <Switch
                  value={localSettings.audioOnlyMode ?? false}
                  onValueChange={(value) => handleSettingChange('audioOnlyMode', value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={localSettings.audioOnlyMode ? '#FFFFFF' : colors.textSecondary}
                />
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.error }]}
                onPress={handleResetSettings}
              >
                <Text style={styles.actionButtonText}>🔄 Reset Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Centered Saving Overlay */}
        {isSaving && savingKey && (
          <View style={styles.savingOverlay}>
            <View style={[styles.savingModal, { backgroundColor: colors.surface }]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.savingText, { color: colors.text, marginTop: 12 }]}>
                Saving {savingKey.replace(/([A-Z])/g, ' $1')}...
              </Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  compactHeader: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  headerContent: {
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 16,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
  },
  statCard: {
    padding: 12,
    borderRadius: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
    color: 'white',
    opacity: 0.8,
  },
  searchContainer: {
    padding: 12,
    marginTop: -8,
    marginHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
  },
  categoryTabs: {
    marginBottom: 4,
  },
  categoryTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 6,
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 32,
  },
  activeCategoryTab: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  categoryIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
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
    margin: 12,
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
  settingsContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  settingSection: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  compactSettingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
    opacity: 0.7,
  },
  emergencyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  emergencyStat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  // Centered saving overlay
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  savingModal: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  savingText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SettingsScreen;