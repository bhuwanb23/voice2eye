/**
 * Emergency System Settings Component
 * Configure emergency system behavior and timing
 */
import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAccessibility } from '../components/AccessibilityProvider';
import AccessibleButton from '../components/AccessibleButton';

const EmergencySystemSettings = ({ settings, onSettingChange }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  const timeoutOptions = [
    { label: '5 seconds', value: 5 },
    { label: '10 seconds', value: 10 },
    { label: '15 seconds', value: 15 },
    { label: '20 seconds', value: 20 },
    { label: '30 seconds', value: 30 },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Emergency System</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Auto-trigger Emergency</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Automatically trigger emergency after repeated failed commands
          </Text>
        </View>
        <Switch
          value={settings.autoTriggerEmergency}
          onValueChange={(value) => onSettingChange('autoTriggerEmergency', value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={settings.autoTriggerEmergency ? '#FFFFFF' : colors.textSecondary}
          accessible={true}
          accessibilityLabel="Auto-trigger emergency setting"
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Confirmation Timeout</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Time to confirm emergency before auto-triggering
          </Text>
        </View>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={settings.emergencyTimeout}
            style={[styles.picker, { color: colors.text }]}
            onValueChange={(value) => onSettingChange('emergencyTimeout', value)}
            accessibilityLabel="Emergency confirmation timeout"
          >
            {timeoutOptions.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
        </View>
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Location Tracking</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Continuously track location during emergency
          </Text>
        </View>
        <Switch
          value={settings.locationTracking}
          onValueChange={(value) => onSettingChange('locationTracking', value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={settings.locationTracking ? '#FFFFFF' : colors.textSecondary}
          accessible={true}
          accessibilityLabel="Location tracking setting"
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Silent Mode</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Trigger emergency silently without audio alerts
          </Text>
        </View>
        <Switch
          value={settings.silentEmergency}
          onValueChange={(value) => onSettingChange('silentEmergency', value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={settings.silentEmergency ? '#FFFFFF' : colors.textSecondary}
          accessible={true}
          accessibilityLabel="Silent emergency mode setting"
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Multiple Contact Attempts</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Retry contacting emergency contacts if initial attempts fail
          </Text>
        </View>
        <Switch
          value={settings.multipleContactAttempts}
          onValueChange={(value) => onSettingChange('multipleContactAttempts', value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={settings.multipleContactAttempts ? '#FFFFFF' : colors.textSecondary}
          accessible={true}
          accessibilityLabel="Multiple contact attempts setting"
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <AccessibleButton
          title="Test Emergency"
          onPress={() => {}}
          variant="warning"
          size="medium"
          accessibilityLabel="Test emergency system"
          style={styles.actionButton}
        />
        <AccessibleButton
          title="View Contacts"
          onPress={() => {}}
          variant="primary"
          size="medium"
          accessibilityLabel="View emergency contacts"
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

export default EmergencySystemSettings;