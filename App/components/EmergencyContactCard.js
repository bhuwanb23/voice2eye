/**
 * Emergency Contact Card Component
 * Reusable component for displaying emergency contact information
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAccessibility } from './AccessibilityProvider';
import AccessibleButton from './AccessibleButton';

const EmergencyContactCard = ({
  contact,
  onEdit,
  onDelete,
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

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }, style]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{getGroupIcon(contact.group)}</Text>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]}>
            {contact.name}
            {contact.isPrimary && (
              <Text style={styles.primaryBadge}> PRIMARY</Text>
            )}
          </Text>
          <Text style={[styles.phone, { color: colors.textSecondary }]}>
            {contact.phoneNumber}
          </Text>
          <Text style={[styles.details, { color: colors.textSecondary }]}>
            {contact.relationship} • {contact.group.charAt(0).toUpperCase() + contact.group.slice(1)}
          </Text>
        </View>
        <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(contact.priority) }]}>
          <Text style={styles.priorityText}>
            {contact.priority.toUpperCase()}
          </Text>
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
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  primaryBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f44336',
  },
  phone: {
    fontSize: 16,
    marginBottom: 2,
  },
  details: {
    fontSize: 14,
  },
  priorityIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 12,
    minWidth: 80,
  },
});

export default EmergencyContactCard;