/**
 * Notification Preferences Component
 * Configure notification settings and preferences
 */
import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useAccessibility } from '../components/AccessibilityProvider';
import AccessibleButton from '../components/AccessibleButton';

const NotificationPreferences = ({ settings, onSettingChange }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Notification Preferences</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Emergency Alerts</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Receive notifications for emergency system events
          </Text>
        </View>
        <Switch
          value={settings.emergencyNotifications}
          onValueChange={(value) => onSettingChange('emergencyNotifications', value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={settings.emergencyNotifications ? '#FFFFFF' : colors.textSecondary}
          accessible={true}
          accessibilityLabel="Emergency notifications setting"
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>System Updates</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Notify about app updates and system changes
          </Text>
        </View>
        <Switch
          value={settings.systemUpdates}
          onValueChange={(value) => onSettingChange('systemUpdates', value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={settings.systemUpdates ? '#FFFFFF' : colors.textSecondary}
          accessible={true}
          accessibilityLabel="System updates notifications setting"
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Usage Reminders</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Receive reminders to use accessibility features
          </Text>
        </View>
        <Switch
          value={settings.usageReminders}
          onValueChange={(value) => onSettingChange('usageReminders', value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={settings.usageReminders ? '#FFFFFF' : colors.textSecondary}
          accessible={true}
          accessibilityLabel="Usage reminders setting"
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Haptic Notifications</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Use haptic feedback for important notifications
          </Text>
        </View>
        <Switch
          value={settings.hapticNotifications}
          onValueChange={(value) => onSettingChange('hapticNotifications', value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={settings.hapticNotifications ? '#FFFFFF' : colors.textSecondary}
          accessible={true}
          accessibilityLabel="Haptic notifications setting"
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>LED Notifications</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Use LED lights for visual notifications (if supported)
          </Text>
        </View>
        <Switch
          value={settings.ledNotifications}
          onValueChange={(value) => onSettingChange('ledNotifications', value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={settings.ledNotifications ? '#FFFFFF' : colors.textSecondary}
          accessible={true}
          accessibilityLabel="LED notifications setting"
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <AccessibleButton
          title="Notification Log"
          onPress={() => {}}
          variant="outline"
          size="medium"
          accessibilityLabel="View notification history"
          style={styles.actionButton}
        />
        <AccessibleButton
          title="Test Notification"
          onPress={() => {}}
          variant="primary"
          size="medium"
          accessibilityLabel="Send test notification"
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

export default NotificationPreferences;