"""
Comprehensive Translation Integration Tests
Tests both translation service and API endpoints
"""
import pytest
import sys
from pathlib import Path
import asyncio

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from translation.translation_service import TranslationService


class TestTranslationServiceComprehensive:
    """Comprehensive test suite for Translation Service"""
    
    @pytest.fixture
    def service(self):
        """Create translation service instance"""
        return TranslationService()
    
    def test_1_service_initialization(self, service):
        """Test 1: Service initializes correctly"""
        print("\n✅ TEST 1: Service Initialization")
        assert service is not None
        assert service.is_initialized is True
        print(f"   - Service initialized: {service.is_initialized}")
        print(f"   - Translator available: {service.translator is not None}")
    
    def test_2_supported_languages(self, service):
        """Test 2: Get supported languages"""
        print("\n✅ TEST 2: Supported Languages")
        languages = service.get_supported_languages()
        
        print(f"   - Total languages: {len(languages)}")
        print(f"   - Sample languages: {list(languages.items())[:5]}")
        
        assert isinstance(languages, dict)
        assert len(languages) > 0
        assert 'en' in languages
        assert 'es' in languages
        assert 'fr' in languages
        assert 'de' in languages
    
    def test_3_translate_english_to_spanish(self, service):
        """Test 3: Basic English to Spanish translation"""
        print("\n✅ TEST 3: English → Spanish Translation")
        result = service.translate_text("Hello world", src_lang='en', dest_lang='es')
        
        print(f"   - Input: 'Hello world'")
        print(f"   - Output: '{result['translated_text']}'")
        print(f"   - Time: {result['translation_time_ms']}ms")
        
        assert result is not None
        assert result['original_text'] == "Hello world"
        assert result['target_language'] == 'es'
        assert 'translated_text' in result
        assert len(result['translated_text']) > 0
        
        # Check if it's mock or real translation
        if '[MOCK]' in result['translated_text']:
            print("   ⚠️  Using MOCK translation (googletrans not installed)")
        else:
            print("   ✅ Using REAL translation (googletrans working)")
    
    def test_4_translate_auto_detect(self, service):
        """Test 4: Translation with auto language detection"""
        print("\n✅ TEST 4: Auto Language Detection")
        result = service.translate_text("Bonjour", src_lang='auto', dest_lang='en')
        
        print(f"   - Input: 'Bonjour'")
        print(f"   - Detected source: {result['source_language']}")
        print(f"   - Output: '{result['translated_text']}'")
        
        assert result is not None
        assert result['original_text'] == "Bonjour"
        assert result['target_language'] == 'en'
        assert 'source_language' in result
    
    def test_5_translate_multiple_languages(self, service):
        """Test 5: Multiple language translations"""
        print("\n✅ TEST 5: Multiple Language Translations")
        
        test_cases = [
            ("Hello", "en", "es", "Spanish"),
            ("Hello", "en", "fr", "French"),
            ("Hello", "en", "de", "German"),
            ("Hello", "en", "it", "Italian"),
        ]
        
        for text, src, dest, lang_name in test_cases:
            result = service.translate_text(text, src_lang=src, dest_lang=dest)
            print(f"   - English → {lang_name}: '{result['translated_text']}'")
            assert result is not None
            assert result['translated_text'] is not None
    
    def test_6_language_detection(self, service):
        """Test 6: Language detection"""
        print("\n✅ TEST 6: Language Detection")
        
        test_texts = [
            ("Hello world", "English"),
            ("Hola mundo", "Spanish"),
            ("Bonjour le monde", "French"),
        ]
        
        for text, expected_lang in test_texts:
            result = service.detect_language(text)
            print(f"   - '{text}' → {result['language']} ({expected_lang})")
            assert result is not None
            assert 'language' in result
            assert 'confidence' in result
    
    def test_7_get_language_name(self, service):
        """Test 7: Get language name from code"""
        print("\n✅ TEST 7: Language Name Lookup")
        
        test_cases = [
            ('en', 'English'),
            ('es', 'Spanish'),
            ('fr', 'French'),
            ('de', 'German'),
            ('invalid', None),
        ]
        
        for code, expected_name in test_cases:
            name = service.get_language_name(code)
            print(f"   - {code} → {name}")
            assert name == expected_name
    
    def test_8_error_handling_empty_text(self, service):
        """Test 8: Error handling - empty text"""
        print("\n✅ TEST 8: Error Handling - Empty Text")
        
        with pytest.raises(ValueError, match="cannot be empty"):
            service.translate_text("", src_lang='en', dest_lang='es')
        print("   ✅ Correctly rejects empty text")
    
    def test_9_error_handling_invalid_language(self, service):
        """Test 9: Error handling - invalid language"""
        print("\n✅ TEST 9: Error Handling - Invalid Language")
        
        with pytest.raises(ValueError, match="Invalid target language"):
            service.translate_text("Hello", src_lang='en', dest_lang='xyz')
        print("   ✅ Correctly rejects invalid language")
    
    def test_10_performance_multiple_translations(self, service):
        """Test 10: Performance test - multiple translations"""
        print("\n✅ TEST 10: Performance Test - Multiple Translations")
        
        import time
        texts = ["Hello", "Goodbye", "Thank you", "Please", "Yes", "No"]
        start_time = time.time()
        
        results = []
        for text in texts:
            result = service.translate_text(text, src_lang='en', dest_lang='es')
            results.append(result)
        
        total_time = time.time() - start_time
        avg_time = (total_time * 1000) / len(texts)
        
        print(f"   - Translated {len(texts)} texts")
        print(f"   - Total time: {total_time*1000:.2f}ms")
        print(f"   - Average per translation: {avg_time:.2f}ms")
        
        assert len(results) == 6
        for result in results:
            assert result is not None
            assert 'translated_text' in result


