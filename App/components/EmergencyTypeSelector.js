/**
 * Emergency Type Selector Component
 * Allows users to select the type of emergency for more specific alerts
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAccessibility } from '../components/AccessibilityProvider';
import AccessibleButton from '../components/AccessibleButton';

const EmergencyTypeSelector = ({ selectedType, onTypeChange }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  const emergencyTypes = [
    { 
      id: 'medical', 
      name: 'Medical Emergency', 
      icon: '🏥',
      description: 'For health-related emergencies requiring medical attention',
      color: colors.error
    },
    { 
      id: 'security', 
      name: 'Security Emergency', 
      icon: '👮',
      description: 'For situations requiring police or security assistance',
      color: colors.warning
    },
    { 
      id: 'general', 
      name: 'General Emergency', 
      icon: '🚨',
      description: 'For other urgent situations not covered above',
      color: colors.primary
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Emergency Type</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Select the type of emergency to help responders prepare appropriately
      </Text>
      
      <View style={styles.typesContainer}>
        {emergencyTypes.map((type) => (
          <AccessibleButton
            key={type.id}
            title={`${type.icon} ${type.name}`}
            onPress={() => onTypeChange(type.id)}
            variant={selectedType === type.id ? 'primary' : 'outline'}
            size="medium"
            accessibilityLabel={`${type.name}. ${type.description}`}
            style={[
              styles.typeButton,
              selectedType === type.id && { backgroundColor: type.color }
            ]}
            textStyle={[
              styles.typeButtonText,
              selectedType === type.id && { color: 'white' }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    marginBottom: 10,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeButton: {
    width: '100%',
    marginBottom: 8,
    paddingVertical: 10,
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default EmergencyTypeSelector;