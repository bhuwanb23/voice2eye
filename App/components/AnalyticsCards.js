/**
 * Analytics Cards Component
 * Displays usage statistics in an accessible and visually appealing way
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAccessibility } from './AccessibilityProvider';

const AnalyticsCards = ({ usageStats }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  const analyticsData = [
    { 
      title: 'Total Events', 
      value: usageStats.totalEvents, 
      color: colors.primary,
      icon: '📊'
    },
    { 
      title: 'Voice Commands', 
      value: usageStats.voiceCommands, 
      color: colors.accent,
      icon: '🎤'
    },
    { 
      title: 'Gestures', 
      value: usageStats.gestureDetections, 
      color: colors.warning,
      icon: '✋'
    },
    { 
      title: 'Emergencies', 
      value: usageStats.emergencyEvents, 
      color: colors.error,
      icon: '🚨'
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Usage Statistics</Text>
      <View style={styles.grid}>
        {analyticsData.map((item, index) => (
          <View 
            key={index} 
            style={[styles.card, { backgroundColor: colors.surface }]}
            accessible={true}
            accessibilityLabel={`${item.title}: ${item.value}`}
          >
            <Text style={[styles.icon, { color: item.color }]}>{item.icon}</Text>
            <Text style={[styles.value, { color: item.color }]}>{item.value}</Text>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{item.title}</Text>
          </View>
        ))}
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
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AnalyticsCards;