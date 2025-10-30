/**
 * Modern Navigation Menu Component
 * Beautiful, cohesive design with consistent styling and animations
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAccessibility } from '../components/AccessibilityProvider';

const { width } = Dimensions.get('window');

const NavigationMenu = ({ items }) => {
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
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>🧭 Navigation</Text>
        <View style={styles.navGrid}>
          {items.map((item, index) => (
            <NavCard key={index} item={item} colors={colors} delay={index * 120} />
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

const NavCard = ({ item, colors, delay }) => {
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
      onPress={item.onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      accessibilityLabel={item.accessibilityLabel}
      style={styles.navButton}
    >
      <Animated.View
        style={[
          styles.navCard,
          {
            backgroundColor: colors.background,
            borderColor: `${item.color}30`,
            transform: [{ scale: scaleAnim }],
            opacity: cardFade,
          },
        ]}
      >
        <View style={[styles.navIconContainer, { backgroundColor: `${item.color}15` }]}>
          <Text style={[styles.navIcon, { color: item.color }]}>{item.icon}</Text>
        </View>
        <View style={styles.navTextContainer}>
          <Text style={[styles.navTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.navSubtitle, { color: colors.textSecondary }]}>
            {item.subtitle}
          </Text>
        </View>
        <View style={[styles.navArrow, { backgroundColor: `${item.color}20` }]}>
          <Text style={[styles.arrowIcon, { color: item.color }]}>→</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

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
  navGrid: {
    gap: 12,
  },
  navButton: {
    marginBottom: 4,
  },
  navCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  navIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  navIcon: {
    fontSize: 24,
  },
  navTextContainer: {
    flex: 1,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  navSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  navArrow: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NavigationMenu;