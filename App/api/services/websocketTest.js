/**
 * WebSocket Connection Test
 * Simple test to verify WebSocket connection to speech streaming endpoint
 */
const WebSocket = require('ws');

// WebSocket URL for speech recognition streaming
const wsUrl = 'ws://localhost:8000/api/speech/recognize/stream';

console.log('Testing WebSocket connection to:', wsUrl);

// Create WebSocket connection
const ws = new WebSocket(wsUrl);

ws.on('open', function open() {
  console.log('✅ WebSocket connection established');
  
  // Send a test message
  const testMessage = JSON.stringify({
    type: 'test',
    message: 'Hello from test client',
    timestamp: new Date().toISOString()
  });
  
  console.log('Sending test message:', testMessage);
  ws.send(testMessage);
});

ws.on('message', function incoming(data) {
  console.log('Received message from server:', data.toString());
  
  // Close connection after receiving first message
  console.log('Closing connection...');
  ws.close();
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err);
});

ws.on('close', function close() {
  console.log('WebSocket connection closed');
  console.log('Test completed!');
});

// Keep the process alive for a few seconds
setTimeout(() => {
  if (ws.readyState === WebSocket.OPEN) {
    console.log('Test timeout - closing connection');
    ws.close();
  }
}, 10000);