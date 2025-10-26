/**
 * Gesture Progress Bar Component
 * Animated progress bar for gesture detection
 */
import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useAccessibility } from '../../components/AccessibilityProvider';

const GestureProgressBar = ({ progressAnim, isDetecting }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  if (!isDetecting) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Animated.View 
        style={[
          styles.progressBar, 
          { 
            backgroundColor: colors.primary,
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 6,
    width: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});

export default GestureProgressBar;