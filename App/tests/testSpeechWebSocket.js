/**
 * Test script for speech streaming WebSocket connection
 * This script tests the WebSocket connection to /api/speech/recognize/stream endpoint
 */
import WebSocket from 'ws';

// WebSocket URL for speech recognition streaming
const wsUrl = 'ws://localhost:8000/api/speech/recognize/stream';

console.log('Testing speech streaming WebSocket connection...');
console.log('Connecting to:', wsUrl);

// Create WebSocket connection
const ws = new WebSocket(wsUrl);

ws.on('open', function open() {
  console.log('✅ WebSocket connection established');
  
  // Send a test message
  console.log('Sending test message...');
  ws.send(JSON.stringify({
    type: 'test',
    message: 'Hello from test client'
  }));
});

ws.on('message', function incoming(data) {
  console.log('Received message from server:', data.toString());
  console.log('Closing connection...');
  ws.close();
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err);
  console.error('✗ Test failed');
});

ws.on('close', function close() {
  console.log('✅ WebSocket connection closed');
  console.log('✓ Test completed successfully');
});