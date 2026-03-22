/**
 * Translation Modal - Clean Implementation
 * Simple, working translation interface
 */
import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Speech from 'expo-speech';
import apiService from '../api/services/apiService';
import { useAccessibility } from './AccessibilityProvider';

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
  const [languages, setLanguages] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [languageDropdownVisible, setLanguageDropdownVisible] = useState({ from: false, to: false });

  useEffect(() => {
    if (visible) {
      loadLanguages();
    }
  }, [visible]);

  const loadLanguages = async () => {
    console.log('Loading languages...');
    setIsLoading(true);
    try {
      const response = await apiService.getSupportedLanguages();
      console.log('Languages API response:', response);
      
      if (response && response.languages) {
        setLanguages(response.languages);
        console.log('Languages loaded:', Object.keys(response.languages).length);
      } else {
        console.warn('No languages in response, using fallback');
        setLanguages({
          en: 'English', es: 'Spanish', fr: 'French', de: 'German',
          it: 'Italian', pt: 'Portuguese', ru: 'Russian', ja: 'Japanese',
          ko: 'Korean', zh: 'Chinese', ar: 'Arabic', hi: 'Hindi',
        });
      }
    } catch (error) {
      console.error('Could not load languages:', error);
      setLanguages({
        en: 'English', es: 'Spanish', fr: 'French', de: 'German',
        it: 'Italian', pt: 'Portuguese', ru: 'Russian', ja: 'Japanese',
        ko: 'Korean', zh: 'Chinese', ar: 'Arabic', hi: 'Hindi',
      });
      Alert.alert('Warning', 'Could not load languages from server. Using default list.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter some text to translate');
      return;
    }

    console.log('Starting translation:', { 
      text: inputText, 
      from: sourceLanguage, 
      to: targetLanguage 
    });
    
    setIsProcessing(true);
    try {
      const result = await apiService.translateText(inputText, sourceLanguage, targetLanguage);
      console.log('Translation result:', result);
      
      if (result && result.translated_text) {
        setTranslatedText(result.translated_text);
        Speech.speak('Translation complete', { rate: 0.9 });
      } else {
        Alert.alert('Warning', 'Received empty translation response');
        throw new Error('No translation received');
      }
    } catch (error) {
      console.error('Translation error:', error);
      Alert.alert('Translation Error', error.message || 'Translation failed. Backend may be using mock responses.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayAudio = () => {
    if (!translatedText) return;
    Speech.speak(translatedText, { language: targetLanguage, rate: 0.9 });
  };

  const handleClose = () => {
    setInputText('');
    setTranslatedText('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>🌐 Translate</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={[styles.closeBtn, { color: colors.primary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Language Selection */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>From:</Text>
              <View style={[styles.pickerBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Picker 
                  selectedValue={sourceLanguage} 
                  onValueChange={(value) => {
                    console.log('Source language changed to:', value);
                    setSourceLanguage(value);
                  }} 
                  style={styles.picker}
                  dropdownIconColor={colors.text}
                >
                  {Object.entries(languages).map(([code, name]) => (
                    <Picker.Item key={code} label={name} value={code} />
                  ))}
                </Picker>
              </View>

              <Text style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}>To:</Text>
              <View style={[styles.pickerBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Picker 
                  selectedValue={targetLanguage} 
                  onValueChange={(value) => {
                    console.log('Target language changed to:', value);
                    setTargetLanguage(value);
                  }} 
                  style={styles.picker}
                  dropdownIconColor={colors.text}
                >
                  {Object.entries(languages).map(([code, name]) => (
                    <Picker.Item key={code} label={name} value={code} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Input Text */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Enter Text:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type or speak..."
                placeholderTextColor={colors.textSecondary}
                multiline
                editable={!isProcessing}
              />
            </View>

            {/* Translate Button */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: isProcessing ? colors.textSecondary : colors.primary }]}
              onPress={handleTranslate}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>🔄 Translate</Text>
              )}
            </TouchableOpacity>

            {/* Translated Output */}
            {translatedText ? (
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Translation:</Text>
                <View style={[styles.output, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.outputText, { color: colors.text }]}>{translatedText}</Text>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.secondary }]}
                    onPress={handlePlayAudio}
                  >
                    <Text style={styles.buttonText}>🔊 Play</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.primary }]}
                    onPress={() => { setInputText(''); setTranslatedText(''); }}
                  >
                    <Text style={[styles.buttonText, { color: colors.primary }]}>🗑️ Clear</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    maxHeight: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeBtn: {
    fontSize: 28,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerBox: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  output: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    minHeight: 100,
  },
  outputText: {
    fontSize: 16,
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
});

export default TranslationModal;
