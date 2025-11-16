/**
 * Emergency Contact Display Component
 * Displays emergency contacts with priority levels and status indicators
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAccessibility } from '../components/AccessibilityProvider';
import EmergencyContactCard from './EmergencyContactCard';

const EmergencyContactDisplay = ({ contacts = [], notificationStatuses = {} }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

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
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Emergency Contacts</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
        </Text>
      </View>
      {contacts.map((contact, index) => (
        <EmergencyContactCard 
          key={contact.id || index}
          contact={contact}
          notificationStatus={notificationStatuses[contact.id]}
          onEdit={() => {}}
          onDelete={() => {}}
          style={styles.contactCard}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  contactCard: {
    marginBottom: 10,
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default EmergencyContactDisplay;