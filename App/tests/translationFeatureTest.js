/**
 * Translation Feature Test Suite
 * Tests all translation functionality on mobile device
 */
import React from 'react';
import { Alert } from 'react-native';
import apiService from '../api/services/apiService';

class TranslationFeatureTest {
  constructor() {
    this.testResults = [];
  }

  logResult(testName, status, message = '') {
    const result = {
      test: testName,
      status: status ? 'PASS' : 'FAIL',
      message: message,
      timestamp: new Date().toISOString()
    };
    this.testResults.push(result);
    console.log(`[${result.status}] ${testName}: ${message}`);
  }

  async testGetSupportedLanguages() {
    try {
      console.log('Testing getSupportedLanguages...');
      const result = await apiService.getSupportedLanguages();
      
      if (result && result.languages) {
        const languageCount = Object.keys(result.languages).length;
        this.logResult(
          'Get Supported Languages',
          languageCount > 0,
          `Retrieved ${languageCount} languages`
        );
        return languageCount > 0;
      } else {
        this.logResult(
          'Get Supported Languages',
          false,
          'Invalid response format'
        );
        return false;
      }
    } catch (error) {
      this.logResult(
        'Get Supported Languages',
        false,
        `Error: ${error.message}`
      );
      return false;
    }
  }

  async testTranslateText() {
    try {
      console.log('Testing translateText...');
      const result = await apiService.translateText(
        'Hello, how are you today?',
        'en',
        'es'
      );
      
      if (result && result.translated_text) {
        const isMock = result.translated_text.includes('[MOCK]');
        this.logResult(
          'Translate Text',
          true,
          `Translation: ${result.translated_text} ${isMock ? '(MOCK)' : '(REAL)'}`
        );
        return true;
      } else {
        this.logResult(
          'Translate Text',
          false,
          'Invalid response format'
        );
        return false;
      }
    } catch (error) {
      this.logResult(
        'Translate Text',
        false,
        `Error: ${error.message}`
      );
      return false;
    }
  }

  async testDetectLanguage() {
    try {
      console.log('Testing detectLanguage...');
      const result = await apiService.detectLanguage('Hola, como estas?');
      
      if (result && result.language) {
        this.logResult(
          'Detect Language',
          true,
          `Detected language: ${result.language} (confidence: ${result.confidence || 'N/A'})`
        );
        return true;
      } else {
        this.logResult(
          'Detect Language',
          false,
          'Invalid response format'
        );
        return false;
      }
    } catch (error) {
      this.logResult(
        'Detect Language',
        false,
        `Error: ${error.message}`
      );
      return false;
    }
  }

  async testLanguageSwap() {
    try {
      console.log('Testing language swap functionality...');
      
      // Translate English to Spanish
      const spanishResult = await apiService.translateText(
        'Good morning',
        'en',
        'es'
      );
      
      // Translate Spanish back to English
      const englishResult = await apiService.translateText(
        spanishResult.translated_text,
        'es',
        'en'
      );
      
      const success = spanishResult.translated_text && englishResult.translated_text;
      this.logResult(
        'Language Swap',
        success,
        `EN->ES: ${spanishResult.translated_text}, ES->EN: ${englishResult.translated_text}`
      );
      return success;
    } catch (error) {
      this.logResult(
        'Language Swap',
        false,
        `Error: ${error.message}`
      );
      return false;
    }
  }

  async testMultipleLanguages() {
    try {
      console.log('Testing multiple language translations...');
      const testText = 'Hello world';
      const languages = ['es', 'fr', 'de', 'it', 'pt'];
      
      let successCount = 0;
      for (const lang of languages) {
        try {
          const result = await apiService.translateText(testText, 'en', lang);
          if (result && result.translated_text) {
            successCount++;
          }
        } catch (e) {
          console.log(`Failed to translate to ${lang}: ${e.message}`);
        }
      }
      
      const success = successCount === languages.length;
      this.logResult(
        'Multiple Languages',
        success,
        `Successfully translated to ${successCount}/${languages.length} languages`
      );
      return success;
    } catch (error) {
      this.logResult(
        'Multiple Languages',
        false,
        `Error: ${error.message}`
      );
      return false;
    }
  }

  async runAllTests() {
    console.log('Starting Translation Feature Test Suite...');
    this.testResults = [];
    
    // Run all tests
    await this.testGetSupportedLanguages();
    await this.testTranslateText();
    await this.testDetectLanguage();
    await this.testLanguageSwap();
    await this.testMultipleLanguages();
    
    // Summary
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const totalTests = this.testResults.length;
    
    console.log('\n=== TRANSLATION TEST SUMMARY ===');
    console.log(`Passed: ${passedTests}/${totalTests}`);
    
    this.testResults.forEach(result => {
      console.log(`[${result.status}] ${result.test}: ${result.message}`);
    });
    
    console.log('=== END TEST SUMMARY ===\n');
    
    return {
      passed: passedTests,
      total: totalTests,
      results: this.testResults
    };
  }
}

// Export test function for use in the app
export const runTranslationTests = async () => {
  const tester = new TranslationFeatureTest();
  return await tester.runAllTests();
};

// Export component for UI integration
export const TranslationTestComponent = () => {
  const runTests = async () => {
    try {
      const results = await runTranslationTests();
      
      Alert.alert(
        'Translation Tests Complete',
        `Passed: ${results.passed}/${results.total}\n\nCheck console for details.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Test Error',
        `Failed to run tests: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  return null; // This component is just for testing
};

export default TranslationFeatureTest;