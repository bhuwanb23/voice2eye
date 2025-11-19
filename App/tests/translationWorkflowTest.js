/**
 * Translation Workflow Test
 * Tests the enhanced translation workflow with dedicated buttons for each step
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import TranslationModal from '../components/TranslationModal';

const TranslationWorkflowTest = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const testTranslationWorkflow = () => {
    console.log('Testing Enhanced Translation Workflow...');
    setModalVisible(true);
  };

  const handleModalClose = () => {
    console.log('Closing Translation Workflow Test...');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Translation Workflow Test</Text>
      
      <Text style={styles.description}>
        This test verifies the enhanced translation workflow with dedicated buttons for each step:
        {'\n\n'}1. Start Listening (speech to text)
        {'\n'}2. Translate Text
        {'\n'}3. Play Audio
        {'\n'}4. Manual text input option
      </Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={testTranslationWorkflow}
      >
        <Text style={styles.buttonText}>Test Translation Workflow</Text>
      </TouchableOpacity>
      
      <Text style={styles.instructions}>
        Instructions:
        {'\n'}1. Tap "Test Translation Workflow"
        {'\n'}2. Try the speech-to-text workflow
        {'\n'}3. Try the manual text input workflow
        {'\n'}4. Verify all buttons work correctly
      </Text>
      
      <Text style={styles.note}>
        Note: The interface should now have clear workflow steps with dedicated buttons for each action.
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

export default TranslationWorkflowTest;