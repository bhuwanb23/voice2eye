/**
 * Modern Last Command Display Component
 * Beautiful, cohesive design with consistent styling and animations
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAccessibility } from '../components/AccessibilityProvider';

const { width } = Dimensions.get('window');

const LastCommandDisplay = ({ lastCommand }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (lastCommand) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [lastCommand]);

  if (!lastCommand) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>💬 Last Command</Text>
        
        <View style={styles.commandContainer}>
          <LinearGradient
            colors={[`${colors.primary}20`, `${colors.primary}10`]}
            style={styles.commandGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.commandContent}>
              <View style={[styles.micIcon, { backgroundColor: `${colors.primary}25` }]}>
                <Text style={[styles.micEmoji, { color: colors.primary }]}>🎤</Text>
              </View>
              <View style={styles.commandTextContainer}>
                <Text style={[styles.commandLabel, { color: colors.textSecondary }]}>You said:</Text>
                <Text style={[styles.commandText, { color: colors.text }]}>"{lastCommand}"</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Animated.View>
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
  commandContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  commandGradient: {
    borderRadius: 12,
    padding: 16,
  },
  commandContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  micIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  micEmoji: {
    fontSize: 24,
  },
  commandTextContainer: {
    flex: 1,
  },
  commandLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  commandText: {
    fontSize: 16,
    fontWeight: '700',
    fontStyle: 'italic',
    lineHeight: 22,
  },
});

export default LastCommandDisplay;