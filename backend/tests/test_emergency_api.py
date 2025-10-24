"""
Test suite for Emergency Alert API endpoints
"""
import requests
import json
import time

def test_emergency_api_endpoints():
    """Test Emergency Alert API endpoints"""
    base_url = "http://127.0.0.1:8000"
    
    print("=" * 60)
    print("Testing Emergency Alert API Endpoints")
    print("=" * 60)
    
    try:
        # Test 1: Trigger emergency
        print("\n1. Testing POST /api/emergency/trigger")
        trigger_data = {
            "trigger_type": "manual",
            "trigger_data": {"source": "api_test"},
            "location": {"lat": 40.7128, "lng": -74.0060},
            "user_id": "test_user_123"
        }
        
        response = requests.post(f"{base_url}/api/emergency/trigger", json=trigger_data)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            alert_id = data.get("alert_id")
            print(f"   Alert ID: {alert_id}")
            print(f"   Status: {data.get('status')}")
            print("   ✅ PASS")
        else:
            print(f"   ❌ FAIL - {response.text}")
            return
        
        # Test 2: Get emergency status
        print("\n2. Testing GET /api/emergency/status/{alert_id}")
        if alert_id:
            response = requests.get(f"{base_url}/api/emergency/status/{alert_id}")
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   Alert Status: {data.get('status')}")
                print("   ✅ PASS")
            else:
                print(f"   ❌ FAIL - {response.text}")
        
        # Test 3: Confirm emergency
        print("\n3. Testing POST /api/emergency/confirm")
        if alert_id:
            confirm_data = {
                "alert_id": alert_id,
                "user_id": "test_user_123"
            }
            
            response = requests.post(f"{base_url}/api/emergency/confirm", json=confirm_data)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   Confirmation Status: {data.get('status')}")
                print(f"   Messages Sent: {data.get('messages_sent')}")
                print("   ✅ PASS")
            else:
                print(f"   ❌ FAIL - {response.text}")
        
        # Test 4: Cancel emergency (with a new alert)
        print("\n4. Testing POST /api/emergency/cancel")
        # First create another alert
        response = requests.post(f"{base_url}/api/emergency/trigger", json=trigger_data)
        if response.status_code == 200:
            cancel_alert_id = response.json().get("alert_id")
            
            cancel_data = {
                "alert_id": cancel_alert_id,
                "cancellation_reason": "false alarm",
                "user_id": "test_user_123"
            }
            
            response = requests.post(f"{base_url}/api/emergency/cancel", json=cancel_data)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   Cancellation Status: {data.get('status')}")
                print(f"   Reason: {data.get('cancellation_reason')}")
                print("   ✅ PASS")
            else:
                print(f"   ❌ FAIL - {response.text}")
        
        # Test 5: Get emergency history
        print("\n5. Testing GET /api/emergency/history")
        response = requests.get(f"{base_url}/api/emergency/history?days=7&limit=10")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Total Alerts: {data.get('total_count')}")
            print(f"   Days: {data.get('days')}")
            print("   ✅ PASS")
        else:
            print(f"   ❌ FAIL - {response.text}")
        
        # Test 6: Get emergency history with date filtering
        print("\n6. Testing GET /api/emergency/history with date filtering")
        response = requests.get(
            f"{base_url}/api/emergency/history?start_date=2025-10-01T00:00:00Z&end_date=2025-10-31T23:59:59Z"
        )
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Filtered Alerts: {data.get('total_count')}")
            print("   ✅ PASS")
        else:
            print(f"   ❌ FAIL - {response.text}")
        
        print("\n" + "=" * 60)
        print("Emergency API Testing Complete!")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to API server")
        print("Please make sure the API server is running:")
        print("cd d:\\projects\\apps\\voice2eye\\backend")
        print("python api/server.py")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")

if __name__ == "__main__":
    test_emergency_api_endpoints()