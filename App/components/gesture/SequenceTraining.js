/**
 * Sequence Training Component
 * Allows users to practice gesture sequences
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AccessibleButton from '../../components/AccessibleButton';
import { useAccessibility } from '../../components/AccessibilityProvider';

const SequenceTraining = ({ sequences, onStartSequence, currentSequence }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return colors.success;
      case 'medium': return colors.warning;
      case 'hard': return colors.error;
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={[stylesBase.container, { backgroundColor: colors.surface }]}>
      <Text style={[stylesBase.sectionTitle, { color: colors.text }]}>
        Sequence Training
      </Text>
      <Text style={[stylesBase.sectionDescription, { color: colors.textSecondary }]}>
        Practice complex gesture sequences
      </Text>
      
      <View style={stylesBase.sequenceContainer}>
        {sequences.map((sequence) => {
          const isSelected = currentSequence?.id === sequence.id;
          
          return (
            <View 
              key={sequence.id}
              style={[
                stylesBase.sequenceItem, 
                { 
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.secondary : colors.border,
                }
              ]}
            >
              <View style={stylesBase.sequenceHeader}>
                <Text style={[
                  stylesBase.sequenceTitle, 
                  { 
                    color: isSelected ? 'white' : colors.text,
                  }
                ]}>
                  {sequence.name}
                </Text>
                <Text style={[
                  stylesBase.difficultyBadge, 
                  { 
                    color: getDifficultyColor(sequence.difficulty),
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                  }
                ]}>
                  {sequence.difficulty}
                </Text>
              </View>
              <Text style={[
                stylesBase.sequenceDescription, 
                { 
                  color: isSelected ? 'rgba(255,255,255,0.9)' : colors.textSecondary,
                }
              ]}>
                {sequence.description}
              </Text>
              <AccessibleButton
                title="Start Training"
                onPress={() => onStartSequence(sequence)}
                variant={isSelected ? 'secondary' : 'primary'}
                size="small"
                accessibilityLabel={`Start ${sequence.name} sequence training`}
                style={stylesBase.startButton}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const stylesBase = StyleSheet.create({
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  sequenceContainer: {
    paddingBottom: 10,
  },
  sequenceItem: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sequenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sequenceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  difficultyBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    textTransform: 'uppercase',
  },
  sequenceDescription: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  startButton: {
    alignSelf: 'flex-start',
  },
});

export default SequenceTraining;