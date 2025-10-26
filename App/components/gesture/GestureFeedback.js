/**
 * Gesture Feedback Component
 * Visual feedback for gesture detection results
 */
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAccessibility } from '../../components/AccessibilityProvider';

const GestureFeedback = ({ feedbackVisualization }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  if (!feedbackVisualization) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: feedbackVisualization.isAccurate ? colors.success : colors.error,
        }
      ]}
    >
      <Text style={styles.emoji}>
        {feedbackVisualization.gesture.emoji}
      </Text>
      <Text style={styles.feedbackText}>
        {feedbackVisualization.isAccurate ? 'Great job!' : 'Try again'}
      </Text>
      <Text style={styles.detailText}>
        {feedbackVisualization.gesture.name} - {(feedbackVisualization.confidence * 100).toFixed(1)}% confidence
      </Text>
    </Animated.View>
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
  emoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
});

export default GestureFeedback;