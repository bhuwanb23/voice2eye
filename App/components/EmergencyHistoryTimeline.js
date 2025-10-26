/**
 * Emergency History Timeline Component
 * Displays a timeline of emergency alerts with status and details
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAccessibility } from '../components/AccessibilityProvider';

const EmergencyHistoryTimeline = ({ history = [] }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return colors.success;
      case 'cancelled':
        return colors.warning;
      case 'pending':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const getTriggerIcon = (triggerType) => {
    switch (triggerType) {
      case 'voice':
        return '🎤';
      case 'gesture':
        return '✋';
      case 'manual':
        return '👆';
      default:
        return '🚨';
    }
  };

  if (!history || history.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Emergency History</Text>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No emergency alerts triggered yet
          </Text>
        </View>
      </View>
    );
  }

  // Sort history by timestamp (newest first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at)
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Emergency History</Text>
      {sortedHistory.map((alert, index) => (
        <View 
          key={alert.alert_id || alert.id || index} 
          style={[styles.timelineItem, { borderLeftColor: getStatusColor(alert.status) }]}
          accessible={true}
          accessibilityLabel={`Emergency alert triggered by ${alert.trigger_type} at ${alert.timestamp || alert.created_at}, status: ${alert.status}`}
        >
          <View style={styles.timelineHeader}>
            <Text style={[styles.triggerIcon, { color: getStatusColor(alert.status) }]}>
              {getTriggerIcon(alert.trigger_type)}
            </Text>
            <View style={styles.timelineInfo}>
              <Text style={[styles.triggerType, { color: colors.text }]}>
                {alert.trigger_type === 'voice' ? 'Voice Trigger' : 
                 alert.trigger_type === 'gesture' ? 'Gesture Trigger' : 'Manual Trigger'}
              </Text>
              <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
                {alert.timestamp || alert.created_at}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(alert.status) }]}>
              <Text style={styles.statusText}>
                {alert.status}
              </Text>
            </View>
          </View>
          
          {alert.location && (
            <View style={styles.locationContainer}>
              <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>Location:</Text>
              <Text style={[styles.locationText, { color: colors.text }]}>
                {typeof alert.location === 'string' ? alert.location : 
                 `${alert.location.latitude}, ${alert.location.longitude}`}
              </Text>
            </View>
          )}
          
          {alert.messages_sent > 0 && (
            <View style={styles.messagesContainer}>
              <Text style={[styles.messagesText, { color: colors.text }]}>
                Contacts notified: {alert.messages_sent}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  timelineItem: {
    borderLeftWidth: 3,
    paddingLeft: 16,
    paddingBottom: 16,
    marginBottom: 16,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  triggerIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  timelineInfo: {
    flex: 1,
  },
  triggerType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  locationContainer: {
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
  },
  messagesContainer: {
    marginTop: 4,
  },
  messagesText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default EmergencyHistoryTimeline;