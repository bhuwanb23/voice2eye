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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  historyItem: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historyType: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyStatus: {
    fontSize: 10,
    fontWeight: '600',
  },
  historyTime: {
    fontSize: 10,
  },
  emptyHistory: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyHistoryText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default EmergencyHistory;