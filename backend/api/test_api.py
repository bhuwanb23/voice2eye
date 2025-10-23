"""
API Testing Script
Test the VOICE2EYE Backend API endpoints
"""
import requests
import json
from pathlib import Path

# API base URL
BASE_URL = "http://127.0.0.1:8000"

def test_health_endpoints():
    """Test health check endpoints"""
    print("Testing Health Endpoints...")
    
    # Test root endpoint
    response = requests.get(f"{BASE_URL}/api")
    print(f"Root endpoint: {response.status_code} - {response.json()}")
    
    # Test health endpoint
    response = requests.get(f"{BASE_URL}/api/health")
    print(f"Health endpoint: {response.status_code} - {response.json()}")
    
    # Test service-specific health endpoints
    services = ["speech", "gestures", "emergency", "storage"]
    for service in services:
        response = requests.get(f"{BASE_URL}/api/health/{service}")
        print(f"Health/{service}: {response.status_code}")

def test_speech_endpoints():
    """Test speech recognition endpoints"""
    print("\nTesting Speech Endpoints...")
    
    # Test speech status
    response = requests.get(f"{BASE_URL}/api/speech/status")
    print(f"Speech status: {response.status_code} - {response.json()}")
    
    # Test speech synthesize
    response = requests.post(
        f"{BASE_URL}/api/speech/synthesize",
        data={"text": "Hello from VOICE2EYE API"}
    )
    print(f"Speech synthesize: {response.status_code} - {response.json()}")

def test_gesture_endpoints():
    """Test gesture recognition endpoints"""
    print("\nTesting Gesture Endpoints...")
    
    # Test gesture status
    response = requests.get(f"{BASE_URL}/api/gestures/status")
    print(f"Gesture status: {response.status_code} - {response.json()}")
    
    # Test gesture vocabulary
    response = requests.get(f"{BASE_URL}/api/gestures/vocabulary")
    print(f"Gesture vocabulary: {response.status_code} - {response.json()}")

def test_emergency_endpoints():
    """Test emergency alert endpoints"""
    print("\nTesting Emergency Endpoints...")
    
    # Test emergency trigger
    trigger_data = {
        "trigger_type": "manual",
        "trigger_data": {"source": "api_test"},
        "location": {"lat": 40.7128, "lng": -74.0060}
    }
    response = requests.post(
        f"{BASE_URL}/api/emergency/trigger",
        json=trigger_data
    )
    print(f"Emergency trigger: {response.status_code} - {response.json()}")
    
    # Test emergency status (with placeholder ID)
    response = requests.get(f"{BASE_URL}/api/emergency/status/test_alert_123")
    print(f"Emergency status: {response.status_code} - {response.json()}")

def test_settings_endpoints():
    """Test settings endpoints"""
    print("\nTesting Settings Endpoints...")
    
    # Test get settings
    response = requests.get(f"{BASE_URL}/api/settings")
    print(f"Get settings: {response.status_code} - {response.json()}")
    
    # Test get emergency contacts
    response = requests.get(f"{BASE_URL}/api/settings/contacts")
    print(f"Get contacts: {response.status_code} - {response.json()}")

def main():
    """Main test function"""
    print("=" * 60)
    print("VOICE2EYE Backend API Testing")
    print("=" * 60)
    
    try:
        test_health_endpoints()
        test_speech_endpoints()
        test_gesture_endpoints()
        test_emergency_endpoints()
        test_settings_endpoints()
        
        print("\n" + "=" * 60)
        print("API Testing Complete!")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to API server")
        print("Please make sure the API server is running:")
        print("cd d:\\projects\\apps\\voice2eye\\backend")
        print("python api/server.py")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")

if __name__ == "__main__":
    main()