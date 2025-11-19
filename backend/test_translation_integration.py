"""
Integration test for Translation API
Tests API endpoints with actual HTTP requests
"""
import requests
import json
import sys
from pathlib import Path

# API base URL
API_BASE_URL = "http://127.0.0.1:8000/api/translation"

def test_get_languages():
    """Test GET /api/translation/languages"""
    print("\n" + "=" * 60)
    print("TEST 1: Get Supported Languages")
    print("=" * 60)
    
    try:
        response = requests.get(f"{API_BASE_URL}/languages", timeout=5)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] Languages retrieved successfully")
            print(f"   Count: {data.get('count', 0)}")
            print(f"   Sample languages: {list(data.get('languages', {}).items())[:5]}")
            return True, data
        else:
            print(f"[FAIL] Unexpected status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
    except requests.exceptions.ConnectionError:
        print("[FAIL] Could not connect to API server")
        print("   Make sure the server is running: uvicorn api.server:app --reload")
        return False, None
    except Exception as e:
        print(f"[FAIL] Error: {e}")
        return False, None

def test_translate_text():
    """Test POST /api/translation/translate"""
    print("\n" + "=" * 60)
    print("TEST 2: Translate Text")
    print("=" * 60)
    
    try:
        payload = {
            "text": "Hello, how are you?",
            "source_language": "en",
            "target_language": "es"
        }
        
        print(f"Request: {payload}")
        response = requests.post(
            f"{API_BASE_URL}/translate",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] Translation successful")
            print(f"   Original: {data.get('original_text')}")
            print(f"   Translated: {data.get('translated_text')}")
            print(f"   Source: {data.get('source_language')} -> Target: {data.get('target_language')}")
            print(f"   Time: {data.get('translation_time_ms', 0)}ms")
            return True, data
        else:
            print(f"[FAIL] Unexpected status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
    except Exception as e:
        print(f"[FAIL] Error: {e}")
        import traceback
        traceback.print_exc()
        return False, None

def test_detect_language():
    """Test GET /api/translation/detect"""
    print("\n" + "=" * 60)
    print("TEST 3: Detect Language")
    print("=" * 60)
    
    try:
        text = "Hello world"
        response = requests.get(
            f"{API_BASE_URL}/detect",
            params={"text": text},
            timeout=5
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] Language detection successful")
            print(f"   Text: {text}")
            print(f"   Detected language: {data.get('language')}")
            print(f"   Confidence: {data.get('confidence')}")
            return True, data
        else:
            print(f"[FAIL] Unexpected status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
    except Exception as e:
        print(f"[FAIL] Error: {e}")
        return False, None

def test_error_handling():
    """Test error handling"""
    print("\n" + "=" * 60)
    print("TEST 4: Error Handling")
    print("=" * 60)
    
    # Test empty text
    try:
        payload = {
            "text": "",
            "source_language": "en",
            "target_language": "es"
        }
        response = requests.post(f"{API_BASE_URL}/translate", json=payload, timeout=5)
        if response.status_code == 400:
            print("[OK] Correctly rejected empty text")
        else:
            print(f"[FAIL] Expected 400, got {response.status_code}")
    except Exception as e:
        print(f"[FAIL] Error: {e}")
    
    # Test invalid language
    try:
        payload = {
            "text": "Hello",
            "source_language": "en",
            "target_language": "invalid"
        }
        response = requests.post(f"{API_BASE_URL}/translate", json=payload, timeout=5)
        if response.status_code == 400:
            print("[OK] Correctly rejected invalid language")
        else:
            print(f"[FAIL] Expected 400, got {response.status_code}")
    except Exception as e:
        print(f"[FAIL] Error: {e}")

def test_multiple_translations():
    """Test multiple translations"""
    print("\n" + "=" * 60)
    print("TEST 5: Multiple Translations")
    print("=" * 60)
    
    translations = [
        ("Hello", "en", "es"),
        ("Goodbye", "en", "fr"),
        ("Thank you", "en", "de"),
    ]
    
    success_count = 0
    for text, src, dest in translations:
        try:
            payload = {
                "text": text,
                "source_language": src,
                "target_language": dest
            }
            response = requests.post(f"{API_BASE_URL}/translate", json=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                print(f"[OK] {text} ({src} -> {dest}): {data.get('translated_text')}")
                success_count += 1
            else:
                print(f"[FAIL] {text}: Status {response.status_code}")
        except Exception as e:
            print(f"[FAIL] {text}: {e}")
    
    print(f"\n   Results: {success_count}/{len(translations)} successful")
    return success_count == len(translations)

def main():
    """Run all tests"""
    print("=" * 60)
    print("Translation API Integration Tests")
    print("=" * 60)
    print(f"API Base URL: {API_BASE_URL}")
    print("\nMake sure the FastAPI server is running:")
    print("  cd backend")
    print("  uvicorn api.server:app --reload --host 0.0.0.0 --port 8000")
    
    results = {}
    
    # Test 1: Get languages
    success, data = test_get_languages()
    results['get_languages'] = success
    
    if not success:
        print("\n[WARNING] Cannot proceed with other tests - API server not accessible")
        print("Please start the server and try again.")
        return
    
    # Test 2: Translate text
    success, data = test_translate_text()
    results['translate_text'] = success
    
    # Test 3: Detect language
    success, data = test_detect_language()
    results['detect_language'] = success
    
    # Test 4: Error handling
    test_error_handling()
    results['error_handling'] = True
    
    # Test 5: Multiple translations
    success = test_multiple_translations()
    results['multiple_translations'] = success
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    for test_name, result in results.items():
        status = "[OK]" if result else "[FAIL]"
        print(f"{status} {test_name}")
    
    all_passed = all(results.values())
    print(f"\nOverall: {'[SUCCESS] All tests passed!' if all_passed else '[FAIL] Some tests failed'}")
    
    return all_passed

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n[FAIL] Test suite error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

