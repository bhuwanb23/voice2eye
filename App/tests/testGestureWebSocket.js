/**
 * Simple WebSocket Test for Gesture Streaming
 * This test can be run directly with Node.js to verify WebSocket connection
 */
const WebSocket = require('ws');

// Test the gesture streaming WebSocket endpoint
async function testGestureWebSocket() {
  console.log('Testing gesture streaming WebSocket connection...');
  
  const wsUrl = 'ws://localhost:8000/api/gestures/analyze/stream';
  console.log(`Connecting to: ${wsUrl}`);
  
  try {
    // Create WebSocket connection
    const ws = new WebSocket(wsUrl);
    
    // Handle connection open
    ws.on('open', function open() {
      console.log('✓ WebSocket connection established');
      
      // Send a test message
      const testMessage = JSON.stringify({
        type: 'test',
        data: 'Hello from test client'
      });
      
      console.log('Sending test message...');
      ws.send(testMessage);
    });
    
    // Handle incoming messages
    ws.on('message', function incoming(data) {
      console.log('Received message from server:', data.toString());
      
      // Close connection after receiving first message
      console.log('Closing connection...');
      ws.close();
    });
    
    // Handle connection close
    ws.on('close', function close() {
      console.log('✓ WebSocket connection closed');
      console.log('✓ Test completed successfully');
    });
    
    // Handle errors
    ws.on('error', function error(err) {
      console.error('✗ WebSocket error:', err.message);
      console.log('✗ Test failed');
    });
    
    // Wait for 5 seconds to complete test
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('✗ Test failed with error:', error.message);
  }
}

// Run the test
testGestureWebSocket();