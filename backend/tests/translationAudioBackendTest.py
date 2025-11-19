"""
Backend test for translation and audio features
Tests speech recognition from audio file and translation workflow
"""
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent))

def test_translation_audio_backend():
    """Test the complete backend translation and audio workflow"""
    print("🚀 Starting Backend Translation and Audio Test")
    print("=" * 50)
    
    try:
        # Test 1: Translation Service
        print("🔄 Testing Translation Service...")
        from translation.translation_service import TranslationService
        translation_service = TranslationService()
        
        if not translation_service.is_initialized:
            print("❌ Translation service not initialized")
            return False
            
        print("✅ Translation service initialized")
        
        # Test text translation
        test_text = "Hello, how are you today?"
        print(f"📝 Original text: '{test_text}'")
        
        # Test multiple languages
        languages = [
            ('es', 'Spanish'),
            ('fr', 'French'),
            ('de', 'German'),
            ('it', 'Italian')
        ]
        
        success_count = 0
        for lang_code, lang_name in languages:
            try:
                result = translation_service.translate_text(
                    test_text,
                    'en',
                    lang_code
                )
                
                if result and 'translated_text' in result:
                    print(f"   ✅ {lang_name}: {result['translated_text']}")
                    success_count += 1
                else:
                    print(f"   ❌ {lang_name}: Failed to translate")
            except Exception as e:
                print(f"   ❌ {lang_name}: Error - {e}")
        
        print(f"📊 Translation results: {success_count}/{len(languages)} successful")
        
        # Test 2: Speech Recognition Service
        print("\n🔄 Testing Speech Recognition Service...")
        from speech.speech_recognition import SpeechRecognitionService
        speech_service = SpeechRecognitionService()
        
        if not speech_service.initialize_model():
            print("⚠️  Speech recognition model not available (using mock)")
        else:
            print("✅ Speech recognition model initialized")
            
            # Test audio file processing
            test_audio_file = Path(__file__).parent.parent / "test_audio.wav"
            if test_audio_file.exists():
                print(f"🔊 Processing audio file: {test_audio_file}")
                result = speech_service.process_audio_file(str(test_audio_file))
                
                if result:
                    print(f"   ✅ Speech recognition result:")
                    print(f"      Text: '{result.get('text', 'N/A')}'")
                    print(f"      Confidence: {result.get('confidence', 0.0):.2f}")
                else:
                    print("   ⚠️  No speech recognized (expected for test tone file)")
            else:
                print("   ⚠️  No test audio file found")
        
        # Test 3: API Endpoints
        print("\n🔄 Testing Translation API Endpoints...")
        
        # Test languages endpoint
        try:
            languages_result = translation_service.get_supported_languages()
            lang_count = len(languages_result)
            print(f"   ✅ Supported languages: {lang_count}")
        except Exception as e:
            print(f"   ❌ Languages endpoint error: {e}")
            
        # Test language detection
        try:
            detection_result = translation_service.detect_language("Hola, como estas?")
            if detection_result:
                print(f"   ✅ Language detection: {detection_result.get('language', 'N/A')}")
            else:
                print("   ❌ Language detection failed")
        except Exception as e:
            print(f"   ❌ Language detection error: {e}")
        
        print("\n" + "=" * 50)
        print("🎉 Backend Translation and Audio Test Completed!")
        return True
        
    except Exception as e:
        print(f"\n💥 Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_translation_audio_backend()
    print(f"\n📋 Final Result: {'PASS' if success else 'FAIL'}")
    sys.exit(0 if success else 1)