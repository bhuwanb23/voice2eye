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
  TextInput,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState([]);

  // Sample emergency contacts data
  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [searchQuery, contacts]);

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
        history: [
          { date: '2023-05-15', action: 'Contacted during emergency' },
          { date: '2023-03-22', action: 'System test' }
        ]
      },
      {
        id: '2',
        name: 'John Doe',
        phoneNumber: '+1 (555) 123-4567',
        priority: 'high',
        group: 'family',
        relationship: 'Spouse',
        isPrimary: false,
        history: [
          { date: '2023-06-10', action: 'Added to contacts' }
        ]
      },
      {
        id: '3',
        name: 'Jane Smith',
        phoneNumber: '+1 (555) 987-6543',
        priority: 'medium',
        group: 'medical',
        relationship: 'Doctor',
        isPrimary: false,
        history: [
          { date: '2023-04-18', action: 'Added to contacts' },
          { date: '2023-05-30', action: 'Updated phone number' }
        ]
      },
      {
        id: '4',
        name: 'Mike Johnson',
        phoneNumber: '+1 (555) 456-7890',
        priority: 'low',
        group: 'friends',
        relationship: 'Close Friend',
        isPrimary: false,
        history: [
          { date: '2023-02-14', action: 'Added to contacts' }
        ]
      },
    ];
    
    setContacts(sampleContacts);
    setFilteredContacts(sampleContacts);
    setLoading(false);
  };

  const filterContacts = () => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
      return;
    }
    
    const filtered = contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phoneNumber.includes(searchQuery) ||
      contact.relationship.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.group.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredContacts(filtered);
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
            const updatedContacts = contacts.filter(contact => contact.id !== contactId);
            setContacts(updatedContacts);
            setFilteredContacts(updatedContacts);
            
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

  const handleShareContact = (contact) => {
    // In a real implementation, this would share the contact
    Alert.alert(
      'Share Contact',
      `Sharing contact: ${contact.name}\nPhone: ${contact.phoneNumber}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Share', 
          onPress: () => {
            if (settings.voiceNavigation) {
              Speech.speak(`Sharing contact ${contact.name}`, {
                rate: settings.speechRate,
                pitch: settings.speechPitch,
              });
            }
            Alert.alert('Shared', 'Contact shared successfully');
          }
        }
      ]
    );
  };

  const handleImportContacts = () => {
    // In a real implementation, this would import contacts from device
    Alert.alert(
      'Import Contacts',
      'This feature will import contacts from your device address book.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Import', 
          onPress: () => {
            if (settings.voiceNavigation) {
              Speech.speak('Importing contacts', {
                rate: settings.speechRate,
                pitch: settings.speechPitch,
              });
            }
            Alert.alert('Imported', 'Contacts imported successfully');
          }
        }
      ]
    );
  };

  const handleExportContacts = () => {
    // In a real implementation, this would export contacts to a file
    Alert.alert(
      'Export Contacts',
      'This feature will export all contacts to a file.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Export', 
          onPress: () => {
            if (settings.voiceNavigation) {
              Speech.speak('Exporting contacts', {
                rate: settings.speechRate,
                pitch: settings.speechPitch,
              });
            }
            Alert.alert('Exported', 'Contacts exported successfully');
          }
        }
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
          title="Share"
          onPress={() => handleShareContact(item)}
          variant="outline"
          size="small"
          accessibilityLabel={`Share contact ${item.name}`}
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
      
      {item.history && item.history.length > 0 && (
        <View style={styles.historySection}>
          <Text style={[styles.historyTitle, { color: colors.textSecondary }]}>
            History ({item.history.length})
          </Text>
          <Text style={[styles.historyItem, { color: colors.textSecondary }]}>
            {item.history[0].date}: {item.history[0].action}
          </Text>
        </View>
      )}
    </View>
  );

  const renderGroupHeader = (group) => {
    const groupContacts = filteredContacts.filter(contact => contact.group === group);
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
      const groupContacts = filteredContacts.filter(contact => contact.group === group);
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

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: colors.background,
            color: colors.text,
            borderColor: colors.border,
          }]}
          placeholder="Search contacts..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search contacts"
          accessibilityHint="Enter name, phone number, or relationship to search contacts"
        />
      </View>

      {/* Status Indicator */}
      <StatusIndicator
        status={loading ? 'processing' : 'idle'}
        message={loading ? 'Loading contacts...' : `${filteredContacts.length} contacts found`}
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
        {/* Import/Export Controls */}
        <View style={[styles.importExportContainer, { backgroundColor: colors.surface }]}>
          <AccessibleButton
            title="Import"
            onPress={handleImportContacts}
            variant="outline"
            size="small"
            accessibilityLabel="Import contacts from device"
            style={styles.importExportButton}
          />
          <AccessibleButton
            title="Export"
            onPress={handleExportContacts}
            variant="outline"
            size="small"
            accessibilityLabel="Export contacts to file"
            style={styles.importExportButton}
          />
        </View>

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
        {filteredContacts.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchQuery ? 'No contacts match your search' : 'No emergency contacts added yet'}
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
  searchContainer: {
    padding: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  importExportContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
  },
  importExportButton: {
    marginHorizontal: 8,
    minWidth: 100,
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
    marginBottom: 12,
  },
  actionButton: {
    marginLeft: 12,
    minWidth: 80,
  },
  historySection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  historyItem: {
    fontSize: 12,
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