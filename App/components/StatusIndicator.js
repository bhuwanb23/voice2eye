/**
 * Beautiful Modern Status Indicator Component
 * Enhanced with gradients, animations, and modern design
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useAccessibility } from './AccessibilityProvider';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');

const StatusIndicator = ({
  status = 'idle', // idle, listening, processing, emergency, error
  message = '',
  showVisual = true,
  announceVoice = true,
  style,
}) => {
  const { settings, getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (status === 'listening' || status === 'processing') {
      // Start pulsing animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      // Fade in animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {
        pulse.stop();
      };
    } else {
      // Fade out animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [status]);

  useEffect(() => {
    if (announceVoice && message && settings.voiceNavigation) {
      // Announce status changes via voice
      Speech.speak(message, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
        language: 'en',
      });
    }
  }, [status, message, announceVoice, settings.voiceNavigation]);

  const getStatusConfig = () => {
    switch (status) {
      case 'listening':
        return {
          color: '#4CAF50',
          icon: '🎤',
          text: 'Listening...',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderColor: '#4CAF50',
          gradient: ['#4CAF50', '#45a049'],
        };
      case 'processing':
        return {
          color: '#FF9800',
          icon: '⚙️',
          text: 'Processing...',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          borderColor: '#FF9800',
          gradient: ['#FF9800', '#f57c00'],
        };
      case 'emergency':
        return {
          color: '#f44336',
          icon: '🚨',
          text: 'EMERGENCY MODE',
          backgroundColor: 'rgba(244, 67, 54, 0.2)',
          borderColor: '#f44336',
          gradient: ['#f44336', '#d32f2f'],
        };
      case 'error':
        return {
          color: '#f44336',
          icon: '❌',
          text: 'Error',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          borderColor: '#f44336',
          gradient: ['#f44336', '#d32f2f'],
        };
      case 'idle':
      default:
        return {
          color: '#9E9E9E',
          icon: '⏸️',
          text: 'Ready',
          backgroundColor: 'rgba(158, 158, 158, 0.1)',
          borderColor: '#9E9E9E',
          gradient: ['#9E9E9E', '#757575'],
        };
    }
  };

  const config = getStatusConfig();

  if (!showVisual && status === 'idle') {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
          opacity: fadeAnim,
          transform: [
            { scale: pulseAnim },
            { translateY: slideAnim },
          ],
        },
        style,
      ]}
      accessible={true}
      accessibilityRole={status === 'emergency' ? 'alert' : 'text'}
      accessibilityLabel={`Status: ${config.text}${message ? `. ${message}` : ''}`}
      accessibilityLiveRegion={status === 'emergency' ? 'assertive' : 'polite'}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
          <Text style={styles.icon}>{config.icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.statusText, { color: config.color }]}>
            {config.text}
          </Text>
          {message && (
            <Text style={[styles.messageText, { color: '#666' }]}>
              {message}
            </Text>
          )}
        </View>
      </View>
      
      {(status === 'listening' || status === 'processing') && (
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                backgroundColor: config.color,
                transform: [{ scaleX: pulseAnim }],
              },
            ]}
          />
        </View>
      )}

      {/* Emergency mode special styling */}
      {status === 'emergency' && (
        <View style={styles.emergencyOverlay}>
          <Text style={styles.emergencyText}>⚠️ EMERGENCY ACTIVE ⚠️</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 2,
    // Removed default margins to prevent unwanted spacing
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    width: '100%',
    backgroundColor: '#4A90E2',
  },
  emergencyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default StatusIndicator;