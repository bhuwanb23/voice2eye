/**
 * Simple Audio Playback Test
 * Demonstrates text-to-speech functionality
 */
import * as Speech from 'expo-speech';

const testAudioPlayback = async () => {
  console.log('🔊 Testing Audio Playback');
  
  // Test phrases in different languages
  const testPhrases = [
    { text: 'Hello, how are you?', language: 'en', label: 'English' },
    { text: 'Hola, ¿cómo estás?', language: 'es', label: 'Spanish' },
    { text: 'Bonjour, comment allez-vous?', language: 'fr', label: 'French' },
    { text: 'Hallo, wie geht es dir?', language: 'de', label: 'German' },
    { text: 'Ciao, come stai?', language: 'it', label: 'Italian' }
  ];
  
  for (const phrase of testPhrases) {
    console.log(`\n🗣️  Testing ${phrase.label} audio...`);
    
    // Play the audio
    Speech.speak(phrase.text, {
      language: phrase.language,
      pitch: 1.0,
      rate: 0.9,
      onDone: () => {
        console.log(`✅ ${phrase.label} audio completed`);
      },
      onError: (error) => {
        console.log(`❌ ${phrase.label} audio error:`, error);
      }
    });
    
    // Wait 3 seconds between phrases
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n🎉 Audio playback test completed!');
};

// Export for use in app
export default testAudioPlayback;

// Run directly for testing (in mobile environment)
if (typeof window !== 'undefined' && window.ReactNative) {
  // This would run in React Native environment
  testAudioPlayback();
}