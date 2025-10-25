/**
 * Emergency History Component
 * Displays recent emergency alerts in an accessible format
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAccessibility } from './AccessibilityProvider';

const EmergencyHistory = ({ emergencyHistory }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Emergencies</Text>
      {emergencyHistory && emergencyHistory.length > 0 ? (
        emergencyHistory.map((alert, index) => (
          <View 
            key={alert.id || index} 
            style={[styles.historyItem, { backgroundColor: colors.surface }]}
            accessible={true}
            accessibilityLabel={`Emergency alert triggered by ${alert.type} at ${alert.time}, status: ${alert.status}`}
          >
            <View style={styles.historyItemHeader}>
              <Text style={[styles.historyType, { 
                color: alert.type === 'voice' ? colors.primary : colors.accent 
              }]}>
                {alert.type === 'voice' ? '🎤 Voice' : '✋ Gesture'}
              </Text>
              <Text style={[styles.historyStatus, { 
                color: alert.status === 'confirmed' ? colors.success : colors.warning 
              }]}>
                {alert.status}
              </Text>
            </View>
            <Text style={[styles.historyTime, { color: colors.textSecondary }]}>{alert.time}</Text>
          </View>
        ))
      ) : (
        <View style={[styles.emptyHistory, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyHistoryText, { color: colors.textSecondary }]}>
            No emergency alerts triggered yet
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  historyItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyType: {
    fontSize: 16,
    fontWeight: '600',
  },
  historyStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyTime: {
    fontSize: 14,
  },
  emptyHistory: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyHistoryText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default EmergencyHistory;