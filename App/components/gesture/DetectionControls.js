/**
 * Detection Controls Component
 * Action buttons for gesture detection and navigation
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import AccessibleButton from '../../components/AccessibleButton';
import { useAccessibility } from '../../components/AccessibilityProvider';

const DetectionControls = ({ isDetecting, onStartDetection, onNavigateBack }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <AccessibleButton
        title={isDetecting ? "Detecting..." : "Start Detection"}
        onPress={onStartDetection}
        variant="primary"
        size="large"
        disabled={isDetecting}
        accessibilityLabel="Start gesture detection"
        style={styles.actionButton}
        loading={isDetecting}
      />
      
      <AccessibleButton
        title="Back to Dashboard"
        onPress={onNavigateBack}
        variant="outline"
        size="large"
        accessibilityLabel="Return to main dashboard"
        style={styles.actionButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  actionButton: {
    marginVertical: 8,
  },
});

export default DetectionControls;