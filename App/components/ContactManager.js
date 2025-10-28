/**
 * Contact Manager Component
 * Comprehensive contact management with card display, editing, search, import/export, and group management
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useAccessibility } from './AccessibilityProvider';
import AccessibleButton from './AccessibleButton';

const ContactManager = ({ contacts, onUpdateContacts }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    relationship: '',
    group: 'family',
    priority: 'medium',
    isPrimary: false,
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const groups = ['all', 'emergency', 'family', 'medical', 'friends'];
  const priorities = ['low', 'medium', 'high'];

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phoneNumber.includes(searchQuery) ||
      contact.relationship.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGroup = filterGroup === 'all' || contact.group === filterGroup;
    
    return matchesSearch && matchesGroup;
  });

  // Validation
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }
    
    if (!formData.relationship.trim()) {
      newErrors.relationship = 'Relationship is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form handlers
  const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      relationship: contact.relationship,
      group: contact.group,
      priority: contact.priority,
      isPrimary: contact.isPrimary,
      notes: contact.notes || '',
    });
    setErrors({});
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      phoneNumber: '',
      relationship: '',
      group: 'family',
      priority: 'medium',
      isPrimary: false,
      notes: '',
    });
    setErrors({});
    setShowEditModal(true);
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    if (editingContact) {
      // Update existing contact
      const updated = contacts.map(c => 
        c.id === editingContact.id 
          ? { ...c, ...formData, updatedAt: new Date().toISOString() }
          : c
      );
      onUpdateContacts(updated);
      Alert.alert('Success', 'Contact updated successfully');
    } else {
      // Add new contact
      const newContact = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [{ date: new Date().toISOString().split('T')[0], action: 'Contact added' }]
      };
      onUpdateContacts([...contacts, newContact]);
      Alert.alert('Success', 'Contact added successfully');
    }
    
    setShowEditModal(false);
  };

  const handleDelete = (contactId) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = contacts.filter(c => c.id !== contactId);
            onUpdateContacts(updated);
            Alert.alert('Success', 'Contact deleted successfully');
          },
        },
      ]
    );
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
      });

      if (!result.canceled) {
        const fileUri = result.assets[0].uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        const importedContacts = JSON.parse(fileContent);
        
        if (Array.isArray(importedContacts)) {
          onUpdateContacts([...contacts, ...importedContacts]);
          Alert.alert('Success', `${importedContacts.length} contacts imported`);
        } else {
          Alert.alert('Error', 'Invalid file format');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to import contacts');
    }
  };

  const handleExport = async () => {
    try {
      const fileName = `contacts_backup_${Date.now()}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(contacts, null, 2));
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
        });
      } else {
        Alert.alert('Success', `Contacts exported to ${fileName}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export contacts');
    }
  };

  const getGroupIcon = (group) => {
    const icons = {
      family: '👨‍👩‍👧‍👦',
      medical: '🏥',
      friends: '👥',
      emergency: '🚨',
    };
    return icons[group] || '👤';
  };

  // Priority color mapping
  const getPriorityColor = (priority) => {
    const colors_map = {
      high: '#f44336',
      medium: '#ff9800',
      low: '#4caf50',
    };
    return colors_map[priority] || '#9e9e9e';
  };

  return (
    <View style={styles.container}>
      {/* Search and Filter Controls */}
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
        />
        
        {/* Group Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {groups.map(group => (
            <TouchableOpacity
              key={group}
              style={[
                styles.filterChip,
                filterGroup === group && { backgroundColor: colors.primary }
              ]}
              onPress={() => setFilterGroup(group)}
            >
              <Text style={[
                styles.filterText,
                { color: filterGroup === group ? 'white' : colors.text }
              ]}>
                {capitalizeFirstLetter(group)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Contact Cards */}
      <ScrollView style={styles.contactsList}>
        {filteredContacts.map(contact => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getGroupIcon={getGroupIcon}
            getPriorityColor={getPriorityColor}
            colors={colors}
          />
        ))}
      </ScrollView>

      {/* Add Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={handleAdd}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Edit/Add Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <ScrollView>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingContact ? 'Edit Contact' : 'Add Contact'}
              </Text>

              {/* Name Field */}
              <Text style={[styles.label, { color: colors.text }]}>Name *</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: errors.name ? colors.error : colors.border,
                }]}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
              {errors.name && <Text style={[styles.errorText, { color: colors.error }]}>{errors.name}</Text>}

              {/* Phone Number Field */}
              <Text style={[styles.label, { color: colors.text }]}>Phone Number *</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: errors.phoneNumber ? colors.error : colors.border,
                }]}
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                keyboardType="phone-pad"
              />
              {errors.phoneNumber && <Text style={[styles.errorText, { color: colors.error }]}>{errors.phoneNumber}</Text>}

              {/* Relationship Field */}
              <Text style={[styles.label, { color: colors.text }]}>Relationship *</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: errors.relationship ? colors.error : colors.border,
                }]}
                value={formData.relationship}
                onChangeText={(text) => setFormData({ ...formData, relationship: text })}
              />
              {errors.relationship && <Text style={[styles.errorText, { color: colors.error }]}>{errors.relationship}</Text>}

              {/* Group Selector */}
              <Text style={[styles.label, { color: colors.text }]}>Group</Text>
              <View style={styles.radioGroup}>
                {groups.filter(g => g !== 'all').map(group => (
                  <TouchableOpacity
                    key={group}
                    style={[
                      styles.radioOption,
                      formData.group === group && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => setFormData({ ...formData, group })}
                  >
                    <Text style={{ color: formData.group === group ? 'white' : colors.text }}>
                      {getGroupIcon(group)} {group}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Priority Selector */}
              <Text style={[styles.label, { color: colors.text }]}>Priority</Text>
              <View style={styles.radioGroup}>
                {priorities.map(priority => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.radioOption,
                      formData.priority === priority && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => setFormData({ ...formData, priority })}
                  >
                    <Text style={{ color: formData.priority === priority ? 'white' : colors.text }}>
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Notes Field */}
              <Text style={[styles.label, { color: colors.text }]}>Notes</Text>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
                numberOfLines={3}
              />

              {/* Primary Contact Toggle */}
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setFormData({ ...formData, isPrimary: !formData.isPrimary })}
              >
                <View style={[
                  styles.checkboxBox,
                  { borderColor: colors.border, backgroundColor: formData.isPrimary ? colors.primary : 'transparent' }
                ]}>
                  {formData.isPrimary && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                  Set as primary emergency contact
                </Text>
              </TouchableOpacity>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <AccessibleButton
                  title="Cancel"
                  onPress={() => setShowEditModal(false)}
                  variant="outline"
                  style={{ flex: 1, marginRight: 10 }}
                />
                <AccessibleButton
                  title={editingContact ? 'Update' : 'Add'}
                  onPress={handleSave}
                  variant="primary"
                  style={{ flex: 1 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Import/Export Buttons */}
      <View style={styles.actionButtons}>
        <AccessibleButton
          title="Import"
          onPress={handleImport}
          variant="outline"
          style={{ flex: 1, marginRight: 8 }}
        />
        <AccessibleButton
          title="Export"
          onPress={handleExport}
          variant="outline"
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
};

// Contact Card Component
const ContactCard = ({ contact, onEdit, onDelete, getGroupIcon, getPriorityColor, colors }) => (
  <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardIcon}>{getGroupIcon(contact.group)}</Text>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardName, { color: colors.text }]}>
          {contact.name}
          {contact.isPrimary && <Text style={styles.primaryBadge}> PRIMARY</Text>}
        </Text>
        <Text style={[styles.cardPhone, { color: colors.textSecondary }]}>{contact.phoneNumber}</Text>
        <Text style={[styles.cardRelationship, { color: colors.textSecondary }]}>{contact.relationship}</Text>
      </View>
      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(contact.priority) }]}>
        <Text style={styles.priorityText}>
          {contact.priority && typeof contact.priority === 'string' ? contact.priority.toUpperCase() : 'MEDIUM'}
        </Text>
      </View>
    </View>
    <View style={styles.cardActions}>
      <AccessibleButton
        title="Edit"
        onPress={() => onEdit(contact)}
        variant="outline"
        size="small"
        style={{ flex: 1, marginRight: 8 }}
      />
      <AccessibleButton
        title="Delete"
        onPress={() => onDelete(contact.id)}
        variant="error"
        size="small"
        style={{ flex: 1 }}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  filterScroll: {
    maxHeight: 40,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contactsList: {
    flex: 1,
    padding: 12,
  },
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  primaryBadge: {
    fontSize: 11,
    color: '#f44336',
    fontWeight: 'bold',
  },
  cardPhone: {
    fontSize: 14,
    marginBottom: 2,
  },
  cardRelationship: {
    fontSize: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 90,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabText: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  radioOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f8f8f8',
  },
});

export default ContactManager;
