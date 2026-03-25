/**
 * Translation Modal - Beautiful & Fully Functional
 * Fixed: iOS picker, button text color, language swap, visual polish
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
  TextInput,
  Platform,
  ActionSheetIOS,
  Animated,
  KeyboardAvoidingView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Speech from 'expo-speech';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import apiService from '../api/services/apiService';
import { useAccessibility } from './AccessibilityProvider';

const FALLBACK_LANGUAGES = {
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
  ta: 'Tamil',
  te: 'Telugu',
  ml: 'Malayalam',
  bn: 'Bengali',
  tr: 'Turkish',
  nl: 'Dutch',
  pl: 'Polish',
  sv: 'Swedish',
};

const TranslationModal = ({ visible, onClose }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors() || {
    primary: '#7E22CE',
    secondary: '#9333EA',
    background: '#FAF5FF',
    surface: '#FFFFFF',
    text: '#3B0764',
    textSecondary: '#6B21A8',
    border: '#E9D5FF',
  };

  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [languages, setLanguages] = useState(FALLBACK_LANGUAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [hasPermission, setHasPermission] = useState(null);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const swapAnim = useRef(new Animated.Value(1)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;

  const getLanguageName = (code) => languages[code] || code.toUpperCase();

  useEffect(() => {
    if (visible) {
      loadLanguages();
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(0);
    }
  }, [visible]);

  // Animate result in when it appears
  useEffect(() => {
    if (translatedText) {
      resultAnim.setValue(0);
      Animated.spring(resultAnim, {
        toValue: 1,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }).start();
    }
  }, [translatedText]);

  const loadLanguages = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getSupportedLanguages();
      if (response && response.languages && Object.keys(response.languages).length > 0) {
        setLanguages(response.languages);
      } else {
        setLanguages(FALLBACK_LANGUAGES);
      }
    } catch (error) {
      setLanguages(FALLBACK_LANGUAGES);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Speech Recognition Event Listeners ──────────────────────────────────
  useSpeechRecognitionEvent('start', () => {
    setIsRecording(true);
    console.log('🎤 Speech recognition started');
  });

  useSpeechRecognitionEvent('end', () => {
    setIsRecording(false);
    console.log('🎤 Speech recognition ended - Safe to cleanup');
  });

  useSpeechRecognitionEvent('result', (event) => {
    const currentTranscript = event.results[0]?.transcript || '';
    setTranscription(currentTranscript);
    setInputText(currentTranscript);
    console.log('🎤 Transcription result:', currentTranscript);
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('🎤 Speech recognition error:', event.error, event.message);
    setIsRecording(false);
    // Silently ignore common non-critical errors - these are normal operation
    const silentErrors = ['no_speech', 'timeout', 'network', 'audio-capture', 'not-allowed'];
    if (!silentErrors.includes(event.error)) {
      Alert.alert(
        'Voice Input Error',
        event.message || 'Unable to recognize speech. Please try again.',
        [{ text: 'OK' }]
      );
    } else {
      console.log(`🎤 Ignored expected error: ${event.error} - This is normal behavior`);
    }
  });

  // NOTE: Removed cleanup useEffect - DO NOT call stop() on unmount
  // The native module handles its own cleanup automatically
  // Calling stop() during React cleanup can cause race conditions and crashes

  // ── Voice Recording Functions ────────────────────────────────────────────
  const requestPermissions = async () => {
    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      setHasPermission(result.granted);
      return result.granted;
    } catch (error) {
      console.error('Permission error:', error);
      setHasPermission(false);
      return false;
    }
  };

  const startVoiceRecognition = async () => {
    // Prevent multiple simultaneous requests
    if (isRecording) {
      console.log('🎤 Already recording, ignoring duplicate start request');
      return;
    }

    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert(
        'Permission Required',
        'Please grant microphone and speech recognition permissions to use voice input.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Stop any ongoing speech first
      if (isSpeaking) {
        Speech.stop();
        setIsSpeaking(false);
      }

      console.log('🎤 Starting speech recognition for language:', sourceLanguage);
      
      // Start speech recognition with source language
      await ExpoSpeechRecognitionModule.start({
        lang: sourceLanguage,
        interimResults: true,
        continuous: false,  // Auto-stop after no speech detected
        requiresOnDeviceRecognition: Platform.OS === 'ios',
        addsPunctuation: true,
      });
      
      console.log('🎤 Speech recognition started successfully');
    } catch (error) {
      console.error('🎤 Voice recognition start error:', error);
      setIsRecording(false);
      Alert.alert(
        'Voice Input Failed',
        error.message || 'Unable to start voice recognition.',
        [{ text: 'OK' }]
      );
    }
  };

  const stopVoiceRecognition = async () => {
    try {
      console.log('🎤 Stopping speech recognition...');
      await ExpoSpeechRecognitionModule.stop();
      console.log('🎤 Speech recognition stopped successfully');
    } catch (error) {
      console.error('🎤 Stop voice recognition error:', error);
      // Don't show alert for stop errors, just log them
    } finally {
      setIsRecording(false);
    }
  };

  // ── iOS Language Picker via ActionSheet ──────────────────────────────────
  const openIOSPicker = (current, setter, exclude) => {
    const entries = Object.entries(languages).filter(([code]) => code !== exclude);
    const options = entries.map(([, name]) => name);
    options.push('Cancel');

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
        title: 'Select Language',
      },
      (buttonIndex) => {
        if (buttonIndex < entries.length) {
          setter(entries[buttonIndex][0]);
          // Clear translation when language changes
          setTranslatedText('');
        }
      }
    );
  };

  // ── Language Swap ────────────────────────────────────────────────────────
  const handleSwapLanguages = () => {
    Animated.sequence([
      Animated.timing(swapAnim, { toValue: 0.7, duration: 100, useNativeDriver: true }),
      Animated.spring(swapAnim, { toValue: 1, tension: 150, friction: 5, useNativeDriver: true }),
    ]).start();

    const prevSource = sourceLanguage;
    const prevTarget = targetLanguage;
    setSourceLanguage(prevTarget);
    setTargetLanguage(prevSource);

    // Swap text too if we have a translation
    if (translatedText) {
      setInputText(translatedText);
      setTranslatedText('');
    }
  };

  // ── Translation ──────────────────────────────────────────────────────────
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      Alert.alert('Nothing to translate', 'Please enter some text first.');
      return;
    }
    if (sourceLanguage === targetLanguage) {
      Alert.alert('Same language', 'Please select different source and target languages.');
      return;
    }

    setIsProcessing(true);
    setTranslatedText('');
    try {
      const result = await apiService.translateText(inputText, sourceLanguage, targetLanguage);
      if (result && result.translated_text) {
        setTranslatedText(result.translated_text);
      } else {
        throw new Error('No translation received from server.');
      }
    } catch (error) {
      Alert.alert('Translation Failed', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Text-to-Speech ───────────────────────────────────────────────────────
  const handlePlayAudio = async () => {
    if (!translatedText || isSpeaking) return;
    setIsSpeaking(true);
    try {
      await Speech.speak(translatedText, {
        language: targetLanguage,
        rate: 0.85,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch {
      setIsSpeaking(false);
    }
  };

  const handleStopAudio = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  const handleClose = () => {
    console.log('🎤 Closing translation modal...');
    
    // IMPORTANT: Don't call ExpoSpeechRecognitionModule.stop() here
    // The native module will auto-cleanup when the component unmounts
    // Calling stop() can cause race conditions with the 'end' event
    
    // Just update our React state to stop UI indicators
    setIsRecording(false);
    setIsSpeaking(false);
    
    // Stop text-to-speech (safe to call)
    Speech.stop();
    
    // Clear all text and state
    setInputText('');
    setTranslatedText('');
    setTranscription('');
    
    // Close the modal
    onClose();
  };

  // ── Language Selector Component ──────────────────────────────────────────
  const LanguageSelector = ({ label, selectedCode, onSelect, excludeCode }) => {
    if (Platform.OS === 'ios') {
      return (
        <TouchableOpacity
          style={[styles.langSelector, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={() => openIOSPicker(selectedCode, onSelect, excludeCode)}
          activeOpacity={0.7}
        >
          <Text style={[styles.langLabel, { color: colors.textSecondary }]}>{label}</Text>
          <View style={styles.langValueRow}>
            <Text style={[styles.langValue, { color: colors.text }]} numberOfLines={1}>
              {getLanguageName(selectedCode)}
            </Text>
            <Text style={[styles.chevron, { color: colors.primary }]}>›</Text>
          </View>
        </TouchableOpacity>
      );
    }

    // Android: native Picker
    return (
      <View style={[styles.langSelector, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Text style={[styles.langLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Picker
          selectedValue={selectedCode}
          onValueChange={(value) => {
            onSelect(value);
            setTranslatedText('');
          }}
          style={[styles.androidPicker, { color: colors.text }]}
          dropdownIconColor={colors.primary}
          mode="dropdown"
        >
          {Object.entries(languages)
            .filter(([code]) => code !== excludeCode)
            .map(([code, name]) => (
              <Picker.Item key={code} label={name} value={code} color="#000000" style={{ backgroundColor: '#FFFFFF' }} />
            ))}
        </Picker>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
        <Animated.View
          style={[
            styles.modal,
            { backgroundColor: colors.surface },
            { opacity: fadeAnim },
          ]}
        >
          {/* ── Handle bar ── */}
          <View style={styles.handleBar}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          {/* ── Header ── */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconBadge, { backgroundColor: colors.primary + '18' }]}>
                <Text style={styles.headerIcon}>🌐</Text>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Translate</Text>
            </View>
            <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.background }]} onPress={handleClose}>
              <Text style={[styles.closeIcon, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Language Pair Row ── */}
            <View style={styles.langRow}>
              <View style={styles.langSelectorWrapper}>
                <LanguageSelector
                  label="FROM"
                  selectedCode={sourceLanguage}
                  onSelect={setSourceLanguage}
                  excludeCode={targetLanguage}
                />
              </View>

              {/* Swap button */}
              <Animated.View style={{ transform: [{ scale: swapAnim }] }}>
                <TouchableOpacity
                  style={[styles.swapButton, { backgroundColor: colors.primary }]}
                  onPress={handleSwapLanguages}
                  activeOpacity={0.8}
                >
                  <Text style={styles.swapIcon}>⇄</Text>
                </TouchableOpacity>
              </Animated.View>

              <View style={styles.langSelectorWrapper}>
                <LanguageSelector
                  label="TO"
                  selectedCode={targetLanguage}
                  onSelect={setTargetLanguage}
                  excludeCode={sourceLanguage}
                />
              </View>
            </View>

            {/* ── Input ── */}
            <View style={[styles.inputCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              {/* Voice Recording Button */}
              <View style={styles.voiceInputHeader}>
                <TouchableOpacity
                  style={[
                    styles.voiceButton,
                    {
                      backgroundColor: isRecording ? colors.primary : colors.surface,
                      borderColor: isRecording ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={isRecording ? stopVoiceRecognition : startVoiceRecognition}
                  activeOpacity={0.8}
                  disabled={isProcessing}
                >
                  <Text
                    style={[
                      styles.voiceIcon,
                      { color: isRecording ? '#FFFFFF' : colors.primary },
                    ]}
                  >
                    {isRecording ? '⏹' : '🎤'}
                  </Text>
                  <Text
                    style={[
                      styles.voiceLabel,
                      { color: isRecording ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {isRecording ? 'Stop' : 'Speak'}
                  </Text>
                </TouchableOpacity>
                {isRecording && (
                  <View style={styles.recordingIndicator}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.recordingText, { color: colors.textSecondary }]}>
                      Listening...
                    </Text>
                  </View>
                )}
              </View>

              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={inputText}
                onChangeText={(t) => {
                  setInputText(t);
                  if (!t) setTranslatedText('');
                }}
                placeholder={`Type in ${getLanguageName(sourceLanguage)}…`}
                placeholderTextColor={colors.textSecondary + '80'}
                multiline
                editable={!isProcessing && !isRecording}
                textAlignVertical="top"
                maxLength={1000}
              />
              <View style={styles.inputFooter}>
                <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                  {inputText.length}/1000
                </Text>
                {inputText.length > 0 && (
                  <TouchableOpacity onPress={() => { setInputText(''); setTranslatedText(''); }}>
                    <Text style={[styles.clearText, { color: colors.primary }]}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* ── Translate Button ── */}
            <TouchableOpacity
              style={[
                styles.translateButton,
                { backgroundColor: isProcessing ? colors.secondary : colors.primary },
              ]}
              onPress={handleTranslate}
              disabled={isProcessing || !inputText.trim()}
              activeOpacity={0.85}
            >
              {isProcessing ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.translateButtonText}>Translating…</Text>
                </View>
              ) : (
                <Text style={styles.translateButtonText}>Translate →</Text>
              )}
            </TouchableOpacity>

            {/* ── Result ── */}
            {translatedText ? (
              <Animated.View
                style={[
                  styles.resultCard,
                  { backgroundColor: colors.primary + '0D', borderColor: colors.primary + '40' },
                  {
                    opacity: resultAnim,
                    transform: [{ translateY: resultAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
                  },
                ]}
              >
                <View style={styles.resultHeader}>
                  <Text style={[styles.resultLang, { color: colors.primary }]}>
                    {getLanguageName(targetLanguage)}
                  </Text>
                  <View style={styles.resultActions}>
                    <TouchableOpacity
                      style={[
                        styles.audioButton,
                        { backgroundColor: isSpeaking ? colors.primary : colors.surface, borderColor: colors.primary },
                      ]}
                      onPress={isSpeaking ? handleStopAudio : handlePlayAudio}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.audioIcon, { color: isSpeaking ? '#fff' : colors.primary }]}>
                        {isSpeaking ? '⏹' : '🔊'}
                      </Text>
                      <Text style={[styles.audioLabel, { color: isSpeaking ? '#fff' : colors.primary }]}>
                        {isSpeaking ? 'Stop' : 'Play'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={[styles.resultText, { color: colors.text }]}>{translatedText}</Text>
              </Animated.View>
            ) : null}

            {/* Bottom spacing */}
            <View style={{ height: 24 }} />
          </ScrollView>
        </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  keyboardView: {
    width: '100%',
  },
  modal: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    minHeight: 520,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 24,
  },
  handleBar: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 14,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 14,
  },

  // Language Row
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  langSelectorWrapper: {
    flex: 1,
  },
  langSelector: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
    minHeight: 70,
    justifyContent: 'center',
  },
  langLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  langValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  langValue: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '300',
    marginLeft: 4,
  },
  androidPicker: {
    marginTop: -8,
    marginBottom: -4,
    marginHorizontal: -4,
  },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  swapIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  // Input
  inputCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  voiceInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  voiceIcon: {
    fontSize: 14,
  },
  voiceLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  textInput: {
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  charCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Translate Button
  translateButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7E22CE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  translateButtonText: {
    color: '#FFFFFF',           // ← Fixed: was #000000 (black on purple = unreadable)
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Result
  resultCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLang: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 8,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  audioIcon: {
    fontSize: 14,
  },
  audioLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultText: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400',
  },
});

export default TranslationModal;