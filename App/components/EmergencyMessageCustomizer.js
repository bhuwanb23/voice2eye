/**
 * Emergency Message Customizer Component
 * Allows users to customize the emergency message content
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useAccessibility } from '../components/AccessibilityProvider';
import AccessibleButton from '../components/AccessibleButton';

const EmergencyMessageCustomizer = ({ 
  defaultMessage = "HELP! I need immediate assistance. My location is: {{location}}. Time: {{time}}", 
  onMessageChange 
}) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  
  const [customMessage, setCustomMessage] = useState(defaultMessage);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onMessageChange(customMessage);
    setIsEditing(false);
  };

  const handleReset = () => {
    setCustomMessage(defaultMessage);
    onMessageChange(defaultMessage);
    setIsEditing(false);
  };

  const insertPlaceholder = (placeholder) => {
    const newMessage = customMessage + ` {{${placeholder}}}`;
    setCustomMessage(newMessage);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Emergency Message</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Customize your emergency alert
        </Text>
      </View>
      
      {isEditing ? (
        <View style={styles.editingContainer}>
          <TextInput
            style={[styles.textInput, { 
              color: colors.text,
              backgroundColor: colors.background,
              borderColor: colors.border,
            }]}
            value={customMessage}
            onChangeText={setCustomMessage}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            accessibilityLabel="Custom emergency message"
            accessibilityHint="Enter your custom emergency message"
          />
          
          <Text style={[styles.placeholderTitle, { color: colors.text }]}>
            Insert Placeholders:
          </Text>
          <View style={styles.placeholderContainer}>
            <AccessibleButton
              title="Location"
              onPress={() => insertPlaceholder('location')}
              variant="outline"
              size="small"
              accessibilityLabel="Insert location placeholder"
              style={styles.placeholderButton}
            />
            <AccessibleButton
              title="Time"
              onPress={() => insertPlaceholder('time')}
              variant="outline"
              size="small"
              accessibilityLabel="Insert time placeholder"
              style={styles.placeholderButton}
            />
            <AccessibleButton
              title="Date"
              onPress={() => insertPlaceholder('date')}
              variant="outline"
              size="small"
              accessibilityLabel="Insert date placeholder"
              style={styles.placeholderButton}
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <AccessibleButton
              title="Cancel"
              onPress={() => {
                setCustomMessage(defaultMessage);
                setIsEditing(false);
              }}
              variant="outline"
              size="medium"
              accessibilityLabel="Cancel message editing"
              style={styles.actionButton}
            />
            <AccessibleButton
              title="Reset"
              onPress={handleReset}
              variant="warning"
              size="medium"
              accessibilityLabel="Reset to default message"
              style={styles.actionButton}
            />
            <AccessibleButton
              title="Save"
              onPress={handleSave}
              variant="primary"
              size="medium"
              accessibilityLabel="Save custom message"
              style={styles.actionButton}
            />
          </View>
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <View style={[styles.messagePreview, { backgroundColor: colors.background }]}>
            <Text style={[styles.messageText, { color: colors.text }]} numberOfLines={6}>
              {customMessage}
            </Text>
          </View>
          
          <AccessibleButton
            title="Customize Message"
            onPress={() => setIsEditing(true)}
            variant="outline"
            size="medium"
            accessibilityLabel="Customize emergency message"
            style={styles.customizeButton}
          />
          
          <Text style={[styles.note, { color: colors.textSecondary }]}>
            Note: Placeholders will be automatically replaced with actual information when the emergency is triggered.
          </Text>
        </View>
      )}
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
  editingContainer: {
    
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    marginBottom: 12,
    minHeight: 80,
  },
  placeholderTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  placeholderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  placeholderButton: {
    minWidth: 70,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  previewContainer: {
    
  },
  messagePreview: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    minHeight: 80,
  },
  messageText: {
    fontSize: 12,
    lineHeight: 16,
  },
  customizeButton: {
    marginBottom: 10,
  },
  note: {
    fontSize: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default EmergencyMessageCustomizer;