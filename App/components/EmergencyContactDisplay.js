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
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  contactCard: {
    marginBottom: 16,
  },
  emptyState: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default EmergencyContactDisplay;