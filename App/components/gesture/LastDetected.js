/**
 * Last Detected Gesture Component
 * Displays information about the last detected gesture
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAccessibility } from '../../components/AccessibilityProvider';

const LastDetected = ({ lastDetectedGesture }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  if (!lastDetectedGesture) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.success }]}>
      <Text style={styles.title}>
        Last Detected Gesture
      </Text>
      <View style={styles.gestureInfo}>
        <Text style={styles.emoji}>
          {lastDetectedGesture.emoji}
        </Text>
        <Text style={styles.gestureName}>
          {lastDetectedGesture.name}
        </Text>
      </View>
      <Text style={styles.confidence}>
        Confidence: {(lastDetectedGesture.confidence * 100).toFixed(1)}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    color: 'white',
    marginBottom: 12,
    fontWeight: '600',
  },
  gestureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 36,
    marginRight: 12,
  },
  gestureName: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  confidence: {
    fontSize: 18,
    color: 'white',
    fontWeight: '500',
  },
});

export default LastDetected;