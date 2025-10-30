import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAccessibility } from '../components/AccessibilityProvider';
import AccessibleButton from './AccessibleButton';

const EmergencyContactCard = ({
  contact,
  onEdit,
  onDelete,
  notificationStatus, // 'pending', 'sent', 'failed'
  style,
}) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  const getGroupIcon = (group) => {
    switch (group) {
      case 'family':
        return '👨‍👩‍👧‍👦';
      case 'medical':
        return '🏥';
      case 'friends':
        return '👥';
      case 'emergency':
        return '🚨';
      default:
        return '👤';
    }
  };

  const getNotificationStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return colors.success;
      case 'failed':
        return colors.error;
      case 'pending':
      default:
        return colors.warning;
    }
  };

  const getNotificationStatusText = (status) => {
    switch (status) {
      case 'sent':
        return 'Notified';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending';
      default:
        return '';
    }
  };

  // Safely capitalize the first letter of a string
  const capitalizeFirstLetter = (string) => {
    if (!string || typeof string !== 'string') return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }, style]}>
      <View style={styles.header}>
        <Text style={[styles.icon, { color: getPriorityColor(contact.priority) }]}>
          {getGroupIcon(contact.group)}
        </Text>
        <View style={styles.info}>
          <View style={styles.nameContainer}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {contact.name}
            </Text>
            {contact.isPrimary && (
              <View style={[styles.primaryBadge, { backgroundColor: '#f44336' }]}>
                <Text style={styles.primaryBadgeText}>PRIMARY</Text>
              </View>
            )}
          </View>
          <Text style={[styles.phone, { color: colors.textSecondary }]} numberOfLines={1}>
            {contact.phoneNumber}
          </Text>
          <Text style={[styles.details, { color: colors.textSecondary }]} numberOfLines={1}>
            {contact.relationship} • {capitalizeFirstLetter(contact.group)}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(contact.priority) }]}>
            <Text style={styles.priorityText}>
              {contact.priority && typeof contact.priority === 'string' ? contact.priority.toUpperCase() : 'MEDIUM'}
            </Text>
          </View>
          {notificationStatus && (
            <View style={[styles.notificationStatus, { backgroundColor: getNotificationStatusColor(notificationStatus) }]}>
              <Text style={styles.notificationStatusText}>
                {getNotificationStatusText(notificationStatus)}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.actions}>
        <AccessibleButton
          title="Edit"
          onPress={() => onEdit && onEdit(contact)}
          variant="outline"
          size="small"
          accessibilityLabel={`Edit contact ${contact.name}`}
          style={styles.actionButton}
        />
        <AccessibleButton
          title="Delete"
          onPress={() => onDelete && onDelete(contact)}
          variant="error"
          size="small"
          accessibilityLabel={`Delete contact ${contact.name}`}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  info: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  primaryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  primaryBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  phone: {
    fontSize: 16,
    marginBottom: 2,
  },
  details: {
    fontSize: 14,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  priorityIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  notificationStatusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    minWidth: 80,
  },
});

export default EmergencyContactCard;