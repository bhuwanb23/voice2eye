/**
 * Gesture WebSocket Test
 * Tests the gesture streaming WebSocket connection
 */
import WebSocket from 'ws';

// WebSocket URL for gesture recognition streaming
const wsUrl = 'ws://localhost:8000/api/gestures/analyze/stream';

console.log('Testing Gesture WebSocket connection to:', wsUrl);

// Create WebSocket connection
const ws = new WebSocket(wsUrl);

ws.on('open', function open() {
  console.log('✅ Gesture WebSocket connection established');
  
  // Send a test frame message
  const testMessage = JSON.stringify({
    type: 'video_frame',
    timestamp: new Date().toISOString(),
    data: 'test_frame_data_base64_encoded',
    format: 'jpeg',
    width: 640,
    height: 480
  });
  
  console.log('Sending test frame:', testMessage);
  ws.send(testMessage);
});

ws.on('message', function incoming(data) {
  console.log('Received message from server:', data.toString());
  
  // Parse the response
  try {
    const response = JSON.parse(data);
    console.log('Parsed response:', response);
    
    // Check if it contains expected fields
    if (response.gesture_type && response.confidence !== undefined) {
      console.log('✅ Valid gesture recognition response received');
      console.log('  Gesture Type:', response.gesture_type);
      console.log('  Confidence:', response.confidence);
      console.log('  Is Emergency:', response.is_emergency);
    }
  } catch (error) {
    console.error('Error parsing response:', error);
  }
  
  // Close connection after receiving first message
  console.log('Closing connection...');
  ws.close();
});

ws.on('error', function error(err) {
  console.error('❌ Gesture WebSocket error:', err);
});

ws.on('close', function close() {
  console.log('Gesture WebSocket connection closed');
});

// Keep the script running
setTimeout(() => {
  if (ws.readyState === WebSocket.OPEN) {
    console.log('Test completed successfully');
    process.exit(0);
  }
}, 5000);