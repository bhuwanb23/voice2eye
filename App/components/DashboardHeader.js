/**
 * Beautiful Dashboard Header Component
 * Elegant header with personalized greeting and status indicator
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAccessibility } from '../components/AccessibilityProvider';

const DashboardHeader = ({ personalizedMessage, isEmergencyMode }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <View style={styles.content}>
        <Text style={styles.title}>VOICE2EYE</Text>
        <Text style={styles.subtitle}>
          {isEmergencyMode ? 'Emergency Mode Active' : 'AI-Powered Assistive Technology'}
        </Text>
        {personalizedMessage ? (
          <Text style={styles.welcomeMessage}>{personalizedMessage}</Text>
        ) : null}
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: isEmergencyMode ? '#ff6b6b' : '#4CAF50' }]} />
          <Text style={styles.statusText}>
            {isEmergencyMode ? 'Emergency Active' : 'System Ready'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeMessage: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DashboardHeader;