/**
 * Beautiful Modern Emergency Contact Card Component
 * Enhanced with gradients, shadows, and modern design
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Animated } from 'react-native';
import { useAccessibility } from './AccessibilityProvider';
import AccessibleButton from './AccessibleButton';

const EmergencyContactCard = ({
  contact,
  onEdit,
  onDelete,
  onCall,
  style,
}) => {
  const { getThemeColors, getAccessibilityProps } = useAccessibility();
  const colors = getThemeColors();
  const accessibilityProps = getAccessibilityProps();

  const handleCall = () => {
    if (onCall) {
      onCall(contact);
    } else {
      // Default behavior - open phone dialer
      Linking.openURL(`tel:${contact.phone}`);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(contact);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(contact);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1:
        return '#f44336'; // High priority - red
      case 2:
        return '#FF9800'; // Medium priority - orange
      case 3:
        return '#4CAF50'; // Low priority - green
      default:
        return '#9E9E9E';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 1:
        return 'High Priority';
      case 2:
        return 'Medium Priority';
      case 3:
        return 'Low Priority';
      default:
        return 'Normal Priority';
    }
  };

  const getPriorityGradient = (priority) => {
    switch (priority) {
      case 1:
        return ['#ff6b6b', '#ee5a24'];
      case 2:
        return ['#fa709a', '#fee140'];
      case 3:
        return ['#43e97b', '#38f9d7'];
      default:
        return ['#9E9E9E', '#757575'];
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: 'white',
          shadowColor: '#000',
        },
        contact.enabled ? styles.enabled : styles.disabled,
        style,
      ]}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`Emergency contact: ${contact.name}, ${contact.phone}, ${getPriorityText(contact.priority)}`}
    >
      {/* Header with gradient background */}
      <View style={[styles.header, { backgroundColor: getPriorityColor(contact.priority) }]}>
        <View style={styles.nameContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {contact.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.nameInfo}>
            <Text style={styles.name}>{contact.name}</Text>
            <View style={styles.priorityContainer}>
              <View style={[styles.priorityBadge, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                <Text style={styles.priorityText}>
                  {contact.priority}
                </Text>
              </View>
              <Text style={styles.priorityLabel}>
                {getPriorityText(contact.priority)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>📞</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={[styles.infoValue, !contact.enabled && styles.disabledText]}>
              {contact.phone}
            </Text>
          </View>
        </View>
        
        {contact.relationship && (
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>👤</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Relationship</Text>
              <Text style={[styles.infoValue, !contact.enabled && styles.disabledText]}>
                {contact.relationship}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Status Indicator */}
      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: contact.enabled ? '#4CAF50' : '#f44336',
              },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: contact.enabled ? '#4CAF50' : '#f44336' },
            ]}
          >
            {contact.enabled ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <AccessibleButton
          title="Call"
          onPress={handleCall}
          variant="primary"
          size="small"
          disabled={!contact.enabled}
          accessibilityLabel={`Call ${contact.name} at ${contact.phone}`}
          accessibilityHint="Opens phone dialer to call this emergency contact"
          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
        />
        
        <AccessibleButton
          title="Edit"
          onPress={handleEdit}
          variant="outline"
          size="small"
          accessibilityLabel={`Edit contact ${contact.name}`}
          accessibilityHint="Opens edit form for this contact"
          style={[styles.actionButton, { borderColor: '#2196F3' }]}
        />
        
        <AccessibleButton
          title="Delete"
          onPress={handleDelete}
          variant="error"
          size="small"
          accessibilityLabel={`Delete contact ${contact.name}`}
          accessibilityHint="Removes this contact from emergency list"
          style={[styles.actionButton, { backgroundColor: '#f44336' }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginVertical: 12,
    marginHorizontal: 20,
    overflow: 'hidden',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  enabled: {
    opacity: 1,
  },
  disabled: {
    opacity: 0.6,
  },
  header: {
    padding: 20,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  nameInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  priorityText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  priorityLabel: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  infoContainer: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoIconText: {
    fontSize: 18,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  statusContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 0,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  disabledText: {
    opacity: 0.5,
  },
});

export default EmergencyContactCard;