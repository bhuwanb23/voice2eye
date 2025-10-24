"""
Test script to verify gesture API endpoints
"""
import requests
import time
import base64

def test_gesture_endpoints():
    base_url = "http://127.0.0.1:8000"
    
    # Test root endpoint
    try:
        response = requests.get(f"{base_url}/api", timeout=5)
        print(f"Root endpoint: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Root endpoint error: {e}")
    
    # Test gesture status endpoint
    try:
        response = requests.get(f"{base_url}/api/gestures/status", timeout=5)
        print(f"Gesture status endpoint: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Gesture status endpoint error: {e}")
    
    # Test gesture vocabulary endpoint
    try:
        response = requests.get(f"{base_url}/api/gestures/vocabulary", timeout=5)
        print(f"Gesture vocabulary endpoint: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Gesture vocabulary endpoint error: {e}")
    
    # Test gesture analyze endpoint with base64 data
    try:
        response = requests.post(f"{base_url}/api/gestures/analyze", data={
            "image_data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
            "confidence_threshold": 0.8
        }, timeout=5)
        print(f"Gesture analyze (base64) endpoint: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Gesture analyze (base64) endpoint error: {e}")
    
    # Test gesture analyze endpoint with batch processing
    try:
        response = requests.post(f"{base_url}/api/gestures/analyze", data={
            "image_data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
            "batch_processing": True
        }, timeout=5)
        print(f"Gesture analyze (batch) endpoint: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Gesture analyze (batch) endpoint error: {e}")

if __name__ == "__main__":
    test_gesture_endpoints()