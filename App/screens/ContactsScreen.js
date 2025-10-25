/**
 * Emergency Contacts Screen
 * Manage emergency contacts with priority levels and groupings
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccessibility } from '../components/AccessibilityProvider';
import AccessibleButton from '../components/AccessibleButton';
import StatusIndicator from '../components/StatusIndicator';
import * as Speech from 'expo-speech';

const ContactsScreen = ({ navigation }) => {
  const { settings, getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Sample emergency contacts data
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = () => {
    // In Phase 2, this will connect to the backend API
    // For now, we'll use sample data
    const sampleContacts = [
      {
        id: '1',
        name: 'Emergency Services',
        phoneNumber: '911',
        priority: 'high',
        group: 'emergency',
        relationship: 'Emergency Services',
        isPrimary: true,
      },
      {
        id: '2',
        name: 'John Doe',
        phoneNumber: '+1 (555) 123-4567',
        priority: 'high',
        group: 'family',
        relationship: 'Spouse',
        isPrimary: false,
      },
      {
        id: '3',
        name: 'Jane Smith',
        phoneNumber: '+1 (555) 987-6543',
        priority: 'medium',
        group: 'medical',
        relationship: 'Doctor',
        isPrimary: false,
      },
      {
        id: '4',
        name: 'Mike Johnson',
        phoneNumber: '+1 (555) 456-7890',
        priority: 'low',
        group: 'friends',
        relationship: 'Close Friend',
        isPrimary: false,
      },
    ];
    
    setContacts(sampleContacts);
    setLoading(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      loadContacts();
      setRefreshing(false);
    }, 1000);
  };

  const handleAddContact = () => {
    navigation.navigate('ContactForm', { mode: 'add' });
  };

  const handleEditContact = (contact) => {
    navigation.navigate('ContactForm', { mode: 'edit', contact });
  };

  const handleDeleteContact = (contactId) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            // In Phase 2, this will connect to the backend API
            setContacts(contacts.filter(contact => contact.id !== contactId));
            
            if (settings.voiceNavigation) {
              Speech.speak('Contact deleted', {
                rate: settings.speechRate,
                pitch: settings.speechPitch,
              });
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

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

  const renderContactItem = ({ item }) => (
    <View style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.contactHeader}>
        <Text style={styles.contactIcon}>{getGroupIcon(item.group)}</Text>
        <View style={styles.contactInfo}>
          <Text style={[styles.contactName, { color: colors.text }]}>
            {item.name}
            {item.isPrimary && (
              <Text style={styles.primaryBadge}> PRIMARY</Text>
            )}
          </Text>
          <Text style={[styles.contactPhone, { color: colors.textSecondary }]}>
            {item.phoneNumber}
          </Text>
          <Text style={[styles.contactRelationship, { color: colors.textSecondary }]}>
            {item.relationship} • {item.group.charAt(0).toUpperCase() + item.group.slice(1)}
          </Text>
        </View>
        <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Text style={styles.priorityText}>
            {item.priority.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.contactActions}>
        <AccessibleButton
          title="Edit"
          onPress={() => handleEditContact(item)}
          variant="outline"
          size="small"
          accessibilityLabel={`Edit contact ${item.name}`}
          style={styles.actionButton}
        />
        <AccessibleButton
          title="Delete"
          onPress={() => handleDeleteContact(item.id)}
          variant="error"
          size="small"
          accessibilityLabel={`Delete contact ${item.name}`}
          style={styles.actionButton}
        />
      </View>
    </View>
  );

  const renderGroupHeader = (group) => {
    const groupContacts = contacts.filter(contact => contact.group === group);
    if (groupContacts.length === 0) return null;
    
    const groupTitles = {
      emergency: 'Emergency Services',
      family: 'Family & Household',
      medical: 'Medical Contacts',
      friends: 'Friends & Neighbors',
    };
    
    return (
      <Text style={[styles.groupHeader, { color: colors.text }]}>
        {groupTitles[group] || group}
      </Text>
    );
  };

  const getGroupedContacts = () => {
    const groups = ['emergency', 'family', 'medical', 'friends'];
    const grouped = {};
    
    groups.forEach(group => {
      const groupContacts = contacts.filter(contact => contact.group === group);
      if (groupContacts.length > 0) {
        grouped[group] = groupContacts;
      }
    });
    
    return grouped;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={[styles.title, { color: 'white' }]}>
          Emergency Contacts
        </Text>
        <Text style={[styles.subtitle, { color: 'white' }]}>
          Manage your emergency contact list
        </Text>
      </View>

      {/* Status Indicator */}
      <StatusIndicator
        status={loading ? 'processing' : 'idle'}
        message={loading ? 'Loading contacts...' : `${contacts.length} contacts loaded`}
        announceVoice={false}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Grouped Contacts */}
        {Object.entries(getGroupedContacts()).map(([group, groupContacts]) => (
          <View key={group}>
            {renderGroupHeader(group)}
            <FlatList
              data={groupContacts}
              renderItem={renderContactItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        ))}

        {/* Empty State */}
        {contacts.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No emergency contacts added yet
            </Text>
            <AccessibleButton
              title="Add Your First Contact"
              onPress={handleAddContact}
              variant="primary"
              size="large"
              accessibilityLabel="Add your first emergency contact"
              style={styles.emptyButton}
            />
          </View>
        )}
      </ScrollView>

      {/* Add Contact Button */}
      <View style={styles.fabContainer}>
        <AccessibleButton
          title="+"
          onPress={handleAddContact}
          variant="primary"
          size="extra-large"
          accessibilityLabel="Add new emergency contact"
          style={styles.fab}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  groupHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 20,
    paddingBottom: 10,
  },
  contactCard: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 12,
    minWidth: 80,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    minWidth: 200,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 80, // Adjusted to account for bottom navigation bar
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ContactsScreen;