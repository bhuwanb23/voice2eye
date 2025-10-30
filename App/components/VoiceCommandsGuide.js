/**
 * Modern Voice Commands Guide Component
 * Beautiful, cohesive design with consistent styling and animations
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAccessibility } from '../components/AccessibilityProvider';

const { width } = Dimensions.get('window');

const VoiceCommandsGuide = () => {
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

  const commands = [
    { icon: '🚨', text: 'Say "Emergency" or "Help"', color: colors.error },
    { icon: '⚙️', text: 'Say "Settings"', color: colors.primary },
    { icon: '👥', text: 'Say "Contacts"', color: colors.success },
    { icon: '📷', text: 'Say "Camera"', color: colors.accent },
    { icon: '✋', text: 'Say "Gesture Training"', color: colors.warning },
    { icon: '❓', text: 'Say "Help"', color: colors.info },
  ];

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>🎤 Voice Commands</Text>
        <View style={styles.commandsGrid}>
          {commands.map((command, index) => (
            <CommandCard 
              key={index} 
              command={command} 
              colors={colors} 
              delay={index * 100}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

const CommandCard = ({ command, colors, delay }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.commandCard,
        {
          backgroundColor: colors.background,
          borderColor: `${command.color}30`,
          opacity: fadeIn,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={[styles.commandIconContainer, { backgroundColor: `${command.color}15` }]}>
        <Text style={[styles.commandIcon, { color: command.color }]}>{command.icon}</Text>
      </View>
      <Text style={[styles.commandText, { color: colors.text }]}>{command.text}</Text>
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
  commandsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  commandCard: {
    width: (width - 64) / 2 - 6,
    borderRadius: 12,
    padding: 16,
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
  commandIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  commandIcon: {
    fontSize: 20,
  },
  commandText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default VoiceCommandsGuide;