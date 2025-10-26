/**
 * Performance Metrics Component
 * Visualizes system performance with charts and graphs
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAccessibility } from './AccessibilityProvider';

const PerformanceMetrics = ({ metrics }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  const [selectedMetric, setSelectedMetric] = useState('latency');

  const metricsData = [
    {
      id: 'latency',
      label: 'Response Time',
      value: metrics?.latency || 0,
      unit: 'ms',
      threshold: 200,
      color: colors.primary,
      icon: '⚡'
    },
    {
      id: 'accuracy',
      label: 'Recognition Accuracy',
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
      threshold: 99,
      color: colors.accent,
      icon: '⏱️'
    },
    {
      id: 'cpu',
      label: 'CPU Usage',
      value: metrics?.cpuUsage || 0,
      unit: '%',
      threshold: 70,
      color: colors.warning,
      icon: '💻'
    }
  ];

  const selectedData = metricsData.find(m => m.id === selectedMetric);

  const renderProgressBar = (data) => {
    const percentage = Math.min((data.value / data.threshold) * 100, 100);
    const isHealthy = data.value <= data.threshold;
    
    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${percentage}%`, 
                backgroundColor: isHealthy ? colors.success : colors.error 
              }
            ]} 
          />
        </View>
        <Text style={[styles.progressValue, { color: colors.text }]}>
          {data.value}{data.unit}
        </Text>
      </View>
    );
  };

  const renderMetricCard = (data) => (
    <TouchableOpacity
      key={data.id}
      style={[
        styles.metricCard,
        { 
          backgroundColor: colors.surface,
          borderColor: selectedMetric === data.id ? data.color : colors.border,
          borderWidth: selectedMetric === data.id ? 2 : 1
        }
      ]}
      onPress={() => setSelectedMetric(data.id)}
      accessible={true}
      accessibilityLabel={`${data.label}: ${data.value}${data.unit}`}
      accessibilityRole="button"
    >
      <Text style={[styles.metricIcon, { color: data.color }]}>{data.icon}</Text>
      <Text style={[styles.metricLabel, { color: colors.text }]}>{data.label}</Text>
      <Text style={[styles.metricValue, { color: data.color }]}>
        {data.value}{data.unit}
      </Text>
      {data.value <= data.threshold ? (
        <Text style={[styles.statusBadge, { color: colors.success }]}>✓ Good</Text>
      ) : (
        <Text style={[styles.statusBadge, { color: colors.error }]}>⚠ High</Text>
      )}
    </TouchableOpacity>
  );

  const renderChart = () => {
    // Simple bar chart representation
    const maxValue = selectedData.threshold * 1.2;
    const barHeight = (selectedData.value / maxValue) * 100;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartYAxis}>
          <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>
            {maxValue}{selectedData.unit}
          </Text>
          <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>
            {(maxValue / 2)}{selectedData.unit}
          </Text>
          <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>0</Text>
        </View>
        <View style={styles.chartArea}>
          <View style={styles.chartGrid}>
            {[100, 50, 0].map((percent, i) => (
              <View 
                key={i} 
                style={[
                  styles.gridLine, 
                  { backgroundColor: colors.border, top: `${percent}%` }
                ]} 
              />
            ))}
          </View>
          <View 
            style={[
              styles.chartBar,
              { 
                height: `${barHeight}%`,
                backgroundColor: selectedData.value <= selectedData.threshold 
                  ? colors.success 
                  : colors.error
              }
            ]}
          />
          <View 
            style={[
              styles.chartThreshold,
              { 
                height: `${(selectedData.threshold / maxValue) * 100}%`,
                backgroundColor: selectedData.color
              }
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance Metrics</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.metricsScroll}
        contentContainerStyle={styles.metricsScrollContent}
      >
        {metricsData.map(renderMetricCard)}
      </ScrollView>

      <View style={[styles.detailCard, { backgroundColor: colors.surface }]}>
        <View style={styles.detailHeader}>
          <Text style={[styles.detailIcon, { color: selectedData.color }]}>
            {selectedData.icon}
          </Text>
          <View style={styles.detailInfo}>
            <Text style={[styles.detailLabel, { color: colors.text }]}>
              {selectedData.label}
            </Text>
            <Text style={[styles.detailValue, { color: selectedData.color }]}>
              {selectedData.value}{selectedData.unit}
            </Text>
          </View>
        </View>

        {renderProgressBar(selectedData)}

        <View style={styles.chartSection}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Visualization</Text>
          {renderChart()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  metricsScroll: {
    marginBottom: 12,
  },
  metricsScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  metricCard: {
    minWidth: 120,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'right',
  },
  chartSection: {
    marginTop: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 200,
  },
  chartYAxis: {
    width: 50,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  chartLabel: {
    fontSize: 12,
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  chartGrid: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gridLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
  },
  chartBar: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  chartThreshold: {
    position: 'absolute',
    left: '20%',
    right: '20%',
    opacity: 0.3,
  },
});

export default PerformanceMetrics;
