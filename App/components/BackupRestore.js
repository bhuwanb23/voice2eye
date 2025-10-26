/**
 * Backup & Restore Component
 * Manage backup and restore functionality for user settings
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useAccessibility } from '../components/AccessibilityProvider';
import AccessibleButton from '../components/AccessibleButton';

const BackupRestore = ({ settings, onSettingChange }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleBackup = () => {
    setIsBackingUp(true);
    // Simulate backup process
    setTimeout(() => {
      setIsBackingUp(false);
      Alert.alert(
        'Backup Complete',
        'Your settings have been successfully backed up.',
        [{ text: 'OK' }]
      );
    }, 2000);
  };

  const handleRestore = () => {
    Alert.alert(
      'Restore Backup',
      'This will replace your current settings with the backup. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: () => {
            setIsRestoring(true);
            // Simulate restore process
            setTimeout(() => {
              setIsRestoring(false);
              Alert.alert(
                'Restore Complete',
                'Your settings have been successfully restored.',
                [{ text: 'OK' }]
              );
            }, 2000);
          },
        },
      ]
    );
  };

  const handleExport = () => {
    Alert.alert(
      'Export Settings',
      'Export your settings to a file for safekeeping.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            // Simulate export process
            Alert.alert(
              'Export Complete',
              'Your settings have been exported to a file.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const handleImport = () => {
    Alert.alert(
      'Import Settings',
      'Import settings from a file. This will replace your current settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: () => {
            // Simulate import process
            Alert.alert(
              'Import Complete',
              'Settings have been successfully imported.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Backup & Restore</Text>
      
      <View style={styles.description}>
        <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
          Protect your settings by creating backups. You can restore your settings at any time.
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <AccessibleButton
          title={isBackingUp ? "Backing Up..." : "Create Backup"}
          onPress={handleBackup}
          variant="primary"
          size="large"
          disabled={isBackingUp}
          accessibilityLabel="Create backup of current settings"
          style={styles.mainButton}
        />
        
        <AccessibleButton
          title={isRestoring ? "Restoring..." : "Restore Backup"}
          onPress={handleRestore}
          variant="warning"
          size="large"
          disabled={isRestoring}
          accessibilityLabel="Restore settings from backup"
          style={styles.mainButton}
        />
      </View>
      
      <View style={styles.subButtonContainer}>
        <AccessibleButton
          title="Export Settings"
          onPress={handleExport}
          variant="outline"
          size="medium"
          accessibilityLabel="Export settings to file"
          style={styles.subButton}
        />
        
        <AccessibleButton
          title="Import Settings"
          onPress={handleImport}
          variant="outline"
          size="medium"
          accessibilityLabel="Import settings from file"
          style={styles.subButton}
        />
      </View>
      
      <View style={styles.infoSection}>
        <Text style={[styles.infoTitle, { color: colors.text }]}>Backup Information</Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Last backup: Today at 14:30
        </Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Backup location: Internal storage
        </Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Backup size: 2.4 MB
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  mainButton: {
    marginBottom: 12,
    minHeight: 50,
  },
  subButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  subButton: {
    flex: 1,
    marginHorizontal: 8,
    minWidth: 100,
  },
  infoSection: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
});

export default BackupRestore;