/**
 * Voice Recognition Fix Test
 * Tests that the voice recognition cleanup issues are resolved
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import TranslationModal from '../components/TranslationModal';

const VoiceRecognitionFixTest = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const testTranslationModal = () => {
    console.log('Testing Translation Modal...');
    setModalVisible(true);
  };

  const handleModalClose = () => {
    console.log('Closing Translation Modal...');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Recognition Fix Test</Text>
      
      <Text style={styles.description}>
        This test verifies that the voice recognition cleanup issues have been resolved.
      </Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={testTranslationModal}
      >
        <Text style={styles.buttonText}>Open Translation Modal</Text>
      </TouchableOpacity>
      
      <Text style={styles.instructions}>
        Instructions:
        {'\n'}1. Tap "Open Translation Modal"
        {'\n'}2. Close the modal without using voice recognition
        {'\n'}3. Reopen and close several times
        {'\n'}4. Check console for cleanup errors
      </Text>
      
      <Text style={styles.note}>
        Note: No errors should appear in the console when opening and closing the modal.
      </Text>
      
      <TranslationModal 
        visible={modalVisible} 
        onClose={handleModalClose} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructions: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
    lineHeight: 20,
  },
  note: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default VoiceRecognitionFixTest;