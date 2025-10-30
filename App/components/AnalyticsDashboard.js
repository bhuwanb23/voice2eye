/**
 * Modern Analytics Dashboard Component
 * Beautiful, cohesive design with consistent styling and animations
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>📊 Analytics Overview</Text>
        
        {/* Usage Statistics Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Voice Commands"
            value={usageStats?.voiceCommands || 0}
            icon="🎤"
            color={colors.primary}
            backgroundColor={`${colors.primary}15`}
          />
          <StatCard
            title="Gestures"
            value={usageStats?.gestureDetections || 0}
            icon="✋"
            color={colors.accent}
            backgroundColor={`${colors.accent}15`}
          />
          <StatCard
            title="Emergencies"
            value={usageStats?.emergencyEvents || 0}
            icon="🚨"
            color={colors.error}
            backgroundColor={`${colors.error}15`}
          />
          <StatCard
            title="Accuracy"
            value={`${metrics?.accuracy || 0}%`}
            icon="🎯"
            color={colors.success}
            backgroundColor={`${colors.success}15`}
          />
        </View>

        {/* Performance Metrics */}
        <View style={styles.metricsSection}>
          <Text style={[styles.subsectionTitle, { color: colors.text }]}>Performance</Text>
          <View style={styles.metricsRow}>
            <MetricItem
              label="Response Time"
              value={`${metrics?.latency || 0}ms`}
              colors={colors}
            />
            <MetricItem
              label="Uptime"
              value={`${metrics?.uptime || 0}%`}
              colors={colors}
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const StatCard = ({ title, value, icon, color, backgroundColor }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.statCard,
        { backgroundColor, transform: [{ scale: scaleAnim }] }
      ]}
    >
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statTitle, { color }]}>{title}</Text>
    </Animated.View>
  );
};

const MetricItem = ({ label, value, colors }) => (
  <View style={styles.metricItem}>
    <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</Text>
    <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: (width - 72) / 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  metricsSection: {
    marginTop: 8,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
  },
});

export default AnalyticsDashboard;