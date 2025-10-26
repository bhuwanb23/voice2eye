/**
 * Emergency Patterns Component
 * Compact display with beautiful visualizations
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
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

  const maxCount = Math.max(...patternData.timeOfDay.map(t => t.count));

  return (
    <Animated.View 
      style={[
        styles.container, 
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Patterns</Text>
      </View>

      {/* Compact Summary */}
      <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total</Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {patternData.totalEmergencies}
          </Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Avg/Day</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            {Math.round(patternData.totalEmergencies / 7)}
          </Text>
        </View>
      </View>

      {/* Compact Time Distribution */}
      <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
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

      {/* Compact Trigger Types */}
      <View style={styles.triggerGrid}>
        {patternData.triggerType.map((trigger, index) => (
          <View 
            key={index} 
            style={[styles.triggerCard, { backgroundColor: colors.surface }]}
          >
            <View style={[styles.triggerDot, { backgroundColor: trigger.color }]} />
            <Text style={[styles.triggerLabel, { color: colors.text }]}>{trigger.type}</Text>
            <Text style={[styles.triggerValue, { color: colors.primary }]}>{trigger.count}</Text>
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
  summaryCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    marginHorizontal: 12,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  chartCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
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
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 10,
  },
  chartValue: {
    fontSize: 11,
    fontWeight: '600',
    width: 25,
    textAlign: 'right',
  },
  triggerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  triggerCard: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  triggerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  triggerLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  triggerValue: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default EmergencyPatterns;
