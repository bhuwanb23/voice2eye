/**
 * Performance Metrics Component
 * Compact visualization with smooth animations
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useAccessibility } from './AccessibilityProvider';

const PerformanceMetrics = ({ metrics }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  const [selectedMetric, setSelectedMetric] = useState('latency');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const metricsData = [
    {
      id: 'latency',
      label: 'Response',
      value: metrics?.latency || 0,
      unit: 'ms',
      threshold: 200,
      color: colors.primary,
      icon: '⚡'
    },
    {
      id: 'accuracy',
      label: 'Accuracy',
      value: metrics?.accuracy || 0,
      unit: '%',
      threshold: 90,
      color: colors.success,
      icon: '🎯'
    },
    {
      id: 'uptime',
      label: 'Uptime',
      value: metrics?.uptime || 0,
      unit: '%',
      threshold: 95,
      color: colors.success,
      icon: '✅'
    },
    {
      id: 'cpuUsage',
      label: 'CPU',
      value: metrics?.cpuUsage || 0,
      unit: '%',
      threshold: 80,
      color: colors.warning,
      icon: '💻'
    }
  ];

  const selectedData = metricsData.find(m => m.id === selectedMetric) || metricsData[0];
  const isHealthy = selectedData.value <= selectedData.threshold;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Performance</Text>
      </View>

      {/* Compact Metric Selector */}
      <View style={styles.selectorContainer}>
        {metricsData.map((metric) => (
          <TouchableOpacity
            key={metric.id}
            style={[
              styles.selectorButton,
              {
                backgroundColor: selectedMetric === metric.id ? metric.color : colors.surface,
                borderColor: metric.color,
              }
            ]}
            onPress={() => setSelectedMetric(metric.id)}
          >
            <Text style={styles.selectorIcon}>{metric.icon}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Selected Metric Display */}
      <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
        <View style={styles.metricHeader}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            {selectedData.label}
          </Text>
          <View style={[
            styles.healthIndicator, 
            { backgroundColor: isHealthy ? colors.success : colors.error }
          ]} />
        </View>
        
        <View style={styles.metricValueContainer}>
          <Text style={[styles.metricValue, { color: selectedData.color }]}>
            {selectedData.value}
          </Text>
          <Text style={[styles.metricUnit, { color: colors.textSecondary }]}>
            {selectedData.unit}
          </Text>
        </View>

        {/* Compact Progress Bar */}
        <View style={[styles.progressContainer, { backgroundColor: `${colors.border}30` }]}>
          <View 
            style={[
              styles.progressBar, 
              { 
                width: `${Math.min((selectedData.value / selectedData.threshold) * 100, 100)}%`,
                backgroundColor: isHealthy ? colors.success : colors.error
              }
            ]} 
          />
        </View>
      </View>

      {/* Mini Summary Grid */}
      <View style={styles.miniGrid}>
        {metricsData.slice(0, 3).map((metric, index) => (
          <View key={index} style={styles.miniCard}>
            <Text style={[styles.miniIcon, { color: metric.color }]}>{metric.icon}</Text>
            <Text style={[styles.miniValue, { color: colors.text }]}>{metric.value}{metric.unit}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  selectorButton: {
    width: '23%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorIcon: {
    fontSize: 20,
  },
  metricCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  healthIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    marginRight: 4,
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  miniGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  miniIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  miniValue: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default PerformanceMetrics;
