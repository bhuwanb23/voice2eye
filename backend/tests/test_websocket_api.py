"""
Test suite for WebSocket API endpoints
"""
import asyncio
import websockets
import json
import time

async def test_websocket_endpoints():
    """Test WebSocket API endpoints"""
    base_url = "ws://127.0.0.1:8000"
    
    print("=" * 60)
    print("Testing WebSocket API Endpoints")
    print("=" * 60)
    
    try:
        # Test 1: Main WebSocket endpoint
        print("\n1. Testing Main WebSocket endpoint (/api/ws)")
        uri = f"{base_url}/api/ws"
        
        try:
            async with websockets.connect(uri) as websocket:
                print("   ✅ Connected to main WebSocket endpoint")
                
                # Send ping for heartbeat
                await websocket.send("ping")
                response = await websocket.recv()
                data = json.loads(response)
                print(f"   Heartbeat response: {data.get('type', 'unknown')}")
                
                # Send test message
                test_message = {"type": "test", "data": "Hello WebSocket"}
                await websocket.send(json.dumps(test_message))
                response = await websocket.recv()
                data = json.loads(response)
                print(f"   Echo response: {data.get('type', 'unknown')}")
                
                print("   ✅ Main WebSocket endpoint working")
        except Exception as e:
            print(f"   ❌ Main WebSocket endpoint failed: {e}")
        
        # Test 2: Speech WebSocket endpoint
        print("\n2. Testing Speech WebSocket endpoint (/api/ws/speech)")
        uri = f"{base_url}/api/ws/speech"
        
        try:
            async with websockets.connect(uri) as websocket:
                print("   ✅ Connected to speech WebSocket endpoint")
                
                # Send ping for heartbeat
                await websocket.send("ping")
                response = await websocket.recv()
                data = json.loads(response)
                print(f"   Heartbeat response: {data.get('type', 'unknown')}")
                
                print("   ✅ Speech WebSocket endpoint working")
        except Exception as e:
            print(f"   ❌ Speech WebSocket endpoint failed: {e}")
        
        # Test 3: Gestures WebSocket endpoint
        print("\n3. Testing Gestures WebSocket endpoint (/api/ws/gestures)")
        uri = f"{base_url}/api/ws/gestures"
        
        try:
            async with websockets.connect(uri) as websocket:
                print("   ✅ Connected to gestures WebSocket endpoint")
                
                # Send ping for heartbeat
                await websocket.send("ping")
                response = await websocket.recv()
                data = json.loads(response)
                print(f"   Heartbeat response: {data.get('type', 'unknown')}")
                
                print("   ✅ Gestures WebSocket endpoint working")
        except Exception as e:
            print(f"   ❌ Gestures WebSocket endpoint failed: {e}")
        
        # Test 4: Emergency WebSocket endpoint
        print("\n4. Testing Emergency WebSocket endpoint (/api/ws/emergency)")
        uri = f"{base_url}/api/ws/emergency"
        
        try:
            async with websockets.connect(uri) as websocket:
                print("   ✅ Connected to emergency WebSocket endpoint")
                
                # Send ping for heartbeat
                await websocket.send("ping")
                response = await websocket.recv()
                data = json.loads(response)
                print(f"   Heartbeat response: {data.get('type', 'unknown')}")
                
                print("   ✅ Emergency WebSocket endpoint working")
        except Exception as e:
            print(f"   ❌ Emergency WebSocket endpoint failed: {e}")
        
        # Test 5: WebSocket status endpoint
        print("\n5. Testing WebSocket status endpoint (/api/ws/status)")
        try:
            import requests
            response = requests.get("http://127.0.0.1:8000/api/ws/status")
            print(f"   Status endpoint response: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   Active connections: {data.get('active_connections', 0)}")
                print("   ✅ WebSocket status endpoint working")
            else:
                print(f"   ❌ WebSocket status endpoint failed: {response.text}")
        except Exception as e:
            print(f"   ❌ WebSocket status endpoint failed: {e}")
        
        print("\n" + "=" * 60)
        print("WebSocket API Testing Complete!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket_endpoints())