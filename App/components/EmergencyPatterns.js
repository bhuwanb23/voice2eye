/**
 * Emergency Patterns Component
 * Compact display with beautiful visualizations
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAccessibility } from './AccessibilityProvider';

const EmergencyPatterns = ({ patterns }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  
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

  const patternData = patterns || {
    timeOfDay: [
      { hour: '00-06', count: 2, percentage: 10 },
      { hour: '06-12', count: 8, percentage: 40 },
      { hour: '12-18', count: 6, percentage: 30 },
      { hour: '18-24', count: 4, percentage: 20 }
    ],
    triggerType: [
      { type: 'voice', count: 12, color: '#007AFF' },
      { type: 'gesture', count: 5, color: '#FF9500' },
      { type: 'manual', count: 3, color: '#FF3B30' }
    ],
    totalEmergencies: 20
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Emergency Patterns</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Analytics & Insights
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Alerts</Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {patternData.totalEmergencies}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Avg/Day</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            {Math.round(patternData.totalEmergencies / 7)}
          </Text>
        </View>
      </View>

      {/* Time Distribution */}
      <View style={[styles.chartContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>Time Distribution</Text>
        {patternData.timeOfDay.map((item, index) => (
          <View key={index} style={styles.chartRow}>
            <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>{item.hour}</Text>
            <View style={[styles.barContainer, { backgroundColor: `${colors.border}30` }]}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    width: `${item.percentage}%`,
                    backgroundColor: colors.primary
                  }
                ]} 
              />
            </View>
            <Text style={[styles.chartValue, { color: colors.text }]}>{item.count}</Text>
          </View>
        ))}
      </View>

      {/* Trigger Types */}
      <View style={[styles.triggerContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>Trigger Types</Text>
        <View style={styles.triggerGrid}>
          {patternData.triggerType.map((trigger, index) => (
            <View 
              key={index} 
              style={styles.triggerItem}
            >
              <View style={[styles.triggerDot, { backgroundColor: trigger.color }]} />
              <Text style={[styles.triggerLabel, { color: colors.text }]}>{trigger.type}</Text>
              <Text style={[styles.triggerValue, { color: colors.primary }]}>{trigger.count}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
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
  summaryContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  chartContainer: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartLabel: {
    fontSize: 10,
    width: 50,
    fontWeight: '500',
  },
  barContainer: {
    flex: 1,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 10,
  },
  chartValue: {
    fontSize: 12,
    fontWeight: '600',
    width: 25,
    textAlign: 'right',
  },
  triggerContainer: {
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  triggerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  triggerItem: {
    alignItems: 'center',
    flex: 1,
  },
  triggerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  triggerLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 3,
    textTransform: 'capitalize',
  },
  triggerValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default EmergencyPatterns;