/**
 * Emergency Contacts Screen - Beautiful Modern Design
 * Clean, attractive contact management with modern UI/UX
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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAccessibility } from '../components/AccessibilityProvider';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

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
      { backgroundColor: colors.surface },
      { opacity: fadeAnim }
    ]}>
      {/* Contact Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
            <Text style={styles.avatarIcon}>{getGroupIcon(item.group)}</Text>
          </View>
          {item.isPrimary && (
            <View style={[styles.primaryBadge, { backgroundColor: colors.error }]}>
              <Text style={styles.primaryBadgeText}>★</Text>
            </View>
          )}
        </View>
        
        <View style={styles.contactDetails}>
          <View style={styles.nameSection}>
            <Text style={[styles.contactName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(item.priority) }]}>
              <Text style={styles.priorityText}>
                {item.priority ? capitalizeFirstLetter(item.priority).charAt(0) : 'M'}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.phoneNumber, { color: colors.textSecondary }]} numberOfLines={1}>
            📞 {item.phoneNumber}
          </Text>
          
          <View style={styles.relationshipRow}>
            <Text style={[styles.relationship, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.relationship}
            </Text>
            <View style={[styles.groupTag, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.groupTagText, { color: colors.primary }]}>
                {capitalizeFirstLetter(item.group)}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.primary + '15' }]}
          onPress={() => handleEditContact(item)}
        >
          <Text style={styles.actionBtnIcon}>✏️</Text>
          <Text style={[styles.actionBtnText, { color: colors.primary }]}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.success + '15' }]}
          onPress={() => handleShareContact(item)}
        >
          <Text style={styles.actionBtnIcon}>📤</Text>
          <Text style={[styles.actionBtnText, { color: colors.success }]}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.error + '15' }]}
          onPress={() => handleDeleteContact(item.id)}
        >
          <Text style={styles.actionBtnIcon}>🗑️</Text>
          <Text style={[styles.actionBtnText, { color: colors.error }]}>Delete</Text>
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
        {/* Beautiful Header with Gradient */}
        <LinearGradient
          colors={[colors.primary, colors.primary + 'E6', colors.primary + 'CC']}
          style={styles.header}
        >
          <Animated.View 
            style={[
              styles.headerContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.headerTitle}>� Emergency Contacts</Text>
            <Text style={styles.headerSubtitle}>
              Your trusted emergency network
            </Text>
            
            {/* Quick Stats Row */}
            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{contacts.length}</Text>
                <Text style={styles.statText}>Contacts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {contacts.filter(c => c.priority === 'high').length}
                </Text>
                <Text style={styles.statText}>Priority</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {contacts.filter(c => c.group === 'emergency').length}
                </Text>
                <Text style={styles.statText}>Emergency</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Modern Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search contacts..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Search contacts"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={[styles.clearButton, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Beautiful Filter Chips */}
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {[
              { key: 'all', label: 'All', icon: '📋', count: contacts.length },
              { key: 'emergency', label: 'Emergency', icon: '🚨', count: contacts.filter(c => c.group === 'emergency').length },
              { key: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', count: contacts.filter(c => c.group === 'family').length },
              { key: 'medical', label: 'Medical', icon: '🏥', count: contacts.filter(c => c.group === 'medical').length },
              { key: 'friends', label: 'Friends', icon: '👥', count: contacts.filter(c => c.group === 'friends').length }
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterChip,
                  { backgroundColor: selectedGroup === filter.key ? colors.primary : colors.surface },
                  { borderColor: selectedGroup === filter.key ? colors.primary : colors.border }
                ]}
                onPress={() => setSelectedGroup(filter.key)}
              >
                <Text style={styles.chipIcon}>{filter.icon}</Text>
                <Text style={[
                  styles.chipLabel,
                  { color: selectedGroup === filter.key ? 'white' : colors.text }
                ]}>
                  {filter.label}
                </Text>
                <View style={[
                  styles.chipBadge,
                  { backgroundColor: selectedGroup === filter.key ? 'rgba(255,255,255,0.3)' : colors.primary }
                ]}>
                  <Text style={[
                    styles.chipBadgeText,
                    { color: selectedGroup === filter.key ? 'white' : 'white' }
                  ]}>
                    {filter.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main Content */}
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Quick Actions */}
          <View style={[styles.quickActions, { backgroundColor: colors.surface }]}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.primary + '15' }]}
              onPress={handleImportContacts}
            >
              <Text style={styles.actionIcon}>📥</Text>
              <Text style={[styles.actionText, { color: colors.primary }]}>Import</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.success + '15' }]}
              onPress={handleExportContacts}
            >
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={[styles.actionText, { color: colors.success }]}>Export</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.warning + '15' }]}
              onPress={handleAddContact}
            >
              <Text style={styles.actionIcon}>➕</Text>
              <Text style={[styles.actionText, { color: colors.warning }]}>Add New</Text>
            </TouchableOpacity>
          </View>

          {/* Contacts List */}
          {filteredContacts.length > 0 ? (
            <FlatList
              data={filteredContacts}
              renderItem={renderContactItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📱</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {searchQuery ? 'No matches found' : 'No contacts yet'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Add your first emergency contact to get started'
                }
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                  onPress={handleAddContact}
                >
                  <Text style={styles.emptyButtonText}>Add Contact</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>

        {/* Modern Floating Action Button */}
        <Animated.View style={[styles.fabContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.primary }]}
            onPress={handleAddContact}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.primary + 'E6']}
              style={styles.fabGradient}
            >
              <Text style={styles.fabIcon}>+</Text>
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
  // Header Styles
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 16,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  statText: {
    fontSize: 10,
    color: 'white',
    opacity: 0.8,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 12,
  },
  // Search Styles
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  clearButton: {
    fontSize: 14,
    paddingHorizontal: 6,
  },
  // Filter Styles
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterScrollContent: {
    paddingRight: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chipIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
  chipBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 16,
    alignItems: 'center',
  },
  chipBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Content Styles
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 80,
  },
  quickActions: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    marginHorizontal: 3,
  },
  actionIcon: {
    fontSize: 16,
    marginBottom: 3,
  },
  actionText: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Contact Card Styles
  contactCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    fontSize: 20,
  },
  primaryBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  contactDetails: {
    flex: 1,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  priorityIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 18,
    alignItems: 'center',
  },
  priorityText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  phoneNumber: {
    fontSize: 13,
    marginBottom: 6,
  },
  relationshipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  relationship: {
    fontSize: 12,
    flex: 1,
  },
  groupTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  groupTagText: {
    fontSize: 9,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  actionBtnIcon: {
    fontSize: 12,
    marginRight: 3,
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // FAB Styles
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    zIndex: 1000,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ContactsScreen;