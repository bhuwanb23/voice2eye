/**
 * Voice Commands Guide Component
 * Compact design with smooth animations and visual effects
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAccessibility } from '../components/AccessibilityProvider';

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
    { icon: '🚨', text: 'Say "Emergency" or "Help"' },
    { icon: '⚙️', text: 'Say "Settings"' },
    { icon: '👥', text: 'Say "Contacts"' },
    { icon: '📷', text: 'Say "Camera"' },
  ];

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.surface,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Voice Commands</Text>
      <View style={styles.commandsList}>
        {commands.map((command, index) => (
          <CommandItem 
            key={index} 
            command={command} 
            colors={colors} 
            delay={index * 100}
          />
        ))}
      </View>
    </Animated.View>
  );
};

const CommandItem = ({ command, colors, delay }) => {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.commandItem,
        {
          opacity: fadeIn,
          transform: [{ translateX }],
        },
      ]}
    >
      <Text style={[styles.commandIcon, { color: colors.primary }]}>{command.icon}</Text>
      <Text style={[styles.commandText, { color: colors.text }]}>{command.text}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    margin: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  commandsList: {
    gap: 10,
  },
  commandItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commandIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  commandText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
});

export default VoiceCommandsGuide;