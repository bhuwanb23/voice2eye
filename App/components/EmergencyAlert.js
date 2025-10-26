/**
 * Emergency Alert Component
 * Emergency notifications with customization, history, escalation, and false alarm prevention
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { useAccessibility } from './AccessibilityProvider';
import AccessibleButton from './AccessibleButton';

const EmergencyAlert = ({
  onTriggerAlert,
  onCancel,
  contacts = [],
  customizationEnabled = true,
}) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  
  const [countdown, setCountdown] = useState(5);
  const [isCounting, setIsCounting] = useState(false);
  const [selectedType, setSelectedType] = useState('medical');
  const [customMessage, setCustomMessage] = useState('');
  const [includeLocation, setIncludeLocation] = useState(true);
  const [escalationEnabled, setEscalationEnabled] = useState(true);
  const [alertHistory, setAlertHistory] = useState([]);

  const alertTypes = [
    { id: 'medical', label: 'Medical Emergency', icon: '🏥', color: '#f44336' },
    { id: 'security', label: 'Security Threat', icon: '🛡️', color: '#ff9800' },
    { id: 'general', label: 'General Emergency', icon: '🚨', color: '#2196f3' },
  ];

  const [preventionSettings, setPreventionSettings] = useState({
    requireConfirmation: true,
    confirmationDelay: 5,
    allowVoiceCancel: true,
    requireGestureConfirm: false,
  });

  const startCountdown = () => {
    setIsCounting(true);
    setCountdown(5);
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          triggerAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelCountdown = () => {
    setIsCounting(false);
    setCountdown(5);
    if (onCancel) {
      onCancel();
    }
  };

  const triggerAlert = () => {
    const alert = {
      id: Date.now().toString(),
      type: selectedType,
      message: customMessage || getDefaultMessage(selectedType),
      timestamp: new Date().toISOString(),
      locationIncluded: includeLocation,
      contacts: contacts,
      status: 'sent',
    };

    setAlertHistory(prev => [alert, ...prev]);
    
    if (onTriggerAlert) {
      onTriggerAlert(alert);
    }

    if (escalationEnabled) {
      scheduleEscalation(alert);
    }
  };

  const getDefaultMessage = (type) => {
    const messages = {
      medical: 'Medical emergency - immediate assistance required',
      security: 'Security threat - help needed immediately',
      general: 'Emergency situation - assistance required',
    };
    return messages[type] || 'Emergency - assistance required';
  };

  const scheduleEscalation = (alert) => {
    // In a real implementation, this would set up escalation timers
    setTimeout(() => {
      Alert.alert('Escalation', 'Alert has been escalated to emergency services');
    }, 60000); // After 1 minute
  };

  const preventFalseAlarm = () => {
    if (preventionSettings.requireConfirmation && !isCounting) {
      startCountdown();
      return;
    }
    
    if (isCounting && countdown > 0) {
      cancelCountdown();
      return;
    }
  };

  return (
    <View style={styles.container}>
      {/* Alert History */}
      {alertHistory.length > 0 && (
        <View style={[styles.historyContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.historyTitle, { color: colors.text }]}>Recent Alerts</Text>
          <ScrollView style={styles.historyList}>
            {alertHistory.slice(0, 5).map(alert => (
              <View key={alert.id} style={[styles.historyItem, { borderBottomColor: colors.border }]}>
                <Text style={[styles.historyTime, { color: colors.textSecondary }]}>
                  {new Date(alert.timestamp).toLocaleString()}
                </Text>
                <Text style={[styles.historyMessage, { color: colors.text }]}>
                  {alert.message}
                </Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: alert.status === 'sent' ? colors.success : colors.warning }
                ]}>
                  <Text style={styles.statusText}>{alert.status}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Countdown Alert */}
      {isCounting && (
        <View style={styles.countdownOverlay}>
          <View style={[styles.countdownCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.countdownTitle, { color: colors.error }]}>
              Alert will trigger in
            </Text>
            <Text style={[styles.countdownNumber, { color: colors.error }]}>
              {countdown}
            </Text>
            <Text style={[styles.countdownSubtext, { color: colors.textSecondary }]}>
              Tap to cancel
            </Text>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.error }]}
              onPress={cancelCountdown}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Alert Configuration */}
      {!isCounting && (
        <View style={[styles.configContainer, { backgroundColor: colors.surface }]}>
          {/* Alert Type Selector */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Alert Type</Text>
          <View style={styles.typeSelector}>
            {alertTypes.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  selectedType === type.id && { backgroundColor: `${type.color}20`, borderColor: type.color },
                  { borderColor: colors.border }
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[styles.typeLabel, { color: colors.text }]}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Message */}
          {customizationEnabled && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Custom Message</Text>
              <TextInput
                style={[styles.textInput, {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Enter custom message..."
                placeholderTextColor={colors.textSecondary}
                value={customMessage}
                onChangeText={setCustomMessage}
                multiline
                numberOfLines={3}
              />
            </>
          )}

          {/* Settings */}
          <View style={styles.settingsRow}>
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Include Location
              </Text>
              <Switch
                value={includeLocation}
                onValueChange={setIncludeLocation}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Enable Escalation
              </Text>
              <Switch
                value={escalationEnabled}
                onValueChange={setEscalationEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </View>

          {/* Trigger Button */}
          <TouchableOpacity
            style={[styles.triggerButton, { backgroundColor: colors.error }]}
            onPress={preventFalseAlarm}
          >
            <Text style={styles.triggerButtonText}>🚨 TRIGGER EMERGENCY ALERT 🚨</Text>
          </TouchableOpacity>

          {/* Contacts List */}
          {contacts.length > 0 && (
            <View style={styles.contactsPreview}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Will Contact ({contacts.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {contacts.map((contact, index) => (
                  <View key={index} style={[styles.contactBadge, { backgroundColor: colors.background }]}>
                    <Text style={[styles.contactName, { color: colors.text }]}>{contact.name}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  historyContainer: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    maxHeight: 200,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  historyList: {
    maxHeight: 150,
  },
  historyItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  historyTime: {
    fontSize: 11,
    marginBottom: 4,
  },
  historyMessage: {
    fontSize: 12,
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  countdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 280,
  },
  countdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  countdownNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  countdownSubtext: {
    fontSize: 14,
    marginBottom: 24,
  },
  cancelButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  configContainer: {
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  settingsRow: {
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 14,
  },
  triggerButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  triggerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactsPreview: {
    marginTop: 8,
  },
  contactBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  contactName: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default EmergencyAlert;
