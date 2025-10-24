"""
Test script to verify gesture WebSocket endpoint
"""
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://127.0.0.1:8000/api/gestures/analyze/stream"
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket endpoint")
            
            # Send a test frame
            await websocket.send(json.dumps({"frame_data": "test"}))
            print("Sent test frame data")
            
            # Receive response
            response = await websocket.recv()
            data = json.loads(response)
            print(f"Received response: {data}")
            
            # Send another test frame
            await websocket.send(json.dumps({"frame_data": "test2"}))
            print("Sent second test frame data")
            
            # Receive response
            response = await websocket.recv()
            data = json.loads(response)
            print(f"Received response: {data}")
            
            print("WebSocket test completed successfully")
            
    except Exception as e:
        print(f"WebSocket test error: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())