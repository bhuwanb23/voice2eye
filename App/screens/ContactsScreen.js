/**
 * Emergency Contacts Screen - Ultimate App Experience
 * Beautiful and attractive contact management with modern UI/UX
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAccessibility } from '../components/AccessibilityProvider';
import AccessibleButton from '../components/AccessibleButton';
import StatusIndicator from '../components/StatusIndicator';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

const ContactsScreen = ({ navigation }) => {
  const { settings, getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Sample emergency contacts data
  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [searchQuery, contacts, selectedGroup]);

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
    let filtered = contacts;
    
    // Filter by group
    if (selectedGroup !== 'all') {
      filtered = filtered.filter(contact => contact.group === selectedGroup);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(contact => 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phoneNumber.includes(searchQuery) ||
        contact.relationship.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.group.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
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
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate('ContactForm', { mode: 'add' });
  };

  const handleEditContact = (contact) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
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

  // Safely capitalize the first letter of a string
  const capitalizeFirstLetter = (string) => {
    if (!string || typeof string !== 'string') return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const renderContactItem = ({ item }) => (
    <Animated.View style={[
      styles.contactCard, 
      { backgroundColor: colors.surface, borderColor: colors.border },
      { opacity: fadeAnim }
    ]}>
      <View style={styles.contactHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.contactIcon}>{getGroupIcon(item.group)}</Text>
          {item.isPrimary && (
            <View style={styles.primaryDot} />
          )}
        </View>
        <View style={styles.contactInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.contactName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
              <Text style={styles.priorityText}>
                {item.priority ? capitalizeFirstLetter(item.priority).charAt(0) : 'M'}
              </Text>
            </View>
          </View>
          <Text style={[styles.contactPhone, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.phoneNumber}
          </Text>
          <Text style={[styles.contactRelationship, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.relationship}
          </Text>
        </View>
      </View>
      
      <View style={styles.contactActions}>
        <TouchableOpacity 
          style={[styles.miniActionButton, { backgroundColor: colors.primary + '20' }]}
          onPress={() => handleEditContact(item)}
        >
          <Text style={[styles.miniActionText, { color: colors.primary }]}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.miniActionButton, { backgroundColor: colors.success + '20' }]}
          onPress={() => handleShareContact(item)}
        >
          <Text style={[styles.miniActionText, { color: colors.success }]}>📤</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.miniActionButton, { backgroundColor: colors.error + '20' }]}
          onPress={() => handleDeleteContact(item.id)}
        >
          <Text style={[styles.miniActionText, { color: colors.error }]}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
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
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={colors.primary} 
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Modern Hero Header with Gradient */}
        <LinearGradient
          colors={[colors.primary, colors.primary + 'DD', colors.primary + '99']}
          style={styles.heroHeader}
        >
          <Animated.View 
            style={[
              styles.heroContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.heroTitle}>👥 Emergency Contacts</Text>
            <Text style={styles.heroSubtitle}>
              Manage your emergency contact network
            </Text>
            
            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.statNumber}>{contacts.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.statNumber}>
                  {contacts.filter(c => c.priority === 'high').length}
                </Text>
                <Text style={styles.statLabel}>High Priority</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.statNumber}>
                  {contacts.filter(c => c.isPrimary).length}
                </Text>
                <Text style={styles.statLabel}>Primary</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Compact Search and Filter Section */}
        <View style={[styles.searchFilterContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.modernSearchInput, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              }]}
              placeholder="Search contacts..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Search contacts"
            />
          </View>
          
          {/* Compact Filter Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterTabs}
            contentContainerStyle={styles.filterTabsContent}
          >
            {[
              { key: 'all', label: 'All', icon: '📋' },
              { key: 'emergency', label: 'Emergency', icon: '🚨' },
              { key: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
              { key: 'medical', label: 'Medical', icon: '🏥' },
              { key: 'friends', label: 'Friends', icon: '👥' }
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterTab,
                  selectedGroup === filter.key && [styles.activeFilterTab, { backgroundColor: colors.primary }]
                ]}
                onPress={() => setSelectedGroup(filter.key)}
              >
                <Text style={styles.filterIcon}>{filter.icon}</Text>
                <Text style={[
                  styles.filterLabel,
                  { color: selectedGroup === filter.key ? 'white' : colors.textSecondary }
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

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

      {/* Floating Action Button */}
      <Animated.View style={[styles.fabContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={handleAddContact}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary, colors.primary + 'DD']}
            style={styles.fabGradient}
          >
            <Text style={styles.fabText}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroHeader: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  heroContent: {
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
  },
  statCard: {
    padding: 12,
    borderRadius: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    color: 'white',
    opacity: 0.8,
  },
  searchFilterContainer: {
    padding: 12,
    marginTop: -8,
    marginHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  modernSearchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
  },
  filterTabs: {
    marginBottom: 4,
  },
  filterTabsContent: {
    paddingHorizontal: 4,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 6,
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 32,
  },
  activeFilterTab: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  filterIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  modernStatusIndicator: {
    marginHorizontal: 16,
    marginBottom: 8,
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
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  contactCard: {
    marginVertical: 6,
    marginHorizontal: 4,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: 24,
  },
  primaryDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4444',
  },
  contactInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  priorityText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
  contactPhone: {
    fontSize: 14,
    marginBottom: 2,
  },
  contactRelationship: {
    fontSize: 12,
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  miniActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniActionText: {
    fontSize: 14,
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
    right: 16,
    bottom: 90,
    zIndex: 1000,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ContactsScreen;