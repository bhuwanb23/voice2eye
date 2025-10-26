/**
 * Last Command Display Component
 * Beautifully designed display for the last voice command
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAccessibility } from '../components/AccessibilityProvider';

const LastCommandDisplay = ({ lastCommand }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  if (!lastCommand) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.icon, { color: colors.primary }]}>💬</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Last Command</Text>
      </View>
      <Text style={[styles.commandText, { color: colors.text }]}>
        "{lastCommand}"
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  commandText: {
    fontSize: 18,
    fontStyle: 'italic',
    lineHeight: 24,
  },
});

export default LastCommandDisplay;