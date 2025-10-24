"""
Simple verification script for WebSocket endpoints
"""
import requests
import json

def verify_websocket_endpoints():
    """Verify WebSocket endpoints are accessible"""
    base_url = "http://127.0.0.1:8000"
    
    print("=" * 60)
    print("Verifying WebSocket API Endpoints")
    print("=" * 60)
    
    # Test WebSocket status endpoint (HTTP)
    print("\n1. Testing WebSocket status endpoint (/api/ws/status)")
    try:
        response = requests.get(f"{base_url}/api/ws/status")
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Status: {data.get('status')}")
            print(f"   Active Connections: {data.get('active_connections', 0)}")
            print("   ✅ WebSocket status endpoint accessible")
        else:
            print(f"   ❌ WebSocket status endpoint failed: {response.text}")
    except Exception as e:
        print(f"   ❌ WebSocket status endpoint error: {e}")
    
    # Test WebSocket broadcast endpoint (HTTP POST)
    print("\n2. Testing WebSocket broadcast endpoint (/api/ws/broadcast)")
    try:
        test_message = {"type": "test", "message": "WebSocket verification"}
        response = requests.post(
            f"{base_url}/api/ws/broadcast",
            json=test_message
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Status: {data.get('status')}")
            print(f"   Recipients: {data.get('recipients', 0)}")
            print("   ✅ WebSocket broadcast endpoint accessible")
        else:
            print(f"   ❌ WebSocket broadcast endpoint failed: {response.text}")
    except Exception as e:
        print(f"   ❌ WebSocket broadcast endpoint error: {e}")
    
    print("\n" + "=" * 60)
    print("WebSocket Endpoint Verification Complete!")
    print("=" * 60)
    print("\nNote: WebSocket connections (ws://) cannot be tested with HTTP requests.")
    print("Use the test_websocket_api.py script for full WebSocket testing.")

if __name__ == "__main__":
    verify_websocket_endpoints()