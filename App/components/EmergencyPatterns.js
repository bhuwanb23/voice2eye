/**
 * Emergency Patterns Component
 * Displays emergency alert patterns and analysis
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAccessibility } from './AccessibilityProvider';

const EmergencyPatterns = ({ patterns }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  const patternData = patterns || {
    timeOfDay: [
      { hour: '00-06', count: 2, percentage: 10 },
      { hour: '06-12', count: 8, percentage: 40 },
      { hour: '12-18', count: 6, percentage: 30 },
      { hour: '18-24', count: 4, percentage: 20 }
    ],
    dayOfWeek: [
      { day: 'Mon', count: 3 },
      { day: 'Tue', count: 5 },
      { day: 'Wed', count: 2 },
      { day: 'Thu', count: 4 },
      { day: 'Fri', count: 6 },
      { day: 'Sat', count: 1 },
      { day: 'Sun', count: 1 }
    ],
    triggerType: [
      { type: 'voice', count: 12, color: colors.primary },
      { type: 'gesture', count: 5, color: colors.accent },
      { type: 'manual', count: 3, color: colors.warning }
    ],
    avgResponseTime: 5.2,
    totalEmergencies: 22
  };

  const renderTimePattern = () => (
    <View style={[styles.patternCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.patternTitle, { color: colors.text }]}>
        Emergency by Time of Day
      </Text>
      <View style={styles.barChartContainer}>
        {patternData.timeOfDay.map((item, index) => (
          <View key={index} style={styles.barChartItem}>
            <View style={styles.barChartColumn}>
              <View 
                style={[
                  styles.barChartBar, 
                  { 
                    height: `${item.percentage}%`,
                    backgroundColor: colors.primary,
                    opacity: (index % 2) === 0 ? 0.8 : 0.6
                  }
                ]}
              />
            </View>
            <Text style={[styles.barChartLabel, { color: colors.textSecondary }]}>
              {item.hour}
            </Text>
            <Text style={[styles.barChartValue, { color: colors.text }]}>
              {item.count}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderDayPattern = () => (
    <View style={[styles.patternCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.patternTitle, { color: colors.text }]}>
        Emergency by Day of Week
      </Text>
      <View style={styles.dayChartContainer}>
        {patternData.dayOfWeek.map((item, index) => (
          <View key={index} style={styles.dayChartItem}>
            <View style={styles.dayBarContainer}>
              <View 
                style={[
                  styles.dayBar,
                  { 
                    height: `${(item.count / 7) * 100}%`,
                    backgroundColor: colors.accent,
                    opacity: 0.8 - (index * 0.05)
                  }
                ]}
              />
            </View>
            <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>
              {item.day}
            </Text>
            <Text style={[styles.dayValue, { color: colors.text }]}>
              {item.count}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTriggerType = () => (
    <View style={[styles.patternCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.patternTitle, { color: colors.text }]}>
        Trigger Type Distribution
      </Text>
      <View style={styles.pieChartContainer}>
        {patternData.triggerType.map((item, index) => {
          const percentage = (item.count / patternData.totalEmergencies) * 100;
          return (
            <View key={index} style={styles.pieItem}>
              <View style={styles.pieSegment}>
                <View 
                  style={[
                    styles.pieSegmentFill,
                    { 
                      backgroundColor: item.color,
                      width: `${percentage * 3}%`
                    }
                  ]}
                />
              </View>
              <View style={styles.pieLabel}>
                <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                <Text style={[styles.pieLabelText, { color: colors.text }]}>
                  {item.type}: {item.count} ({percentage.toFixed(1)}%)
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statIcon, { color: colors.primary }]}>📊</Text>
        <Text style={[styles.statValue, { color: colors.text }]}>
          {patternData.totalEmergencies}
        </Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
          Total Alerts
        </Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statIcon, { color: colors.success }]}>⚡</Text>
        <Text style={[styles.statValue, { color: colors.text }]}>
          {patternData.avgResponseTime}s
        </Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
          Avg Response
        </Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statIcon, { color: colors.warning }]}>📅</Text>
        <Text style={[styles.statValue, { color: colors.text }]}>
          7 days
        </Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
          Period
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Patterns</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.patternsScroll}
      >
        <View style={styles.patternsContent}>
          {renderStatsCards()}
          {renderTriggerType()}
          {renderTimePattern()}
          {renderDayPattern()}
        </View>
      </ScrollView>

      <View style={[styles.insightCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.insightIcon, { color: colors.primary }]}>💡</Text>
        <Text style={[styles.insightText, { color: colors.text }]}>
          Most emergencies occur during morning hours (06-12). Consider scheduling regular check-ins during this period.
        </Text>
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
  patternsScroll: {
    marginBottom: 12,
  },
  patternsContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    width: 100,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  patternCard: {
    width: 300,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  patternTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barChartItem: {
    flex: 1,
    alignItems: 'center',
  },
  barChartColumn: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  barChartBar: {
    width: '80%',
    borderRadius: 4,
    alignSelf: 'center',
  },
  barChartLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  barChartValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  dayChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  dayChartItem: {
    flex: 1,
    alignItems: 'center',
  },
  dayBarContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  dayBar: {
    width: '70%',
    borderRadius: 4,
    alignSelf: 'center',
  },
  dayLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  dayValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  pieChartContainer: {
    gap: 12,
  },
  pieItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pieSegment: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    marginRight: 12,
  },
  pieSegmentFill: {
    height: '100%',
  },
  pieLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  pieLabelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  insightCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default EmergencyPatterns;
