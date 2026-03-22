/**
 * Translation Modal Component
 * Main interface for speech-to-text translation
 * Enables users to translate speech between languages
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';
import apiService from '../api/services/apiService';
import { useAccessibility } from './AccessibilityProvider';

const TranslationModal = ({ visible, onClose }) => {
  const { settings, getThemeColors } = useAccessibility();
  const colors = getThemeColors() || {
    // Fallback colors in case getThemeColors returns undefined
    primary: '#7E22CE',
    secondary: '#9333EA',
    background: '#FAF5FF',
    surface: '#FFFFFF',
    text: '#3B0764',
    textSecondary: '#6B21A8',
    accent: '#D8B4FE',
    error: '#DC3545',
    success: '#28A745',
    warning: '#FFC107',
    border: '#E9D5FF',
  };
  
  // Debug colors on mount
  useEffect(() => {
    console.log('Translation colors:', colors);
  }, []);

  // State management
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState({});
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);

  // Animation refs - Initialize to 1 for guaranteed visibility
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Animate modal on open - SIMPLIFIED APPROACH
  useEffect(() => {
    console.log('Animation effect triggered, visible:', visible);
    if (visible) {
      // Set animations to END state immediately for first render
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      console.log('Modal set to visible (no animation for now)');
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible]);

  // Load supported languages on mount
  useEffect(() => {
    console.log('Loading languages, visible:', visible);
    if (visible) {
      loadLanguages();
    }
  }, [visible]);

  // Cleanup Voice recognition on component unmount
  useEffect(() => {
    return () => {
      if (Voice) {
        try {
          Voice.removeAllListeners();
          Voice.destroy();
          console.log('Voice recognition cleaned up on unmount');
        } catch (err) {
          console.log('Voice already cleaned up:', err.message);
        }
      }
    };
  }, []);

  const loadLanguages = async () => {
    console.log('Loading supported languages...');
    setIsLoadingLanguages(true);
    try {
      const response = await apiService.getSupportedLanguages();
      console.log('Languages response:', response);
      if (response && response.languages) {
        setSupportedLanguages(response.languages);
        console.log('Languages loaded:', Object.keys(response.languages).length);
      } else {
        console.warn('No languages in response, using fallback');
        // Fallback languages
        setSupportedLanguages({
          en: 'English',
          es: 'Spanish',
          fr: 'French',
          de: 'German',
          it: 'Italian',
          pt: 'Portuguese',
          ru: 'Russian',
          ja: 'Japanese',
          ko: 'Korean',
          zh: 'Chinese',
          ar: 'Arabic',
          hi: 'Hindi',
        });
      }
    } catch (error) {
      console.error('Error loading languages:', error);
      // Fallback languages
      setSupportedLanguages({
        en: 'English',
        es: 'Spanish',
        fr: 'French',
        de: 'German',
        it: 'Italian',
        pt: 'Portuguese',
        ru: 'Russian',
        ja: 'Japanese',
        ko: 'Korean',
        zh: 'Chinese',
        ar: 'Arabic',
        hi: 'Hindi',
      });
      Alert.alert('Warning', 'Could not load languages from server. Using default list.');
    } finally {
      setIsLoadingLanguages(false);
      console.log('Language loading complete, isLoadingLanguages:', false);
    }
  };

  // Voice recognition handlers
  useEffect(() => {
    if (!Voice) {
      console.warn('Voice module not available');
      return;
    }

    // Set up voice recognition listeners only once
    Voice.onSpeechStart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };

    Voice.onSpeechEnd = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
    };

    Voice.onSpeechResults = (e) => {
      if (e.value && e.value.length > 0) {
        const text = e.value[0];
        console.log('Speech result:', text);
        setTranscribedText(text);
        setIsListening(false);
      }
    };

    Voice.onSpeechError = (e) => {
      console.error('Speech error:', e);
      setIsListening(false);
      Alert.alert('Error', 'Speech recognition failed. Please try again.');
    };

    Voice.onSpeechPartialResults = (e) => {
      if (e.value && e.value.length > 0) {
        // Show partial results while speaking
        setTranscribedText(e.value[0]);
      }
    };

    // Cleanup function to prevent memory leaks (but NOT destroy - that's done on unmount)
    return () => {
      if (Voice) {
        try {
          Voice.removeAllListeners();
          console.log('Voice listeners removed (component cleanup)');
        } catch (err) {
          console.log('Voice listeners already cleaned:', err.message);
        }
      }
    };
  }, []);

  const startListening = async () => {
    try {
      if (!Voice) {
        Alert.alert('Error', 'Voice recognition is not available on this device.');
        return;
      }

      // Stop any existing recognition and cleanup
      try {
        await Voice.stop();
        Voice.removeAllListeners();
      } catch (e) {
        // Ignore if not started
      }

      // Re-set up voice recognition listeners
      Voice.onSpeechStart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };

      Voice.onSpeechEnd = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      Voice.onSpeechResults = (e) => {
        if (e.value && e.value.length > 0) {
          const text = e.value[0];
          console.log('Speech result:', text);
          setTranscribedText(text);
          setIsListening(false);
        }
      };

      Voice.onSpeechError = (e) => {
        console.error('Speech error:', e);
        setIsListening(false);
        Alert.alert('Error', 'Speech recognition failed. Please try again.');
      };

      Voice.onSpeechPartialResults = (e) => {
        if (e.value && e.value.length > 0) {
          // Show partial results while speaking
          setTranscribedText(e.value[0]);
        }
      };

      // Convert language code for Voice (e.g., 'en' -> 'en-US')
      const voiceLanguage = sourceLanguage === 'en' ? 'en-US' : sourceLanguage;
      
      await Voice.start(voiceLanguage);
      setIsListening(true);
      setTranscribedText('');
      setTranslatedText('');
      setIsConfirmed(false);
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      Alert.alert('Error', 'Failed to start listening. Please check microphone permissions.');
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      if (Voice) {
        await Voice.stop();
      }
      setIsListening(false);
    } catch (error) {
      console.warn('Error stopping voice recognition (non-critical):', error);
      setIsListening(false);
    }
  };

  const confirmTranscription = async () => {
    // If we have transcribed text, use it
    // If not, but we have some text (typed manually), use that
    const textToTranslate = transcribedText.trim();
    
    if (!textToTranslate) {
      Alert.alert('Error', 'No text to translate');
      return;
    }

    setIsProcessing(true);
    setIsConfirmed(true);

    try {
      console.log('Translating:', { text: textToTranslate, from: sourceLanguage, to: targetLanguage });
      const result = await apiService.translateText(
        textToTranslate,
        sourceLanguage,
        targetLanguage
      );
      
      console.log('Translation result:', result);
      
      if (result && result.translated_text) {
        setTranslatedText(result.translated_text);
        
        // Voice announcement if enabled
        if (settings.voiceNavigation) {
          Speech.speak('Translation complete', {
            rate: settings.speechRate,
            pitch: settings.speechPitch,
          });
        }
      } else {
        throw new Error('Invalid translation response');
      }
    } catch (error) {
      console.error('Translation error:', error);
      Alert.alert(
        'Translation Error',
        error.message || 'Translation failed. Please check your connection and try again.'
      );
      setIsConfirmed(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const playTranslation = () => {
    if (!translatedText) return;

    try {
      Speech.speak(translatedText, {
        language: targetLanguage,
        pitch: settings.speechPitch || 1.0,
        rate: settings.speechRate || 0.9,
      });
    } catch (error) {
      console.error('TTS error:', error);
      Alert.alert('Error', 'Failed to play audio. Please try again.');
    }
  };

  const reset = () => {
    setTranscribedText('');
    setTranslatedText('');
    setIsConfirmed(false);
    setIsListening(false);
    
    // Stop voice recognition if active
    if (Voice) {
      try {
        Voice.stop();
        Voice.removeAllListeners();
        console.log('Voice reset complete');
      } catch (err) {
        console.log('Voice reset note:', err.message);
      }
    }
  };

  const handleClose = () => {
    // Stop voice recognition if active
    if (Voice) {
      try {
        Voice.stop();
        Voice.removeAllListeners();
        console.log('Voice stopped before close');
      } catch (err) {
        console.log('Voice stop note:', err.message);
      }
    }
    
    reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.surface || '#FFFFFF',
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>🌐 Translation</Text>
            <TouchableOpacity onPress={handleClose} accessibilityLabel="Close translation modal">
              <Text style={[styles.closeButton, { color: colors.primary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Language Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Languages</Text>
              
              {isLoadingLanguages ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Loading languages...
                  </Text>
                </View>
              ) : (
                <View style={styles.languageRow}>
                  <View style={styles.languagePicker}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>From:</Text>
                    <View style={[styles.pickerContainer, { backgroundColor: colors.background }]}>
                      <Picker
                        selectedValue={sourceLanguage}
                        onValueChange={(value) => {
                          setSourceLanguage(value);
                          reset();
                        }}
                        style={[styles.picker, { color: colors.text }]}
                        dropdownIconColor={colors.text}
                      >
                        {Object.entries(supportedLanguages).map(([code, name]) => (
                          <Picker.Item key={code} label={name} value={code} />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.languagePicker}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>To:</Text>
                    <View style={[styles.pickerContainer, { backgroundColor: colors.background }]}>
                      <Picker
                        selectedValue={targetLanguage}
                        onValueChange={(value) => {
                          setTargetLanguage(value);
                          reset();
                        }}
                        style={[styles.picker, { color: colors.text }]}
                        dropdownIconColor={colors.text}
                      >
                        {Object.entries(supportedLanguages).map(([code, name]) => (
                          <Picker.Item key={code} label={name} value={code} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Manual Text Input Option */}
            {!isListening && !transcribedText && !translatedText && (
              <View style={styles.section}>
                <View style={styles.workflowStep}>
                  <Text style={styles.stepNumber}>★</Text>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>Or Type Text</Text>
                </View>
                
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  value={transcribedText}
                  onChangeText={setTranscribedText}
                  placeholder="Type text to translate..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />
                
                {transcribedText.trim() ? (
                  <TouchableOpacity
                    style={[styles.workflowButton, { backgroundColor: colors.primary }]}
                    onPress={confirmTranscription}
                    accessibilityLabel="Translate typed text"
                  >
                    <Text style={styles.workflowButtonText}>🔄 Translate Typed Text</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}

            {/* Workflow Steps */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Translation Workflow</Text>
              
              {/* Step 1: Speech Recording */}
              <View style={styles.workflowStep}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Record Speech</Text>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.workflowButton,
                  { backgroundColor: isListening ? colors.error : colors.primary },
                ]}
                onPress={isListening ? stopListening : startListening}
                disabled={isProcessing || isLoadingLanguages}
                accessibilityLabel={isListening ? 'Stop recording' : 'Start recording'}
              >
                <Text style={styles.workflowButtonText}>
                  {isListening ? '⏹ Stop Listening' : '🎤 Start Listening'}
                </Text>
              </TouchableOpacity>

              {isListening && (
                <View style={styles.listeningIndicator}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.listeningText, { color: colors.textSecondary }]}>
                    Listening... Speak now
                  </Text>
                </View>
              )}
              
              {/* Display transcribed text if available */}
              {transcribedText ? (
                <View style={[styles.textBox, { backgroundColor: colors.background, borderColor: colors.border, marginTop: 15 }]}>
                  <Text style={[styles.transcribedText, { color: colors.text }]}>
                    {transcribedText}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Step 2: Confirm and Translate */}
            {transcribedText && !isConfirmed && (
              <View style={styles.section}>
                <View style={styles.workflowStep}>
                  <Text style={styles.stepNumber}>2</Text>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>Confirm & Translate</Text>
                </View>
                
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.workflowButton, { backgroundColor: colors.success || '#4CAF50' }]}
                    onPress={confirmTranscription}
                    accessibilityLabel="Confirm transcription and translate"
                  >
                    <Text style={styles.workflowButtonText}>🔄 Translate Text</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.workflowButton, { backgroundColor: colors.error || '#F44336' }]}
                    onPress={reset}
                    accessibilityLabel="Clear transcription and record again"
                  >
                    <Text style={styles.workflowButtonText}>🗑️ Clear</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Translation Processing */}
            {isProcessing && (
              <View style={styles.section}>
                <View style={styles.workflowStep}>
                  <Text style={styles.stepNumber}>3</Text>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>Translating...</Text>
                </View>
                
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.processingText, { color: colors.textSecondary }]}>
                    Translating your text...
                  </Text>
                </View>
              </View>
            )}

            {/* Translation Display */}
            {translatedText && (
              <View style={styles.section}>
                <View style={styles.workflowStep}>
                  <Text style={styles.stepNumber}>4</Text>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>Translation Result</Text>
                </View>
                
                <View style={[styles.textBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.translatedText, { color: colors.text }]}>
                    {translatedText}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.workflowButton, { backgroundColor: colors.accent || colors.primary }]}
                  onPress={playTranslation}
                  accessibilityLabel="Play translated text as audio"
                >
                  <Text style={styles.workflowButtonText}>🔊 Play Audio</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.workflowButton, { backgroundColor: colors.background, borderColor: colors.primary, borderWidth: 1 }]}
                  onPress={reset}
                  accessibilityLabel="Start a new translation"
                >
                  <Text style={[styles.workflowButtonText, { color: colors.primary }]}>
                    ➕ New Translation
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  languagePicker: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  pickerContainer: {
    borderRadius: 10,
    borderWidth: 1,
  },
  picker: {
    height: 50,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
  },
  workflowStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: 'bold',
    marginRight: 10,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  workflowButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  workflowButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listeningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  listeningText: {
    marginLeft: 10,
    fontSize: 14,
  },
  textBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    minHeight: 80,
    marginBottom: 15,
  },
  transcribedText: {
    fontSize: 16,
  },
  translatedText: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  processingText: {
    marginLeft: 15,
    fontSize: 16,
  },
  playButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  playButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    marginVertical: 5,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 15,
  },
});

export default TranslationModal;

