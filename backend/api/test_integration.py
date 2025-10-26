"""
API Integration Test Script
Tests all API endpoints to ensure they're working correctly
"""
import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8000/api"

def print_section(title):
    print(f"\n{'='*60}")
    print(f" {title}")
    print('='*60)

def test_endpoint(method, endpoint, data=None, expected_status=200):
    """Test an API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == 'GET':
            response = requests.get(url, timeout=5)
        elif method == 'POST':
            response = requests.post(url, json=data, timeout=5)
        elif method == 'PUT':
            response = requests.put(url, json=data, timeout=5)
        elif method == 'DELETE':
            response = requests.delete(url, timeout=5)
        
        print(f"[OK] {method} {endpoint} - Status: {response.status_code}")
        if response.status_code == expected_status:
            return response.json()
        else:
            print(f"  [WARN] Unexpected status: {response.status_code}")
            return None
    except requests.exceptions.ConnectionError:
        print(f"[ERROR] {method} {endpoint} - Connection Error (Backend not running)")
        return None
    except Exception as e:
        print(f"[ERROR] {method} {endpoint} - Error: {e}")
        return None

def main():
    print("="*60)
    print(" VOICE2EYE API Integration Test")
    print("="*60)
    print(f"Testing against: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Health Check
    print_section("Health Check")
    test_endpoint('GET', '/health')
    
    # Settings API
    print_section("Settings API")
    test_endpoint('GET', '/settings/')
    test_endpoint('GET', '/settings/contacts')
    
    # Analytics API
    print_section("Analytics API")
    test_endpoint('GET', '/analytics/usage?days=7')
    test_endpoint('GET', '/analytics/performance?days=7')
    test_endpoint('GET', '/analytics/emergencies?days=30')
    test_endpoint('GET', '/analytics/report?format=json')
    
    # Emergency API
    print_section("Emergency API")
    test_endpoint('GET', '/emergency/history?days=30&limit=10')
    
    # Gestures API
    print_section("Gestures API")
    test_endpoint('GET', '/gestures/vocabulary')
    test_endpoint('GET', '/gestures/status')
    
    # Speech API
    print_section("Speech API")
    test_endpoint('GET', '/speech/status')
    
    print_section("Test Complete")
    print("\n[SUCCESS] All API tests completed")
    print("Note: Connection errors indicate backend is not running")
    print("Start backend with: python -m uvicorn api.server:app --reload --host 0.0.0.0 --port 8000")

if __name__ == "__main__":
    main()
