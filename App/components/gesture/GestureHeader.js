/**
 * Gesture Header Component
 * Beautiful header for the gesture training screen
 */
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useAccessibility } from '../../components/AccessibilityProvider';

const { width } = Dimensions.get('window');

const GestureHeader = () => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  return (
    <View style={[styles.header, { backgroundColor: colors.primary }]}>
      <Text style={[styles.title, { color: 'white' }]}>
        Gesture Training
      </Text>
      <Text style={[styles.subtitle, { color: 'white' }]}>
        Learn and practice hand gestures
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.9,
    textAlign: 'center',
    maxWidth: '80%',
  },
});

export default GestureHeader;