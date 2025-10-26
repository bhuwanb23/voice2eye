/**
 * Training Mode Selector Component
 * Allows users to switch between different training modes
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import AccessibleButton from '../../components/AccessibleButton';
import { useAccessibility } from '../../components/AccessibilityProvider';

const TrainingModeSelector = ({ trainingMode, setTrainingMode }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.buttonContainer}>
        <AccessibleButton
          title="Learn"
          onPress={() => setTrainingMode('learn')}
          variant={trainingMode === 'learn' ? 'primary' : 'outline'}
          size="medium"
          accessibilityLabel="Switch to learn mode"
          style={styles.modeButton}
        />
        <AccessibleButton
          title="Practice"
          onPress={() => setTrainingMode('practice')}
          variant={trainingMode === 'practice' ? 'primary' : 'outline'}
          size="medium"
          accessibilityLabel="Switch to practice mode"
          style={styles.modeButton}
        />
        <AccessibleButton
          title="Test"
          onPress={() => setTrainingMode('test')}
          variant={trainingMode === 'test' ? 'primary' : 'outline'}
          size="medium"
          accessibilityLabel="Switch to test mode"
          style={styles.modeButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  modeButton: {
    flex: 1,
    marginHorizontal: 8,
    minWidth: 80,
  },
});

export default TrainingModeSelector;