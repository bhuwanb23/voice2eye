/**
 * Simple Translation Test
 * Tests basic translation functionality that can be run in React Native
 */
import apiService from '../api/services/apiService';

const runSimpleTranslationTest = async () => {
  console.log('🚀 Starting Simple Translation Test');
  
  try {
    // Test 1: Get supported languages
    console.log('🔄 Testing getSupportedLanguages...');
    const languages = await apiService.getSupportedLanguages();
    console.log(`✅ Languages loaded: ${languages.count} languages available`);
    
    // Test 2: Translate text to multiple languages
    const testText = "Hello, how are you today?";
    const testLanguages = [
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' }
    ];
    
    console.log(`🔄 Testing translation to ${testLanguages.length} languages...`);
    
    let successCount = 0;
    for (const lang of testLanguages) {
      try {
        const result = await apiService.translateText(
          testText,
          'en',
          lang.code
        );
        
        if (result && result.translated_text) {
          console.log(`   ✅ ${lang.name}: ${result.translated_text}`);
          successCount++;
        } else {
          console.log(`   ❌ ${lang.name}: No translation returned`);
        }
      } catch (error) {
        console.log(`   ❌ ${lang.name}: ${error.message}`);
      }
    }
    
    console.log(`📊 Translation results: ${successCount}/${testLanguages.length} successful`);
    
    // Test 3: Language detection
    console.log('🔄 Testing language detection...');
    try {
      const detectionResult = await apiService.detectLanguage("Hola, como estas?");
      if (detectionResult && detectionResult.language) {
        console.log(`✅ Language detected: ${detectionResult.language} (confidence: ${detectionResult.confidence || 'N/A'})`);
      } else {
        console.log('❌ Language detection failed');
      }
    } catch (error) {
      console.log(`❌ Language detection error: ${error.message}`);
    }
    
    console.log('🎉 Simple Translation Test Completed!');
    
    return {
      success: successCount === testLanguages.length,
      passed: successCount,
      total: testLanguages.length
    };
    
  } catch (error) {
    console.error('💥 Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export for use in the app
export default runSimpleTranslationTest;

// If running directly (for testing)
if (typeof window === 'undefined') {
  // This would be for Node.js environment testing
  runSimpleTranslationTest()
    .then(result => {
      console.log('Final result:', result);
    })
    .catch(error => {
      console.error('Test error:', error);
    });
}