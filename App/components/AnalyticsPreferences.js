/**
 * Analytics Preferences Component
 * Allows users to configure analytics and preferences settings
 */
import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useAccessibility } from '../components/AccessibilityProvider';
import AccessibleButton from '../components/AccessibleButton';

const AnalyticsPreferences = ({ settings, onSettingChange }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Analytics & Preferences</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Usage Analytics</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Help improve VOICE2EYE by sharing anonymous usage data
          </Text>
        </View>
        <Switch
          value={settings.usageAnalytics}
          onValueChange={(value) => onSettingChange('usageAnalytics', value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={settings.usageAnalytics ? '#FFFFFF' : colors.textSecondary}
          accessible={true}
          accessibilityLabel="Usage analytics setting"
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Performance Tracking</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Collect performance metrics to help optimize the app
          </Text>
        </View>
        <Switch
          value={settings.performanceTracking}
          onValueChange={(value) => onSettingChange('performanceTracking', value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={settings.performanceTracking ? '#FFFFFF' : colors.textSecondary}
          accessible={true}
          accessibilityLabel="Performance tracking setting"
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Feature Suggestions</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Receive personalized feature recommendations based on usage
          </Text>
        </View>
        <Switch
          value={settings.featureSuggestions}
          onValueChange={(value) => onSettingChange('featureSuggestions', value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={settings.featureSuggestions ? '#FFFFFF' : colors.textSecondary}
          accessible={true}
          accessibilityLabel="Feature suggestions setting"
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <AccessibleButton
          title="Export Data"
          onPress={() => {}}
          variant="outline"
          size="medium"
          accessibilityLabel="Export analytics data"
          style={styles.actionButton}
        />
        <AccessibleButton
          title="View Report"
          onPress={() => {}}
          variant="primary"
          size="medium"
          accessibilityLabel="View analytics report"
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

export default AnalyticsPreferences;