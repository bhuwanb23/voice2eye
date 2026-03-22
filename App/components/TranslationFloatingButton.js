/**
 * Translation Floating Button - Clean Implementation
 */
import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { useAccessibility } from './AccessibilityProvider';

const TranslationFloatingButton = ({ onPress }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors() || { primary: '#7E22CE' };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityLabel="Open translation"
        accessibilityHint="Tap to open translation feature"
      >
        <Text style={styles.icon}>🌐</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 130,
    right: 20,
    zIndex: 1000,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 28,
  },
});

export default TranslationFloatingButton;
