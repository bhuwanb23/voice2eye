"""
Unit tests for Translation Service
"""
import pytest
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from translation.translation_service import TranslationService


class TestTranslationService:
    """Test suite for TranslationService"""
    
    def test_service_initialization(self):
        """Test that service initializes correctly"""
        service = TranslationService()
        assert service is not None
        assert service.is_initialized is True
    
    def test_get_supported_languages(self):
        """Test getting supported languages"""
        service = TranslationService()
        languages = service.get_supported_languages()
        
        assert isinstance(languages, dict)
        assert len(languages) > 0
        assert 'en' in languages
        assert 'es' in languages
        assert languages['en'] == 'English'
        assert languages['es'] == 'Spanish'
    
    def test_translate_text_basic(self):
        """Test basic text translation"""
        service = TranslationService()
        
        result = service.translate_text("Hello", src_lang='en', dest_lang='es')
        
        assert result is not None
        assert 'original_text' in result
        assert 'translated_text' in result
        assert 'source_language' in result
        assert 'target_language' in result
        assert 'confidence' in result
        assert 'timestamp' in result
        assert 'translation_time_ms' in result
        
        assert result['original_text'] == "Hello"
        assert result['target_language'] == 'es'
        assert isinstance(result['translated_text'], str)
        assert len(result['translated_text']) > 0
    
    def test_translate_text_auto_detect(self):
        """Test translation with auto language detection"""
        service = TranslationService()
        
        result = service.translate_text("Bonjour", src_lang='auto', dest_lang='en')
        
        assert result is not None
        assert result['original_text'] == "Bonjour"
        assert result['target_language'] == 'en'
        assert 'source_language' in result
    
    def test_detect_language(self):
        """Test language detection"""
        service = TranslationService()
        
        result = service.detect_language("Hello world")
        
        assert result is not None
        assert 'language' in result
        assert 'confidence' in result
        assert isinstance(result['language'], str)
        assert isinstance(result['confidence'], (int, float))
    
    def test_get_language_name(self):
        """Test getting language name from code"""
        service = TranslationService()
        
        name = service.get_language_name('en')
        assert name == 'English'
        
        name = service.get_language_name('es')
        assert name == 'Spanish'
        
        name = service.get_language_name('invalid')
        assert name is None
    
    def test_translate_empty_text_error(self):
        """Test that empty text raises ValueError"""
        service = TranslationService()
        
        with pytest.raises(ValueError, match="cannot be empty"):
            service.translate_text("", src_lang='en', dest_lang='es')
    
    def test_translate_invalid_target_language(self):
        """Test that invalid target language raises ValueError"""
        service = TranslationService()
        
        with pytest.raises(ValueError, match="Invalid target language"):
            service.translate_text("Hello", src_lang='en', dest_lang='invalid')
    
    def test_translate_invalid_source_language(self):
        """Test that invalid source language raises ValueError"""
        service = TranslationService()
        
        with pytest.raises(ValueError, match="Invalid source language"):
            service.translate_text("Hello", src_lang='invalid', dest_lang='es')
    
    def test_detect_language_empty_text_error(self):
        """Test that empty text in detection raises ValueError"""
        service = TranslationService()
        
        with pytest.raises(ValueError, match="cannot be empty"):
            service.detect_language("")
    
    def test_is_available(self):
        """Test service availability check"""
        service = TranslationService()
        
        # Service should be available even with mock translator
        assert service.is_available() is True
    
    def test_multiple_translations(self):
        """Test multiple translations"""
        service = TranslationService()
        
        texts = ["Hello", "Goodbye", "Thank you"]
        results = []
        
        for text in texts:
            result = service.translate_text(text, src_lang='en', dest_lang='es')
            results.append(result)
        
        assert len(results) == 3
        for result in results:
            assert result is not None
            assert 'translated_text' in result


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

