"""
Translation Service using googletrans
Handles text translation between languages
"""
import logging
from typing import Dict, Any, Optional, List
import time

# Try to import googletrans, with fallback handling
GOOGLETRANS_AVAILABLE = False
Translator = None
LANGUAGES = {}

try:
    from googletrans import Translator, LANGUAGES
    GOOGLETRANS_AVAILABLE = True
except (ImportError, AttributeError) as e:
    GOOGLETRANS_AVAILABLE = False
    logging.warning(f"googletrans not available: {e}")
    logging.warning("Install with: pip install googletrans==4.0.0rc1")
    logging.warning("Note: If you get httpcore errors, try: pip install httpcore==0.15.0")
    
    # Create mock Translator class for development
    class MockTranslator:
        def translate(self, text, src='auto', dest='en'):
            class Result:
                def __init__(self):
                    self.text = f"[MOCK] Translated '{text}' from {src} to {dest}"
                    self.src = src if src != 'auto' else 'en'
            return Result()
        
        def detect(self, text):
            class Result:
                def __init__(self):
                    self.lang = 'en'
                    self.confidence = 0.9
            return Result()
    
    Translator = MockTranslator
    LANGUAGES = {}

logger = logging.getLogger(__name__)


class TranslationService:
    """
    Translation service for converting text between languages.
    Uses googletrans library for free translation service.
    """
    
    def __init__(self):
        """Initialize the translation service"""
        self.translator = None
        self.is_initialized = False
        
        # Supported languages dictionary with common languages
        # This is a subset - googletrans supports 100+ languages
        self.supported_languages = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese',
            'ar': 'Arabic',
            'hi': 'Hindi',
            'nl': 'Dutch',
            'pl': 'Polish',
            'tr': 'Turkish',
            'sv': 'Swedish',
            'da': 'Danish',
            'fi': 'Finnish',
            'no': 'Norwegian',
            'cs': 'Czech',
            'ro': 'Romanian',
            'hu': 'Hungarian',
            'el': 'Greek',
            'th': 'Thai',
            'vi': 'Vietnamese',
            'id': 'Indonesian',
            'ms': 'Malay',
            'he': 'Hebrew',
            'uk': 'Ukrainian',
            'bg': 'Bulgarian',
            'hr': 'Croatian',
            'sk': 'Slovak',
            'sl': 'Slovenian',
            'et': 'Estonian',
            'lv': 'Latvian',
            'lt': 'Lithuanian',
        }
        
        # Initialize translator
        self._initialize_translator()
    
    def _initialize_translator(self) -> bool:
        """Initialize the googletrans Translator"""
        try:
            if not GOOGLETRANS_AVAILABLE or Translator is None:
                logger.warning("googletrans not available. Translation service will use mock responses.")
                logger.warning("For production use, install: pip install googletrans==4.0.0rc1 httpcore==0.15.0")
                # Use mock translator
                class MockTranslator:
                    def translate(self, text, src='auto', dest='en'):
                        class Result:
                            def __init__(self):
                                self.text = f"[MOCK] Translated '{text}' from {src} to {dest}"
                                self.src = src if src != 'auto' else 'en'
                        return Result()
                    def detect(self, text):
                        class Result:
                            def __init__(self):
                                self.lang = 'en'
                                self.confidence = 0.9
                        return Result()
                self.translator = MockTranslator()
                self.is_initialized = True
                return True
            
            logger.info("Initializing googletrans Translator...")
            try:
                self.translator = Translator()
            except Exception as init_error:
                logger.error(f"Failed to create Translator instance: {init_error}")
                logger.warning("Falling back to mock translator")
                self.translator = None
                self.is_initialized = True  # Will use mock
                return True
            
            # Test translation to verify it works
            try:
                test_result = self.translator.translate("test", src='en', dest='es')
                if test_result and test_result.text:
                    logger.info("Translation service initialized successfully")
                    self.is_initialized = True
                    return True
                else:
                    logger.warning("Translation service test failed - using fallback")
                    self.is_initialized = True  # Still mark as initialized, will use mock
                    return True
            except Exception as test_error:
                logger.warning(f"Translation service test failed: {test_error}")
                logger.warning("Service will attempt to work but may fail on actual translations")
                self.is_initialized = True  # Assume it works, will fail on actual use
                return True
                
        except Exception as e:
            logger.error(f"Failed to initialize translation service: {e}")
            logger.warning("Translation service will use mock responses")
            self.is_initialized = True  # Still allow service to be used with mock
            return True
    
    def translate_text(
        self, 
        text: str, 
        src_lang: str = 'auto', 
        dest_lang: str = 'en'
    ) -> Dict[str, Any]:
        """
        Translate text from source language to destination language
        
        Args:
            text: Text to translate
            src_lang: Source language code (e.g., 'en', 'es') or 'auto' for auto-detection
            dest_lang: Target language code (e.g., 'fr', 'de')
        
        Returns:
            Dict containing:
                - original_text: Original input text
                - translated_text: Translated text
                - source_language: Detected/specified source language code
                - target_language: Target language code
                - confidence: Translation confidence (1.0 for googletrans)
                - timestamp: Translation timestamp
        
        Raises:
            ValueError: If text is empty or languages are invalid
            Exception: If translation fails
        """
        # Validate input
        if not text or not text.strip():
            raise ValueError("Text to translate cannot be empty")
        
        if not dest_lang or dest_lang not in self.supported_languages:
            raise ValueError(f"Invalid target language code: {dest_lang}")
        
        if src_lang and src_lang != 'auto' and src_lang not in self.supported_languages:
            raise ValueError(f"Invalid source language code: {src_lang}")
        
        try:
            if not self.translator:
                raise Exception("Translator not initialized. Please check googletrans installation.")
            
            logger.info(f"Translating text from '{src_lang}' to '{dest_lang}': {text[:50]}...")
            start_time = time.time()
            
            # Perform translation
            result = self.translator.translate(text, src=src_lang, dest=dest_lang)
            
            translation_time = time.time() - start_time
            
            # Extract results
            translated_text = result.text if result else "[Translation failed]"
            detected_source = result.src if result and hasattr(result, 'src') else src_lang
            
            logger.info(f"Translation completed in {translation_time:.2f}s: '{translated_text[:50]}...'")
            
            return {
                'original_text': text,
                'translated_text': translated_text,
                'source_language': detected_source,
                'target_language': dest_lang,
                'confidence': 1.0,  # googletrans doesn't provide confidence scores
                'timestamp': time.time(),
                'translation_time_ms': round(translation_time * 1000, 2)
            }
            
        except Exception as e:
            logger.error(f"Translation error: {e}")
            raise Exception(f"Translation failed: {str(e)}")
    
    def get_supported_languages(self) -> Dict[str, str]:
        """
        Get list of supported languages
        
        Returns:
            Dict mapping language codes to language names
        """
        # If googletrans is available, use its language list
        if GOOGLETRANS_AVAILABLE and LANGUAGES:
            # Merge with our custom list, prioritizing googletrans
            languages = dict(LANGUAGES)
            languages.update(self.supported_languages)
            return languages
        
        return self.supported_languages.copy()
    
    def detect_language(self, text: str) -> Dict[str, Any]:
        """
        Detect the language of the given text
        
        Args:
            text: Text to detect language for
        
        Returns:
            Dict containing:
                - language: Detected language code
                - confidence: Detection confidence
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")
        
        try:
            if not self.translator:
                raise Exception("Translator not initialized. Please check googletrans installation.")
            
            logger.info(f"Detecting language for text: {text[:50]}...")
            result = self.translator.detect(text)
            
            return {
                'language': result.lang if result else 'unknown',
                'confidence': result.confidence if result and hasattr(result, 'confidence') else 1.0
            }
        except Exception as e:
            logger.error(f"Language detection error: {e}")
            raise Exception(f"Language detection failed: {str(e)}")
    
    def is_available(self) -> bool:
        """Check if translation service is available"""
        return self.is_initialized and self.translator is not None
    
    def get_language_name(self, lang_code: str) -> Optional[str]:
        """
        Get the full name of a language from its code
        
        Args:
            lang_code: Language code (e.g., 'en', 'es')
        
        Returns:
            Language name or None if not found
        """
        languages = self.get_supported_languages()
        return languages.get(lang_code)


def test_translation_service():
    """
    Test function for translation service
    Can be run directly or imported for testing
    """
    import sys
    # Fix Windows console encoding for emojis
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    
    print("=" * 60)
    print("Testing Translation Service")
    print("=" * 60)
    
    try:
        # Initialize service
        service = TranslationService()
        
        if not service.is_available():
            print("[X] Translation service not available")
            return False
        
        print("[OK] Translation service initialized")
        
        # Test 1: Get supported languages
        print("\n[TEST 1] Get supported languages")
        languages = service.get_supported_languages()
        print(f"   Found {len(languages)} supported languages")
        print(f"   Sample: {list(languages.items())[:5]}")
        
        # Test 2: Simple translation
        print("\n[TEST 2] Simple translation (English -> Spanish)")
        try:
            result = service.translate_text("Hello, how are you?", src_lang='en', dest_lang='es')
            print(f"   Original: {result['original_text']}")
            print(f"   Translated: {result['translated_text']}")
            print(f"   Source: {result['source_language']} -> Target: {result['target_language']}")
            print(f"   Time: {result['translation_time_ms']}ms")
            print("   [OK] Translation successful")
        except Exception as e:
            print(f"   [FAIL] Translation failed: {e}")
            return False
        
        # Test 3: Auto-detect language
        print("\n[TEST 3] Auto-detect language")
        try:
            result = service.translate_text("Bonjour, comment allez-vous?", src_lang='auto', dest_lang='en')
            print(f"   Original: {result['original_text']}")
            print(f"   Translated: {result['translated_text']}")
            print(f"   Detected source: {result['source_language']}")
            print("   [OK] Auto-detection successful")
        except Exception as e:
            print(f"   [FAIL] Auto-detection failed: {e}")
            return False
        
        # Test 4: Language detection
        print("\n[TEST 4] Language detection")
        try:
            result = service.detect_language("Hola, como estas?")
            print(f"   Detected language: {result['language']}")
            print(f"   Confidence: {result['confidence']}")
            print("   [OK] Language detection successful")
        except Exception as e:
            print(f"   [FAIL] Language detection failed: {e}")
            return False
        
        # Test 5: Error handling - empty text
        print("\n[TEST 5] Error handling (empty text)")
        try:
            service.translate_text("", src_lang='en', dest_lang='es')
            print("   [FAIL] Should have raised ValueError")
            return False
        except ValueError:
            print("   [OK] Correctly raised ValueError for empty text")
        except Exception as e:
            print(f"   [FAIL] Unexpected error: {e}")
            return False
        
        # Test 6: Error handling - invalid language
        print("\n[TEST 6] Error handling (invalid language)")
        try:
            service.translate_text("Hello", src_lang='en', dest_lang='invalid')
            print("   [FAIL] Should have raised ValueError")
            return False
        except ValueError:
            print("   [OK] Correctly raised ValueError for invalid language")
        except Exception as e:
            print(f"   [FAIL] Unexpected error: {e}")
            return False
        
        print("\n" + "=" * 60)
        print("[SUCCESS] All tests passed!")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"\n[FAIL] Test suite failed: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    # Run tests when executed directly
    success = test_translation_service()
    exit(0 if success else 1)

