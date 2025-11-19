/**
 * Translation and Audio Test
 * Tests translation to multiple languages and audio playback
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import apiService from '../api/services/apiService';

const TranslationAudioTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const logResult = (message, isSuccess = true) => {
    const result = {
      message,
      isSuccess,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [...prev, result]);
    console.log(`[${isSuccess ? 'PASS' : 'FAIL'}] ${message}`);
  };

  const testText = "Hello, how are you today?";

  const languageMap = {
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic'
  };

  const playTranslationAudio = async (text, languageCode) => {
    return new Promise((resolve) => {
      try {
        // Configure speech options
        const speechOptions = {
          language: languageCode,
          pitch: 1.0,
          rate: 0.9,
          onDone: () => {
            logResult(`Audio playback completed for ${languageMap[languageCode] || languageCode}`, true);
            resolve(true);
          },
          onError: (error) => {
            logResult(`Audio playback failed for ${languageMap[languageCode] || languageCode}: ${error}`, false);
            resolve(false);
          }
        };

        // Play the audio
        Speech.speak(text, speechOptions);
        
        // Set a timeout in case onDone/onError don't fire
        setTimeout(() => {
          resolve(true);
        }, 5000);
      } catch (error) {
        logResult(`Failed to play audio for ${languageMap[languageCode] || languageCode}: ${error.message}`, false);
        resolve(false);
      }
    });
  };

  const testTranslationAndAudio = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    try {
      logResult('Starting translation and audio test...', true);
      
      // Test each language
      for (const [langCode, langName] of Object.entries(languageMap)) {
        try {
          logResult(`Testing ${langName} (${langCode})...`, true);
          
          // Translate text
          const translationResult = await apiService.translateText(
            testText,
            'en',
            langCode
          );
          
          if (translationResult && translationResult.translated_text) {
            logResult(`Translation to ${langName}: ${translationResult.translated_text}`, true);
            
            // Play audio for the translation
            await playTranslationAudio(translationResult.translated_text, langCode);
            
            // Small delay between languages
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            logResult(`Failed to translate to ${langName}`, false);
          }
        } catch (error) {
          logResult(`Error testing ${langName}: ${error.message}`, false);
        }
      }
      
      logResult('Translation and audio test completed!', true);
      Alert.alert('Test Complete', 'Check the results below for details.');
    } catch (error) {
      logResult(`Test failed: ${error.message}`, false);
      Alert.alert('Test Failed', error.message);
    } finally {
      setIsTesting(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Translation & Audio Test</Text>
      
      <Text style={styles.description}>
        This test will translate "{testText}" to multiple languages and play the audio for each translation.
      </Text>
      
      <TouchableOpacity
        style={[styles.button, isTesting && styles.buttonDisabled]}
        onPress={testTranslationAndAudio}
        disabled={isTesting}
      >
        <Text style={styles.buttonText}>
          {isTesting ? 'Testing...' : 'Start Translation & Audio Test'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, styles.clearButton]}
        onPress={clearResults}
      >
        <Text style={styles.buttonText}>Clear Results</Text>
      </TouchableOpacity>
      
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <View 
            key={index} 
            style={[
              styles.resultItem, 
              result.isSuccess ? styles.resultSuccess : styles.resultError
            ]}
          >
            <Text style={styles.resultText}>
              [{result.timestamp}] {result.message}
            </Text>
          </View>
        ))}
        
        {testResults.length === 0 && (
          <Text style={styles.noResults}>No test results yet. Press "Start Test" to begin.</Text>
        )}
      </View>
    </ScrollView>
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
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultItem: {
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
  resultSuccess: {
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  resultError: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  resultText: {
    fontSize: 14,
    color: '#333',
  },
  noResults: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
});

export default TranslationAudioTest;