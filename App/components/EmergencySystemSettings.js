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
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Emergency System Settings</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Customize emergency behavior
        </Text>
      </View>
      
      <View style={styles.settingsContainer}>
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
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
        
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>Confirmation Timeout</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Time to confirm emergency before auto-triggering
            </Text>
          </View>
          <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
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
        
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
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
        
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
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
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  settingsContainer: {
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingContent: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 10,
    lineHeight: 14,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    minWidth: 110,
  },
  picker: {
    height: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: 90,
  },
});

export default EmergencySystemSettings;