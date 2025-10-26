/**
 * Enhanced Analytics Dashboard Component
 * Combines usage statistics and service status in a beautiful, cohesive design
 */
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useAccessibility } from '../components/AccessibilityProvider';
import AnalyticsCards from '../components/AnalyticsCards';
import ServiceStatus from '../components/ServiceStatus';

const { width } = Dimensions.get('window');

const AnalyticsDashboard = ({ usageStats, serviceStatus }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Dashboard Overview</Text>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      </View>
      
      <View style={styles.content}>
        <AnalyticsCards usageStats={usageStats} />
        <ServiceStatus serviceStatus={serviceStatus} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: -8, // Negative margin to reduce gap with header
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
});

export default AnalyticsDashboard;