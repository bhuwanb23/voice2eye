/**
 * Translation and Audio Integration Test
 * Verifies that translated text can be converted to audio and played
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import apiService from '../api/services/apiService';

const TranslationAudioIntegrationTest = () => {
  // Test translations in different languages
  const testTranslations = [
    {
      text: "Hello, how are you today?",
      language: "en",
      name: "English",
      translated: "Hello, how are you today?"
    },
    {
      text: "Hola, ¿cómo estás hoy?",
      language: "es",
      name: "Spanish",
      translated: "Hola, ¿cómo estás hoy?"
    },
    {
      text: "Bonjour, comment allez-vous aujourd'hui?",
      language: "fr",
      name: "French",
      translated: "Bonjour, comment allez-vous aujourd'hui?"
    },
    {
      text: "Hallo, wie geht es dir heute?",
      language: "de",
      name: "German",
      translated: "Hallo, wie geht es dir heute?"
    }
  ];

  const playAudio = async (text, language, name) => {
    try {
      console.log(`Playing audio in ${name}: ${text}`);
      
      // Play the audio
      Speech.speak(text, {
        language: language,
        pitch: 1.0,
        rate: 0.9,
        onDone: () => {
          console.log(`✅ Audio playback completed for ${name}`);
          Alert.alert('Success', `Audio playback completed for ${name}`);
        },
        onError: (error) => {
          console.log(`❌ Audio playback failed for ${name}:`, error);
          Alert.alert('Error', `Audio playback failed for ${name}: ${error.message}`);
        }
      });
    } catch (error) {
      console.log(`❌ Failed to play audio for ${name}:`, error);
      Alert.alert('Error', `Failed to play audio for ${name}: ${error.message}`);
    }
  };

  const testTranslationAndAudio = async (sourceText, sourceLang, targetLang, targetName) => {
    try {
      console.log(`Translating from ${sourceLang} to ${targetLang}...`);
      
      // Translate the text
      const result = await apiService.translateText(sourceText, sourceLang, targetLang);
      
      if (result && result.translated_text) {
        console.log(`✅ Translation successful: ${result.translated_text}`);
        
        // Play the translated audio
        await playAudio(result.translated_text, targetLang, targetName);
        
        return result.translated_text;
      } else {
        console.log('❌ Translation failed');
        Alert.alert('Error', 'Translation failed');
        return null;
      }
    } catch (error) {
      console.log('❌ Translation error:', error);
      Alert.alert('Error', `Translation error: ${error.message}`);
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Translation & Audio Integration Test</Text>
      
      <Text style={styles.description}>
        Tap any button below to test translation and audio playback
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.englishButton]}
          onPress={() => playAudio("Hello, how are you today?", "en", "English")}
        >
          <Text style={styles.buttonText}>🔊 Play English Audio</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.spanishButton]}
          onPress={() => playAudio("Hola, ¿cómo estás hoy?", "es", "Spanish")}
        >
          <Text style={styles.buttonText}>🔊 Play Spanish Audio</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.frenchButton]}
          onPress={() => playAudio("Bonjour, comment allez-vous aujourd'hui?", "fr", "French")}
        >
          <Text style={styles.buttonText}>🔊 Play French Audio</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.germanButton]}
          onPress={() => playAudio("Hallo, wie geht es dir heute?", "de", "German")}
        >
          <Text style={styles.buttonText}>🔊 Play German Audio</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.translateButton]}
          onPress={() => testTranslationAndAudio("Hello, how are you today?", "en", "es", "Spanish")}
        >
          <Text style={styles.buttonText}>🌐 Translate & Play Spanish</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.translateButton]}
          onPress={() => testTranslationAndAudio("Hello, how are you today?", "en", "fr", "French")}
        >
          <Text style={styles.buttonText}>🌐 Translate & Play French</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.note}>
        Note: Audio playback uses the device's text-to-speech engine. 
        Make sure your device has text-to-speech capabilities enabled.
      </Text>
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
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  englishButton: {
    backgroundColor: '#007AFF',
  },
  spanishButton: {
    backgroundColor: '#FF9500',
  },
  frenchButton: {
    backgroundColor: '#5856D6',
  },
  germanButton: {
    backgroundColor: '#34C759',
  },
  translateButton: {
    backgroundColor: '#AF52DE',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    marginTop: 30,
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default TranslationAudioIntegrationTest;