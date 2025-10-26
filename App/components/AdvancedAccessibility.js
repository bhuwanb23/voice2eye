/**
 * Advanced Accessibility Component
 * Provides advanced accessibility options for users with specific needs
 */
import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAccessibility } from '../components/AccessibilityProvider';
import AccessibleButton from '../components/AccessibleButton';

const AdvancedAccessibility = ({ settings, onSettingChange }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  // Define options for voice speed and pitch
  const voiceSpeedOptions = [
    { label: 'Very Slow (50%)', value: 0.5 },
    { label: 'Slow (70%)', value: 0.7 },
    { label: 'Normal (100%)', value: 1.0 },
    { label: 'Fast (130%)', value: 1.3 },
    { label: 'Very Fast (150%)', value: 1.5 },
  ];

  const voicePitchOptions = [
    { label: 'Very Low (50%)', value: 0.5 },
    { label: 'Low (70%)', value: 0.7 },
    { label: 'Normal (100%)', value: 1.0 },
    { label: 'High (130%)', value: 1.3 },
    { label: 'Very High (150%)', value: 1.5 },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Advanced Accessibility</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Voice Speed</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Adjust how fast the app speaks
          </Text>
        </View>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={settings.speechRate}
            style={[styles.picker, { color: colors.text }]}
            onValueChange={(value) => onSettingChange('speechRate', value)}
            accessibilityLabel="Voice speed selector"
          >
            {voiceSpeedOptions.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
        </View>
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Voice Pitch</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Adjust the pitch of the voice
          </Text>
        </View>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={settings.speechPitch}
            style={[styles.picker, { color: colors.text }]}
            onValueChange={(value) => onSettingChange('speechPitch', value)}
            accessibilityLabel="Voice pitch selector"
          >
            {voicePitchOptions.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
        </View>
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Haptic Intensity</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Adjust the strength of haptic feedback
          </Text>
        </View>
        <Switch
          value={settings.hapticFeedback}
          onValueChange={(value) => onSettingChange('hapticFeedback', value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={settings.hapticFeedback ? '#FFFFFF' : colors.textSecondary}
          accessible={true}
          accessibilityLabel="Haptic feedback setting"
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Screen Magnification</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Enable screen magnification for better visibility
          </Text>
        </View>
        <Switch
          value={settings.screenMagnification}
          onValueChange={(value) => onSettingChange('screenMagnification', value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={settings.screenMagnification ? '#FFFFFF' : colors.textSecondary}
          accessible={true}
          accessibilityLabel="Screen magnification setting"
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Color Inversion</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Invert colors for better contrast
          </Text>
        </View>
        <Switch
          value={settings.colorInversion}
          onValueChange={(value) => onSettingChange('colorInversion', value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={settings.colorInversion ? '#FFFFFF' : colors.textSecondary}
          accessible={true}
          accessibilityLabel="Color inversion setting"
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <AccessibleButton
          title="Test Settings"
          onPress={() => {}}
          variant="outline"
          size="medium"
          accessibilityLabel="Test current accessibility settings"
          style={styles.actionButton}
        />
        <AccessibleButton
          title="Save Profile"
          onPress={() => {}}
          variant="primary"
          size="medium"
          accessibilityLabel="Save current accessibility profile"
          style={styles.actionButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginBottom: 16,
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingContent: {
    marginBottom: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  picker: {
    height: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
    minWidth: 120,
  },
});

export default AdvancedAccessibility;