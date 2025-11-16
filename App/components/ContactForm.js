/**
 * Contact Form Component - Beautiful Modern Design
 * Elegant form for adding and editing emergency contacts
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    
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
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
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
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>
                {mode === 'edit' ? '✏️ Edit Contact' : '➕ Add Contact'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {mode === 'edit' ? 'Update contact information' : 'Create new emergency contact'}
              </Text>
            </View>
          </Animated.View>
        </LinearGradient>

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
            <Animated.View 
              style={[
                styles.formSection,
                { backgroundColor: colors.surface },
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  👤 Full Name *
                </Text>
                <View style={[
                  styles.inputContainer,
                  { borderColor: errors.name ? colors.error : colors.border }
                ]}>
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                    placeholder="Enter full name"
                    placeholderTextColor={colors.textSecondary}
                    accessibilityLabel="Contact full name"
                    accessibilityHint="Enter the full name of the contact"
                  />
                </View>
                {errors.name && (
                  <Text style={[styles.errorText, { color: colors.error }]}>{errors.name}</Text>
                )}
              </View>
            </Animated.View>

            {/* Phone Number Field */}
            <Animated.View 
              style={[
                styles.formSection,
                { backgroundColor: colors.surface },
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  📞 Phone Number *
                </Text>
                <View style={[
                  styles.inputContainer,
                  { borderColor: errors.phoneNumber ? colors.error : colors.border }
                ]}>
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    value={formData.phoneNumber}
                    onChangeText={(value) => handleInputChange('phoneNumber', value)}
                    placeholder="Enter phone number"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="phone-pad"
                    accessibilityLabel="Contact phone number"
                    accessibilityHint="Enter the phone number of the contact"
                  />
                </View>
                {errors.phoneNumber && (
                  <Text style={[styles.errorText, { color: colors.error }]}>{errors.phoneNumber}</Text>
                )}
              </View>
            </Animated.View>

            {/* Relationship Field */}
            <Animated.View 
              style={[
                styles.formSection,
                { backgroundColor: colors.surface },
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  🤝 Relationship *
                </Text>
                <View style={[
                  styles.inputContainer,
                  { borderColor: errors.relationship ? colors.error : colors.border }
                ]}>
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    value={formData.relationship}
                    onChangeText={(value) => handleInputChange('relationship', value)}
                    placeholder="e.g., Spouse, Doctor, Friend"
                    placeholderTextColor={colors.textSecondary}
                    accessibilityLabel="Contact relationship"
                    accessibilityHint="Enter your relationship to this contact"
                  />
                </View>
                {errors.relationship && (
                  <Text style={[styles.errorText, { color: colors.error }]}>{errors.relationship}</Text>
                )}
              </View>
            </Animated.View>

            {/* Priority Selection */}
            <Animated.View 
              style={[
                styles.formSection,
                { backgroundColor: colors.surface },
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  ⚡ Priority Level
                </Text>
                <View style={styles.selectionGrid}>
                  {priorityOptions.map((option) => {
                    const isSelected = formData.priority === option.value;
                    const priorityColors = {
                      high: colors.error,
                      medium: colors.warning,
                      low: colors.success
                    };
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.selectionCard,
                          {
                            backgroundColor: isSelected ? priorityColors[option.value] + '20' : colors.background,
                            borderColor: isSelected ? priorityColors[option.value] : colors.border
                          }
                        ]}
                        onPress={() => handleInputChange('priority', option.value)}
                      >
                        <Text style={[
                          styles.selectionText,
                          { color: isSelected ? priorityColors[option.value] : colors.text }
                        ]}>
                          {option.label}
                        </Text>
                        {isSelected && (
                          <Text style={[styles.selectionCheck, { color: priorityColors[option.value] }]}>✓</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </Animated.View>

            {/* Group Selection */}
            <Animated.View 
              style={[
                styles.formSection,
                { backgroundColor: colors.surface },
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  👥 Contact Group
                </Text>
                <View style={styles.selectionGrid}>
                  {groupOptions.map((option) => {
                    const isSelected = formData.group === option.value;
                    const groupIcons = {
                      family: '👨‍👩‍👧‍👦',
                      medical: '🏥',
                      friends: '👥',
                      emergency: '🚨'
                    };
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.selectionCard,
                          {
                            backgroundColor: isSelected ? colors.primary + '20' : colors.background,
                            borderColor: isSelected ? colors.primary : colors.border
                          }
                        ]}
                        onPress={() => handleInputChange('group', option.value)}
                      >
                        <Text style={styles.selectionIcon}>{groupIcons[option.value]}</Text>
                        <Text style={[
                          styles.selectionText,
                          { color: isSelected ? colors.primary : colors.text }
                        ]}>
                          {option.label}
                        </Text>
                        {isSelected && (
                          <Text style={[styles.selectionCheck, { color: colors.primary }]}>✓</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </Animated.View>

            {/* Primary Contact Toggle */}
            <Animated.View 
              style={[
                styles.formSection,
                { backgroundColor: colors.surface },
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.primaryToggle,
                  {
                    backgroundColor: formData.isPrimary ? colors.success + '20' : colors.background,
                    borderColor: formData.isPrimary ? colors.success : colors.border
                  }
                ]}
                onPress={() => handleInputChange('isPrimary', !formData.isPrimary)}
              >
                <View style={styles.toggleContent}>
                  <Text style={styles.toggleIcon}>⭐</Text>
                  <View style={styles.toggleText}>
                    <Text style={[styles.toggleTitle, { color: formData.isPrimary ? colors.success : colors.text }]}>
                      Primary Emergency Contact
                    </Text>
                    <Text style={[styles.toggleSubtitle, { color: colors.textSecondary }]}>
                      {formData.isPrimary ? 'This contact will be called first' : 'Tap to set as primary contact'}
                    </Text>
                  </View>
                  <View style={[
                    styles.toggleSwitch,
                    { backgroundColor: formData.isPrimary ? colors.success : colors.border }
                  ]}>
                    <View style={[
                      styles.toggleKnob,
                      {
                        backgroundColor: 'white',
                        transform: [{ translateX: formData.isPrimary ? 16 : 2 }]
                      }
                    ]} />
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>

          {/* Action Buttons */}
          <Animated.View 
            style={[
              styles.actionContainer,
              { backgroundColor: colors.surface },
              { opacity: fadeAnim }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.cancelButton,
                { backgroundColor: colors.background, borderColor: colors.border }
              ]}
              onPress={handleCancel}
              disabled={isSubmitting}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.submitButton,
                { opacity: isSubmitting ? 0.7 : 1 }
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={[colors.primary, colors.primary + 'E6']}
                style={styles.submitGradient}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? " Saving..." : (mode === 'edit' ? " Update Contact" : " Add Contact")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backIcon: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
  },
  // Form Styles
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  formSection: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldContainer: {
    width: '100%',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1.5,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  textInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 40,
  },
  errorText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  // Selection Styles
  selectionGrid: {
    gap: 8,
  },
  selectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    marginBottom: 6,
  },
  selectionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  selectionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  selectionCheck: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Toggle Styles
  primaryToggle: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontSize: 11,
  },
  toggleSwitch: {
    width: 36,
    height: 20,
    borderRadius: 10,
    padding: 2,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  // Action Button Styles
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButton: {
    borderWidth: 1.5,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  submitButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  submitGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ContactForm;