/**
 * Data Privacy Controls Component
 * Manage data privacy and security settings
 */
import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useAccessibility } from '../components/AccessibilityProvider';
import AccessibleButton from '../components/AccessibleButton';

const DataPrivacyControls = ({ settings, onSettingChange }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Data Privacy & Security</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Local Data Storage</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Store all data locally on device (no cloud sync)
          </Text>
        </View>
        <Switch
          value={settings.localDataStorage}
          onValueChange={(value) => onSettingChange('localDataStorage', value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={settings.localDataStorage ? '#FFFFFF' : colors.textSecondary}
          accessible={true}
          accessibilityLabel="Local data storage setting"
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Data Encryption</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Encrypt sensitive data stored on device
          </Text>
        </View>
        <Switch
          value={settings.dataEncryption}
          onValueChange={(value) => onSettingChange('dataEncryption', value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={settings.dataEncryption ? '#FFFFFF' : colors.textSecondary}
          accessible={true}
          accessibilityLabel="Data encryption setting"
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Anonymous Usage Data</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Share anonymous usage statistics to improve the app
          </Text>
        </View>
        <Switch
          value={settings.anonymousUsageData}
          onValueChange={(value) => onSettingChange('anonymousUsageData', value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={settings.anonymousUsageData ? '#FFFFFF' : colors.textSecondary}
          accessible={true}
          accessibilityLabel="Anonymous usage data setting"
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Location Data Sharing</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Allow sharing of location data for emergency services
          </Text>
        </View>
        <Switch
          value={settings.locationDataSharing}
          onValueChange={(value) => onSettingChange('locationDataSharing', value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={settings.locationDataSharing ? '#FFFFFF' : colors.textSecondary}
          accessible={true}
          accessibilityLabel="Location data sharing setting"
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Automatic Data Cleanup</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Automatically delete old data to protect privacy
          </Text>
        </View>
        <Switch
          value={settings.automaticDataCleanup}
          onValueChange={(value) => onSettingChange('automaticDataCleanup', value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={settings.automaticDataCleanup ? '#FFFFFF' : colors.textSecondary}
          accessible={true}
          accessibilityLabel="Automatic data cleanup setting"
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <AccessibleButton
          title="View Data"
          onPress={() => {}}
          variant="outline"
          size="medium"
          accessibilityLabel="View stored data"
          style={styles.actionButton}
        />
        <AccessibleButton
          title="Export Data"
          onPress={() => {}}
          variant="primary"
          size="medium"
          accessibilityLabel="Export all personal data"
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
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

export default DataPrivacyControls;