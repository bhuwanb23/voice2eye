/**
 * Voice Commands Guide Component
 * Beautifully designed voice command reference with improved layout
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAccessibility } from '../components/AccessibilityProvider';

const VoiceCommandsGuide = () => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  const commands = [
    { icon: '🚨', text: 'Say "Emergency" or "Help" for emergency mode' },
    { icon: '⚙️', text: 'Say "Settings" to open configuration' },
    { icon: '👥', text: 'Say "Contacts" to manage emergency contacts' },
    { icon: '📷', text: 'Say "Camera" to open camera view' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Voice Commands</Text>
      <View style={styles.commandsList}>
        {commands.map((command, index) => (
          <View key={index} style={styles.commandItem}>
            <Text style={[styles.commandIcon, { color: colors.primary }]}>{command.icon}</Text>
            <Text style={[styles.commandText, { color: colors.text }]}>{command.text}</Text>
          </View>
        ))}
      </View>
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  commandsList: {
    gap: 16,
  },
  commandItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commandIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  commandText: {
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
  },
});

export default VoiceCommandsGuide;