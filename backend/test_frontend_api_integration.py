"""
Test script to validate frontend API integration
Simulates frontend API calls to backend
"""
import requests
import json

API_BASE_URL = "http://127.0.0.1:8000/api"

def simulate_frontend_api_calls():
    """Simulate the exact API calls the frontend would make"""
    print("=" * 60)
    print("Frontend API Integration Validation")
    print("=" * 60)
    print("Simulating frontend API service calls...\n")
    
    results = {}
    
    # Simulate apiService.getSupportedLanguages()
    print("1. Testing getSupportedLanguages()")
    try:
        response = requests.get(f"{API_BASE_URL}/translation/languages", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"   [OK] Response: {len(data.get('languages', {}))} languages")
            results['getSupportedLanguages'] = True
        else:
            print(f"   [FAIL] Status: {response.status_code}")
            results['getSupportedLanguages'] = False
    except Exception as e:
        print(f"   [FAIL] Error: {e}")
        results['getSupportedLanguages'] = False
    
    # Simulate apiService.translateText()
    print("\n2. Testing translateText('Hello', 'en', 'es')")
    try:
        payload = {
            "text": "Hello",
            "source_language": "en",
            "target_language": "es"
        }
        response = requests.post(
            f"{API_BASE_URL}/translation/translate",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            print(f"   [OK] Translated: {data.get('translated_text')}")
            results['translateText'] = True
        else:
            print(f"   [FAIL] Status: {response.status_code}")
            results['translateText'] = False
    except Exception as e:
        print(f"   [FAIL] Error: {e}")
        results['translateText'] = False
    
    # Simulate apiService.detectLanguage()
    print("\n3. Testing detectLanguage('Bonjour')")
    try:
        text = "Bonjour"
        response = requests.get(
            f"{API_BASE_URL}/translation/detect",
            params={"text": text},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            print(f"   [OK] Detected: {data.get('language')} (confidence: {data.get('confidence')})")
            results['detectLanguage'] = True
        else:
            print(f"   [FAIL] Status: {response.status_code}")
            results['detectLanguage'] = False
    except Exception as e:
        print(f"   [FAIL] Error: {e}")
        results['detectLanguage'] = False
    
    # Summary
    print("\n" + "=" * 60)
    print("Integration Test Summary")
    print("=" * 60)
    for method, success in results.items():
        status = "[OK]" if success else "[FAIL]"
        print(f"{status} {method}")
    
    all_passed = all(results.values())
    print(f"\n{'[SUCCESS] All frontend API methods work correctly!' if all_passed else '[FAIL] Some methods failed'}")
    return all_passed

if __name__ == "__main__":
    try:
        success = simulate_frontend_api_calls()
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nTests interrupted")
        exit(1)
    except Exception as e:
        print(f"\n\n[FAIL] Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)

