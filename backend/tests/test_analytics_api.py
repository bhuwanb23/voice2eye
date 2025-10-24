"""
Test suite for Analytics & Logging API endpoints
"""
import requests
import json

def test_analytics_api_endpoints():
    """Test Analytics & Logging API endpoints"""
    base_url = "http://127.0.0.1:8000"
    
    print("=" * 60)
    print("Testing Analytics & Logging API Endpoints")
    print("=" * 60)
    
    try:
        # Test 1: GET /api/analytics/usage - Get usage statistics
        print("\n1. Testing GET /api/analytics/usage")
        response = requests.get(f"{base_url}/api/analytics/usage?days=7")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Period days: {data.get('period_days', 0)}")
            print(f"   Total events: {data.get('total_events', 0)}")
            print("   ✅ PASS")
        else:
            print(f"   ❌ FAIL - {response.text}")
        
        # Test 2: GET /api/analytics/performance - Get performance metrics
        print("\n2. Testing GET /api/analytics/performance")
        response = requests.get(f"{base_url}/api/analytics/performance?days=7")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Period days: {data.get('period_days', 0)}")
            print(f"   Metrics count: {len(data.get('metrics', []))}")
            print("   ✅ PASS")
        else:
            print(f"   ❌ FAIL - {response.text}")
        
        # Test 3: GET /api/analytics/emergencies - Get emergency analytics
        print("\n3. Testing GET /api/analytics/emergencies")
        response = requests.get(f"{base_url}/api/analytics/emergencies?days=30")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Period days: {data.get('period_days', 0)}")
            print(f"   Triggered count: {data.get('triggered_count', 0)}")
            print("   ✅ PASS")
        else:
            print(f"   ❌ FAIL - {response.text}")
        
        # Test 4: GET /api/analytics/report - Generate comprehensive report
        print("\n4. Testing GET /api/analytics/report")
        response = requests.get(f"{base_url}/api/analytics/report?format=json")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Report type: {data.get('report_type')}")
            print(f"   Format: {data.get('format')}")
            print("   ✅ PASS")
        else:
            print(f"   ❌ FAIL - {response.text}")
        
        print("\n" + "=" * 60)
        print("Analytics API Testing Complete!")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to API server")
        print("Please make sure the API server is running:")
        print("cd d:\\projects\\apps\\voice2eye\\backend")
        print("python api/server.py")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")

if __name__ == "__main__":
    test_analytics_api_endpoints()