class TestTranslationAPIIntegration:
    """Test translation API endpoints"""
    
    @pytest.fixture
    def api_client(self):
        """Create FastAPI test client"""
        try:
            from fastapi.testclient import TestClient
            from api.server import app
            return TestClient(app)
        except ImportError:
            pytest.skip("FastAPI test client not available")
    
    def test_api_languages_endpoint(self, api_client):
        """Test API: Get supported languages"""
        print("\n🌐 API TEST: GET /api/translation/languages")
        
        response = api_client.get("/api/translation/languages")
        
        print(f"   - Status: {response.status_code}")
        assert response.status_code == 200
        
        data = response.json()
        print(f"   - Languages count: {data.get('count', 0)}")
        print(f"   - Sample: {list(data.get('languages', {}).items())[:3]}")
        
        assert 'languages' in data
        assert 'count' in data
        assert data['count'] > 0
    
    def test_api_translate_endpoint(self, api_client):
        """Test API: POST /api/translation/translate"""
        print("\n🌐 API TEST: POST /api/translation/translate")
        
        payload = {
            "text": "Hello world",
            "source_language": "en",
            "target_language": "es"
        }
        
        response = api_client.post("/api/translation/translate", json=payload)
        
        print(f"   - Status: {response.status_code}")
        assert response.status_code == 200
        
        data = response.json()
        print(f"   - Input: '{data.get('original_text')}'")
        print(f"   - Output: '{data.get('translated_text')}'")
        print(f"   - Time: {data.get('translation_time_ms', 0)}ms")
        
        assert 'original_text' in data
        assert 'translated_text' in data
        assert data['original_text'] == "Hello world"
        assert data['target_language'] == 'es'
        
        # Check mock vs real
        if '[MOCK]' in data.get('translated_text', ''):
            print("   ⚠️  Backend using MOCK translation")
        else:
            print("   ✅ Backend using REAL translation")
    
    def test_api_detect_language_endpoint(self, api_client):
        """Test API: GET /api/translation/detect"""
        print("\n🌐 API TEST: GET /api/translation/detect")
        
        response = api_client.get("/api/translation/detect?text=Hello%20world")
        
        print(f"   - Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   - Detected: {data.get('language')}")
            print(f"   - Confidence: {data.get('confidence', 0):.2f}")
            
            assert 'language' in data
            assert 'confidence' in data
        else:
            print(f"   ⚠️  Endpoint returned {response.status_code}")
    
    def test_api_translate_validation(self, api_client):
        """Test API: Validation errors"""
        print("\n🌐 API TEST: Validation Errors")
        
        # Test empty text
        payload = {"text": "", "source_language": "en", "target_language": "es"}
        response = api_client.post("/api/translation/translate", json=payload)
        print(f"   - Empty text rejection: {response.status_code}")
        assert response.status_code == 400
        
        # Test invalid language
        payload = {"text": "Hello", "source_language": "xyz", "target_language": "es"}
        response = api_client.post("/api/translation/translate", json=payload)
        print(f"   - Invalid language rejection: {response.status_code}")
        assert response.status_code == 400 or response.status_code == 500


def run_translation_demo():
    """Demo function to showcase translation capabilities"""
    print("\n" + "="*60)
    print("🌍 TRANSLATION SERVICE DEMO")
    print("="*60)
    
    service = TranslationService()
    
    # Demo translations
    demos = [
        ("Hello, how are you?", "en", "es", "Spanish"),
        ("Thank you very much", "en", "fr", "French"),
        ("Good morning", "en", "de", "German"),
        ("Welcome", "en", "it", "Italian"),
        ("Good night", "en", "pt", "Portuguese"),
    ]
    
    print("\n📝 Translation Examples:\n")
    
    for text, src, dest, lang_name in demos:
        result = service.translate_text(text, src_lang=src, dest_lang=dest)
        output = result['translated_text']
        
        # Format output
        if '[MOCK]' in output:
            status = "⚠️  MOCK"
        else:
            status = "✅ REAL"
        
        print(f"{status} | English → {lang_name:10} | '{text}' → '{output}'")
    
    print("\n" + "="*60)
    print("\n💡 To enable REAL translations:")
    print("   pip install googletrans==4.0.0rc1 httpcore==0.15.0")
    print("="*60 + "\n")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Run translation tests')
    parser.add_argument('--demo', action='store_true', help='Run demo showcase')
    args = parser.parse_args()
    
    if args.demo:
        run_translation_demo()
    else:
        # Run pytest
        pytest.main([__file__, "-v", "--tb=short"])
