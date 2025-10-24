"""
Test script to verify speech API endpoints
"""
import requests
import time

def test_speech_endpoints():
    base_url = "http://127.0.0.1:8000"
    
    # Test root endpoint
    try:
        response = requests.get(f"{base_url}/api", timeout=5)
        print(f"Root endpoint: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Root endpoint error: {e}")
    
    # Test speech status endpoint (correct path: /api/speech/status)
    try:
        response = requests.get(f"{base_url}/api/speech/status", timeout=5)
        print(f"Speech status endpoint: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Speech status endpoint error: {e}")
    
    # Test speech synthesize endpoint (correct path: /api/speech/synthesize)
    try:
        response = requests.post(f"{base_url}/api/speech/synthesize", data={"text": "Hello World"}, timeout=5)
        print(f"Speech synthesize endpoint: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Speech synthesize endpoint error: {e}")
    
    # Test speech recognize endpoint (correct path: /api/speech/recognize)
    try:
        response = requests.post(f"{base_url}/api/speech/recognize", timeout=5)
        print(f"Speech recognize endpoint: {response.status_code}")
    except Exception as e:
        # This might fail due to missing file, but that's expected
        if "422" in str(e) or "405" in str(e):
            print(f"Speech recognize endpoint: Exists (got expected validation error)")
        else:
            print(f"Speech recognize endpoint error: {e}")

if __name__ == "__main__":
    test_speech_endpoints()