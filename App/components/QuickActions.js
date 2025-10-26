/**
 * Enhanced Quick Actions Component
 * Compact design with smooth animations and visual effects
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useAccessibility } from '../components/AccessibilityProvider';

const QuickActions = ({ actions }) => {
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

  return (
    <Animated.View 
      style={[
        styles.container, 
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Quick Actions</Text>
      <View style={styles.grid}>
        {actions.map((action, index) => (
          <ActionCard key={index} action={action} colors={colors} delay={index * 100} />
        ))}
      </View>
    </Animated.View>
  );
};

const ActionCard = ({ action, colors, delay }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const cardFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(cardFade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  }, [delay]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={action.onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      accessibilityLabel={action.accessibilityLabel}
      accessibilityHint={action.accessibilityHint}
    >
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            transform: [{ scale: scaleAnim }],
            opacity: cardFade,
          },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: action.gradient[0] }]}>
          <Text style={styles.icon}>{action.icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.actionTitle, { color: colors.text }]}>{action.title}</Text>
          <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
            {action.subtitle}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    gap: 10,
  },
  card: {
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
    color: 'white',
  },
  textContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 11,
  },
});

export default QuickActions;