/**
 * Translation Components Fix Test
 * Tests that the TranslationFloatingButton and TranslationModal components work correctly
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import TranslationModal from '../components/TranslationModal';
import TranslationFloatingButton from '../components/TranslationFloatingButton';

const TranslationComponentsFixTest = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const testTranslationComponents = () => {
    console.log('Testing Translation Components...');
    setModalVisible(true);
  };

  const handleModalClose = () => {
    console.log('Closing Translation Components Test...');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Translation Components Fix Test</Text>
      
      <Text style={styles.description}>
        This test verifies that the TranslationFloatingButton and TranslationModal components work correctly.
      </Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={testTranslationComponents}
      >
        <Text style={styles.buttonText}>Test Translation Components</Text>
      </TouchableOpacity>
      
      <Text style={styles.instructions}>
        Instructions:
        {'\n'}1. Tap "Test Translation Components"
        {'\n'}2. Verify the floating button appears at the bottom right
        {'\n'}3. Tap the floating button to open the modal
        {'\n'}4. Verify all components render without errors
      </Text>
      
      <Text style={styles.note}>
        Note: Both components should now work without the previous errors.
      </Text>
      
      <TranslationFloatingButton onPress={testTranslationComponents} />
      
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

export default TranslationComponentsFixTest;