/**
 * Translation Button Position Test
 * Verifies that the translation button is positioned at bottom right
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import TranslationFloatingButton from '../components/TranslationFloatingButton';

const { width, height } = Dimensions.get('window');

const TranslationButtonPositionTest = () => {
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });

  // Simulate the button position calculation
  useEffect(() => {
    // Calculate expected position (bottom right)
    const expectedX = width - 68; // 48px button width + 20px right margin
    const expectedY = height - 68; // 48px button height + 20px bottom margin
    
    setButtonPosition({
      x: expectedX,
      y: expectedY
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Translation Button Position Test</Text>
      
      <View style={styles.content}>
        <Text style={styles.description}>
          This screen tests that the translation button is positioned at the bottom right corner.
        </Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Screen Dimensions: {width.toFixed(0)} × {height.toFixed(0)} pixels
          </Text>
          <Text style={styles.infoText}>
            Expected Button Position: Bottom Right
          </Text>
          <Text style={styles.infoText}>
            Calculated Position: ({buttonPosition.x.toFixed(0)}, {buttonPosition.y.toFixed(0)})
          </Text>
        </View>
        
        <Text style={styles.instruction}>
          Look for the 🌐 translation button in the bottom right corner of your screen.
        </Text>
      </View>
      
      {/* Translation button will appear here from App.js */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 30,
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 24,
  },
  infoBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 10,
    color: '#555',
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default TranslationButtonPositionTest;