/**
 * Contact Form Component
 * Form for adding and editing emergency contacts
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccessibility } from './AccessibilityProvider';
import AccessibleButton from './AccessibleButton';
import * as Speech from 'expo-speech';

const ContactForm = ({ navigation, route }) => {
  const { settings, getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  
  const { mode, contact } = route.params || { mode: 'add' };
  
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    relationship: '',
    priority: 'medium',
    group: 'family',
    isPrimary: false,
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && contact) {
      setFormData({
        name: contact.name || '',
        phoneNumber: contact.phoneNumber || '',
        relationship: contact.relationship || '',
        priority: contact.priority || 'medium',
        group: contact.group || 'family',
        isPrimary: contact.isPrimary || false,
      });
    }
    
    if (settings.voiceNavigation) {
      const message = mode === 'edit' 
        ? `Editing contact ${contact?.name || ''}`
        : 'Adding new emergency contact';
      Speech.speak(message, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
      });
    }
  }, [mode, contact]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!isValidPhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    if (!formData.relationship.trim()) {
      newErrors.relationship = 'Relationship is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidPhoneNumber = (phoneNumber) => {
    // Simple phone number validation (can be enhanced)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const formattedPhoneRegex = /^(\+1\s?)?(\([0-9]{3}\)|[0-9]{3})[\s\-]?[0-9]{3}[\s\-]?[0-9]{4}$/;
    return phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, '')) || 
           formattedPhoneRegex.test(phoneNumber);
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      if (settings.voiceNavigation) {
        Speech.speak('Please correct the errors in the form', {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
      }
      return;
    }
    
    setIsSubmitting(true);
    
    // In Phase 2, this will connect to the backend API
    // For now, we'll simulate the save operation
    setTimeout(() => {
      setIsSubmitting(false);
      
      if (settings.voiceNavigation) {
        const message = mode === 'edit' 
          ? 'Contact updated successfully'
          : 'Contact added successfully';
        Speech.speak(message, {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
      }
      
      // Go back to contacts screen
      navigation.goBack();
    }, 1000);
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel',
      'Are you sure you want to cancel? Your changes will be lost.',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const priorityOptions = [
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
  ];

  const groupOptions = [
    { value: 'family', label: 'Family & Household' },
    { value: 'medical', label: 'Medical Contacts' },
    { value: 'friends', label: 'Friends & Neighbors' },
    { value: 'emergency', label: 'Emergency Services' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={[styles.title, { color: 'white' }]}>
          {mode === 'edit' ? 'Edit Contact' : 'Add Contact'}
        </Text>
        <Text style={[styles.subtitle, { color: 'white' }]}>
          {mode === 'edit' ? 'Update emergency contact information' : 'Add a new emergency contact'}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Name Field */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Full Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: errors.name ? '#f44336' : colors.border,
                }
              ]}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter full name"
              placeholderTextColor={colors.textSecondary}
              accessibilityLabel="Contact full name"
              accessibilityHint="Enter the full name of the contact"
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}
          </View>

          {/* Phone Number Field */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Phone Number *
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: errors.phoneNumber ? '#f44336' : colors.border,
                }
              ]}
              value={formData.phoneNumber}
              onChangeText={(value) => handleInputChange('phoneNumber', value)}
              placeholder="Enter phone number"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
              accessibilityLabel="Contact phone number"
              accessibilityHint="Enter the phone number of the contact"
            />
            {errors.phoneNumber && (
              <Text style={styles.errorText}>{errors.phoneNumber}</Text>
            )}
          </View>

          {/* Relationship Field */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Relationship *
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: errors.relationship ? '#f44336' : colors.border,
                }
              ]}
              value={formData.relationship}
              onChangeText={(value) => handleInputChange('relationship', value)}
              placeholder="Enter relationship (e.g., Spouse, Doctor)"
              placeholderTextColor={colors.textSecondary}
              accessibilityLabel="Contact relationship"
              accessibilityHint="Enter your relationship to this contact"
            />
            {errors.relationship && (
              <Text style={styles.errorText}>{errors.relationship}</Text>
            )}
          </View>

          {/* Priority Selection */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Priority Level
            </Text>
            <View style={styles.radioGroup}>
              {priorityOptions.map((option) => (
                <AccessibleButton
                  key={option.value}
                  title={option.label}
                  onPress={() => handleInputChange('priority', option.value)}
                  variant={formData.priority === option.value ? 'primary' : 'outline'}
                  size="medium"
                  accessibilityLabel={`Set priority to ${option.label}`}
                  style={styles.radioButton}
                />
              ))}
            </View>
          </View>

          {/* Group Selection */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Contact Group
            </Text>
            <View style={styles.radioGroup}>
              {groupOptions.map((option) => (
                <AccessibleButton
                  key={option.value}
                  title={option.label}
                  onPress={() => handleInputChange('group', option.value)}
                  variant={formData.group === option.value ? 'primary' : 'outline'}
                  size="medium"
                  accessibilityLabel={`Set group to ${option.label}`}
                  style={styles.radioButton}
                />
              ))}
            </View>
          </View>

          {/* Primary Contact Toggle */}
          <View style={styles.formGroup}>
            <AccessibleButton
              title={formData.isPrimary ? "✓ Primary Emergency Contact" : "Set as Primary Emergency Contact"}
              onPress={() => handleInputChange('isPrimary', !formData.isPrimary)}
              variant={formData.isPrimary ? 'success' : 'outline'}
              size="large"
              accessibilityLabel={formData.isPrimary ? "This is your primary emergency contact" : "Set as primary emergency contact"}
              style={styles.primaryToggle}
            />
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={[styles.buttonContainer, { backgroundColor: colors.surface }]}>
          <AccessibleButton
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            size="large"
            disabled={isSubmitting}
            accessibilityLabel="Cancel and return to contacts list"
            style={styles.button}
          />
          <AccessibleButton
            title={isSubmitting ? "Saving..." : (mode === 'edit' ? "Update Contact" : "Add Contact")}
            onPress={handleSubmit}
            variant="primary"
            size="large"
            disabled={isSubmitting}
            accessibilityLabel={isSubmitting ? "Saving contact" : (mode === 'edit' ? "Update contact information" : "Add new contact")}
            style={styles.button}
          />
        </View>
      </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    marginTop: 4,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioButton: {
    margin: 4,
  },
  primaryToggle: {
    marginVertical: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

export default ContactForm;