/**
 * Gesture Details Component
 * Displays detailed information about a selected gesture
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AccessibleButton from '../../components/AccessibleButton';
import { useAccessibility } from '../../components/AccessibilityProvider';

const GestureDetails = ({ 
  currentGesture, 
  accuracyMetrics, 
  trainingMode, 
  onStartPractice, 
  onStartTest,
  getAccuracyColor
}) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  if (!currentGesture) return null;

  const metrics = accuracyMetrics[currentGesture.id];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.content}>
        <Text style={[styles.emoji, { fontSize: 70 }]}>
          {currentGesture.emoji}
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>
          {currentGesture.name}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {currentGesture.description}
        </Text>
        <Text style={[styles.instruction, { color: colors.text }]}>
          {currentGesture.instruction}
        </Text>
        
        {metrics && (
          <View style={[styles.accuracyContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.accuracyTitle, { color: colors.text }]}>
              Your Performance
            </Text>
            <View style={styles.accuracyRow}>
              <Text style={[styles.accuracyLabel, { color: colors.textSecondary }]}>
                Accuracy:
              </Text>
              <Text style={[styles.accuracyValue, { color: getAccuracyColor(metrics.accuracy) }]}>
                {metrics.accuracy}%
              </Text>
            </View>
            <View style={styles.accuracyRow}>
              <Text style={[styles.accuracyLabel, { color: colors.textSecondary }]}>
                Success Rate:
              </Text>
              <Text style={[styles.accuracyValue, { color: colors.text }]}>
                {metrics.success}/{metrics.attempts}
              </Text>
            </View>
          </View>
        )}
        
        {trainingMode === 'practice' && (
          <AccessibleButton
            title="Start Practice"
            onPress={onStartPractice}
            variant="primary"
            size="large"
            accessibilityLabel="Start practicing this gesture"
            style={styles.actionButton}
          />
        )}
        
        {trainingMode === 'test' && (
          <AccessibleButton
            title="Start Test"
            onPress={onStartTest}
            variant="accent"
            size="large"
            accessibilityLabel="Start testing this gesture"
            style={styles.actionButton}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
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
  content: {
    padding: 25,
    alignItems: 'center',
  },
  emoji: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 25,
    lineHeight: 22,
  },
  accuracyContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
  },
  accuracyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  accuracyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  accuracyLabel: {
    fontSize: 16,
  },
  accuracyValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButton: {
    marginTop: 10,
    width: '100%',
  },
});

export default GestureDetails;