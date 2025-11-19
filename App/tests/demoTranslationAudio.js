/**
 * Demo Translation and Audio Component
 * Shows how the real translation and audio features work
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import apiService from '../api/services/apiService';

const DemoTranslationAudio = () => {
  const [inputText, setInputText] = useState('Hello, how are you today?');
  const [translations, setTranslations] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentPlaying, setCurrentPlaying] = useState(null);

  // Language options for translation
  const languages = [
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' }
  ];

  const translateToAllLanguages = async () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter some text to translate');
      return;
    }

    setIsTranslating(true);
    setTranslations([]);
    
    try {
      const results = [];
      
      // Translate to each language
      for (const lang of languages) {
        try {
          const result = await apiService.translateText(
            inputText,
            'en',
            lang.code
          );
          
          if (result && result.translated_text) {
            results.push({
              ...lang,
              translatedText: result.translated_text,
              isMock: result.translated_text.includes('[MOCK]'),
              confidence: result.confidence || 1.0
            });
          }
        } catch (error) {
          console.log(`Translation failed for ${lang.name}:`, error);
          results.push({
            ...lang,
            translatedText: 'Translation failed',
            isMock: true,
            confidence: 0
          });
        }
      }
      
      setTranslations(results);
      Alert.alert('Success', `Translated to ${results.length} languages!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to translate text: ' + error.message);
    } finally {
      setIsTranslating(false);
    }
  };

  const playAudio = (text, languageCode, languageName) => {
    try {
      // Stop any currently playing audio
      Speech.stop();
      
      // Set current playing indicator
      setCurrentPlaying(languageCode);
      
      // Configure speech options
      const speechOptions = {
        language: languageCode,
        pitch: 1.0,
        rate: 0.9,
        onDone: () => {
          setCurrentPlaying(null);
          console.log(`Finished playing audio for ${languageName}`);
        },
        onError: (error) => {
          setCurrentPlaying(null);
          console.log(`Error playing audio for ${languageName}:`, error);
          Alert.alert('Audio Error', `Failed to play audio for ${languageName}`);
        }
      };
      
      // Play the audio
      Speech.speak(text, speechOptions);
      
      console.log(`Playing audio in ${languageName}: ${text}`);
    } catch (error) {
      setCurrentPlaying(null);
      Alert.alert('Audio Error', 'Failed to play audio: ' + error.message);
    }
  };

  const stopAudio = () => {
    Speech.stop();
    setCurrentPlaying(null);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🌍 Translation & Audio Demo</Text>
      
      {/* Input Section */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Enter text to translate:</Text>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          multiline
          placeholder="Type something to translate..."
        />
        
        <TouchableOpacity
          style={[styles.button, isTranslating && styles.buttonDisabled]}
          onPress={translateToAllLanguages}
          disabled={isTranslating}
        >
          <Text style={styles.buttonText}>
            {isTranslating ? 'Translating...' : 'Translate to All Languages'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Translations Section */}
      {translations.length > 0 && (
        <View style={styles.translationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Translations</Text>
            {currentPlaying && (
              <TouchableOpacity style={styles.stopButton} onPress={stopAudio}>
                <Text style={styles.stopButtonText}>⏹️ Stop Audio</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {translations.map((translation, index) => (
            <View key={translation.code} style={styles.translationCard}>
              <View style={styles.translationHeader}>
                <Text style={styles.languageName}>
                  {translation.flag} {translation.name} ({translation.code})
                </Text>
                {translation.isMock && (
                  <Text style={styles.mockBadge}>MOCK</Text>
                )}
              </View>
              
              <Text style={styles.translatedText}>
                {translation.translatedText}
              </Text>
              
              <TouchableOpacity
                style={styles.audioButton}
                onPress={() => playAudio(translation.translatedText, translation.code, translation.name)}
              >
                <Text style={styles.audioButtonText}>
                  {currentPlaying === translation.code ? '🔊 Playing...' : '▶️ Play Audio'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>How It Works:</Text>
        <Text style={styles.instructionsText}>
          1. Enter text in the input field above
        </Text>
        <Text style={styles.instructionsText}>
          2. Tap "Translate to All Languages" to translate to 10 languages
        </Text>
        <Text style={styles.instructionsText}>
          3. Tap "Play Audio" buttons to hear translations spoken aloud
        </Text>
        <Text style={styles.instructionsText}>
          4. Tap "Stop Audio" to stop playback
        </Text>
        <Text style={styles.note}>
          Note: Currently showing mock translations. In production with googletrans installed, 
          you'll see real translations.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  inputSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
  },
  button: {
    backgroundColor: '#007AFF',
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
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  translationsSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 6,
  },
  stopButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  translationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  translationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  mockBadge: {
    backgroundColor: '#FF9500',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  translatedText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
    lineHeight: 24,
  },
  audioButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  audioButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  note: {
    marginTop: 15,
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});

export default DemoTranslationAudio;