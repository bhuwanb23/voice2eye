"""
Translation Service using deep-translator
Handles text translation between languages
"""
import logging
from typing import Dict, Any, Optional, List
import time

# Try to import deep-translator, with fallback handling
DEEP_TRANSLATOR_AVAILABLE = False
GoogleTranslator = None
LANGUAGES = {}

try:
    from deep_translator import GoogleTranslator
    # Get supported languages
    LANGUAGES = GoogleTranslator().get_supported_languages(as_dict=True)
    DEEP_TRANSLATOR_AVAILABLE = True
    logging.info("deep-translator loaded successfully")
except (ImportError, AttributeError) as e:
    DEEP_TRANSLATOR_AVAILABLE = False
    logging.warning(f"deep-translator not available: {e}")
    logging.warning("Install with: pip install deep-translator")
    
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
    
    GoogleTranslator = MockTranslator
    LANGUAGES = {}

logger = logging.getLogger(__name__)


class TranslationService:
    """
    Translation service for converting text between languages.
    Uses deep-translator library for free translation service.
    """
    
    def __init__(self):
        """Initialize the translation service"""
        self.translator = None
        self.is_initialized = False
        
        # Supported languages dictionary with common languages
        # This is a subset - deep-translator supports 100+ languages
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
        """Initialize the deep-translator Translator"""
        try:
            if not DEEP_TRANSLATOR_AVAILABLE or GoogleTranslator is None:
                logger.warning("deep-translator not available. Translation service will use mock responses.")
                logger.warning("For production use, install: pip install deep-translator")
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
            
            logger.info("Initializing deep-translator GoogleTranslator...")
            try:
                # deep-translator doesn't have a persistent translator object
                # We create instances per translation
                self.translator = GoogleTranslator
                self.is_initialized = True
                logger.info("Translation service initialized successfully with deep-translator")
                return True
                
            except Exception as init_error:
                logger.error(f"Failed to create Translator instance: {init_error}")
                logger.warning("Falling back to mock translator")
                self.translator = None
                self.is_initialized = True  # Will use mock
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
                raise Exception("Translator not initialized. Please check deep-translator installation.")
            
            logger.info(f"Translating text from '{src_lang}' to '{dest_lang}': {text[:50]}...")
            start_time = time.time()
            
            # Perform translation using deep-translator
            if src_lang == 'auto':
                # Auto-detect source language
                translator_instance = self.translator(source='auto', target=dest_lang)
            else:
                translator_instance = self.translator(source=src_lang, target=dest_lang)
            
            translated_text = translator_instance.translate(text)
            
            translation_time = time.time() - start_time
            
            # Extract results
            detected_source = src_lang  # deep-translator doesn't provide detected source
            
            logger.info(f"Translation completed in {translation_time:.2f}s: '{translated_text[:50]}...'")
            
            return {
                'original_text': text,
                'translated_text': translated_text,
                'source_language': detected_source,
                'target_language': dest_lang,
                'confidence': 1.0,  # deep-translator doesn't provide confidence scores
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
        # If deep-translator is available, use its language list
        if DEEP_TRANSLATOR_AVAILABLE and LANGUAGES:
            # Merge with our custom list, prioritizing deep-translator
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
                raise Exception("Translator not initialized. Please check deep-translator installation.")
            
            logger.info(f"Detecting language for text: {text[:50]}...")
            
            # Use LanguageDetector from deep-translator
            try:
                from deep_translator import LanguageDetector
                detector = LanguageDetector()
                detected_lang = detector.detect(text=text)
                
                return {
                    'language': detected_lang if detected_lang else 'unknown',
                    'confidence': 1.0  # deep-translator doesn't provide confidence
                }
            except ImportError:
                # Fallback: assume English if detection not available
                logger.warning("LanguageDetector not available, defaulting to 'en'")
                return {
                    'language': 'en',
                    'confidence': 0.5
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
