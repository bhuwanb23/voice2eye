/**
 * Analytics Cards Component
 * Displays usage statistics with beautiful compact design and animations
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAccessibility } from './AccessibilityProvider';

const AnalyticsCards = ({ usageStats }) => {
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

  const analyticsData = [
    { 
      title: 'Events', 
      value: usageStats?.totalEvents || 0, 
      color: colors.primary,
      icon: '📊',
      gradient: ['#667eea', '#764ba2']
    },
    { 
      title: 'Voice Cmds', 
      value: usageStats?.voiceCommands || 0, 
      color: colors.accent,
      icon: '🎤',
      gradient: ['#f093fb', '#f5576c']
    },
    { 
      title: 'Gestures', 
      value: usageStats?.gestureDetections || 0, 
      color: colors.warning,
      icon: '✋',
      gradient: ['#4facfe', '#00f2fe']
    },
    { 
      title: 'Emergencies', 
      value: usageStats?.emergencyEvents || 0, 
      color: colors.error,
      icon: '🚨',
      gradient: ['#fa709a', '#fee140']
    }
  ];

  return (
    <Animated.View style={[
      styles.container,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Usage Stats</Text>
      <View style={styles.grid}>
        {analyticsData.map((item, index) => (
          <Animated.View
            key={index}
            style={[
              styles.card, 
              { 
                backgroundColor: colors.surface,
                shadowColor: item.color,
              }
            ]}
            accessible={true}
            accessibilityLabel={`${item.title}: ${item.value}`}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <Text style={[styles.value, { color: item.color }]}>{item.value}</Text>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{item.title}</Text>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 18,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});

export default AnalyticsCards;