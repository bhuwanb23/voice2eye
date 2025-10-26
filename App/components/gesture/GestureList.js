/**
 * Gesture List Component
 * Displays all available gestures for training
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AccessibleButton from '../../components/AccessibleButton';
import { useAccessibility } from '../../components/AccessibilityProvider';

const GestureList = ({ gestures, onSelectGesture, gestureProgress, currentGesture }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  const getGestureCardStyle = (gesture) => {
    const isSelected = currentGesture?.id === gesture.id;
    
    return {
      container: {
        backgroundColor: isSelected ? colors.primary : colors.surface,
        borderColor: isSelected ? colors.secondary : colors.border,
        borderWidth: isSelected ? 2 : 1,
      },
      text: {
        color: isSelected ? 'white' : colors.text,
      }
    };
  };

  return (
    <View style={stylesBase.container}>
      <Text style={[stylesBase.sectionTitle, { color: colors.text }]}>
        Available Gestures
      </Text>
      
      <View style={stylesBase.gestureContainer}>
        {gestures.map((gesture) => {
          const styles = getGestureCardStyle(gesture);
          return (
            <AccessibleButton
              key={gesture.id}
              title={`${gesture.emoji} ${gesture.name}`}
              onPress={() => onSelectGesture(gesture)}
              variant="outline"
              size="medium"
              accessibilityLabel={`${gesture.name} gesture. ${gesture.description}`}
              accessibilityHint="Tap to select this gesture for learning"
              style={[stylesBase.gestureCard, styles.container]}
              textStyle={[stylesBase.gestureName, styles.text]}
            />
          );
        })}
      </View>
    </View>
  );
};

const stylesBase = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  gestureContainer: {
    paddingBottom: 10,
  },
  gestureCard: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  gestureName: {
    fontSize: 20,
    fontWeight: '600',
  },
});

export default GestureList;