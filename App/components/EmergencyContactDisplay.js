/**
 * Emergency Contact Display Component
 * Displays emergency contacts with priority levels and status indicators
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAccessibility } from '../components/AccessibilityProvider';

const EmergencyContactDisplay = ({ contacts = [] }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.textSecondary;
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

  const getStatusIcon = (enabled) => {
    return enabled ? '✓' : '✗';
  };

  const getStatusColor = (enabled) => {
    return enabled ? colors.success : colors.textSecondary;
  };

  if (!contacts || contacts.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Emergency Contacts</Text>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No emergency contacts configured
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Emergency Contacts</Text>
      {contacts.map((contact, index) => (
        <View 
          key={contact.id || index} 
          style={[styles.contactItem, { borderBottomColor: colors.border }]}
          accessible={true}
          accessibilityLabel={`Contact: ${contact.name}, priority: ${contact.priority}, status: ${contact.enabled ? 'enabled' : 'disabled'}`}
        >
          <View style={styles.contactHeader}>
            <Text style={styles.contactIcon}>{getGroupIcon(contact.group)}</Text>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, { color: colors.text }]}>
                {contact.name}
                {contact.isPrimary && (
                  <Text style={styles.primaryBadge}> PRIMARY</Text>
                )}
              </Text>
              <Text style={[styles.contactPhone, { color: colors.textSecondary }]}>
                {contact.phoneNumber}
              </Text>
              <Text style={[styles.contactRelationship, { color: colors.textSecondary }]}>
                {contact.relationship}
              </Text>
            </View>
          </View>
          
          <View style={styles.contactMeta}>
            <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(contact.priority) }]}>
              <Text style={styles.priorityText}>
                {contact.priority.toUpperCase()}
              </Text>
            </View>
            <View style={styles.statusContainer}>
              <Text style={[styles.statusIcon, { color: getStatusColor(contact.enabled) }]}>
                {getStatusIcon(contact.enabled)}
              </Text>
              <Text style={[styles.statusText, { color: getStatusColor(contact.enabled) }]}>
                {contact.enabled ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
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
  contactItem: {
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  primaryBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f44336',
  },
  contactPhone: {
    fontSize: 16,
    marginBottom: 2,
  },
  contactRelationship: {
    fontSize: 14,
  },
  contactMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 4,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EmergencyContactDisplay;