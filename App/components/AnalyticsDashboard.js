/**
 * Enhanced Analytics Dashboard Component
 * Combines usage statistics and service status in a beautiful, cohesive design
 * Now includes performance metrics, emergency patterns, and report export
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useAccessibility } from '../components/AccessibilityProvider';
import AnalyticsCards from '../components/AnalyticsCards';
import ServiceStatus from '../components/ServiceStatus';
import PerformanceMetrics from '../components/PerformanceMetrics';
import EmergencyPatterns from '../components/EmergencyPatterns';
import ReportExporter from '../components/ReportExporter';

const { width } = Dimensions.get('window');

const AnalyticsDashboard = ({ usageStats, serviceStatus, metrics, patterns, exportData }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  return (
    <ScrollView 
      style={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Dashboard Overview</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>
        
        <View style={styles.content}>
          <AnalyticsCards usageStats={usageStats} />
          <ServiceStatus serviceStatus={serviceStatus} />
          
          {/* New Analytics Components */}
          <PerformanceMetrics metrics={metrics} />
          <EmergencyPatterns patterns={patterns} />
          <ReportExporter data={exportData} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: -8,
    marginBottom: 12,
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
    padding: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  content: {
    padding: 14,
    paddingTop: 0,
  },
});

export default AnalyticsDashboard;