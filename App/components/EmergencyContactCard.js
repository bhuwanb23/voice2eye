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
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
    marginTop: 1,
  },
  info: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
  },
  primaryBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  primaryBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  phone: {
    fontSize: 12,
    marginBottom: 2,
  },
  details: {
    fontSize: 10,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  priorityIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priorityText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
  notificationStatus: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 3,
  },
  notificationStatusText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  actionButton: {
    minWidth: 60,
  },
});

export default EmergencyContactCard;