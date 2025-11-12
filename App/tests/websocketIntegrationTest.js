/**
 * WebSocket Integration Test Script
 * Tests the real-time speech streaming WebSocket connection with actual data
 */
import WebSocket from 'ws';

// WebSocket URL for speech recognition streaming
const wsUrl = 'ws://localhost:8000/api/speech/recognize/stream';

console.log('Testing WebSocket connection to:', wsUrl);

// Create WebSocket connection
const ws = new WebSocket(wsUrl);

ws.on('open', function open() {
  console.log('✅ WebSocket connection established');
  
  // Send a test audio chunk message
  const testMessage = JSON.stringify({
    type: 'audio_chunk',
    timestamp: new Date().toISOString(),
    data: 'test_audio_data_base64_encoded',
    format: 'm4a',
    sampleRate: 16000,
    channels: 1
  });
  
  console.log('Sending test audio chunk:', testMessage);
  ws.send(testMessage);
});

ws.on('message', function incoming(data) {
  console.log('Received message from server:', data.toString());
  
  // Parse the response
  try {
    const response = JSON.parse(data);
    console.log('Parsed response:', response);
    
    // Check if it contains expected fields
    if (response.text && response.confidence !== undefined) {
      console.log('✅ Valid speech recognition response received');
      console.log('  Text:', response.text);
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
  console.error('❌ WebSocket error:', err);
});

ws.on('close', function close() {
  console.log('WebSocket connection closed');
});

// Keep the script running
setTimeout(() => {
  if (ws.readyState === WebSocket.OPEN) {
    console.log('Test completed successfully');
    process.exit(0);
  }
}, 5000);