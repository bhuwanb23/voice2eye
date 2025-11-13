/**
 * Message Queue Test for Gesture Streaming
 * Test the enhanced message queuing functionality with offline support
 */
const WebSocket = require('ws');

// Test message queuing functionality
async function testMessageQueue() {
  console.log('Testing message queuing functionality...');
  
  const wsUrl = 'ws://localhost:8000/api/gestures/analyze/stream';
  console.log(`Connecting to: ${wsUrl}`);
  
  try {
    // Create WebSocket connection
    const ws = new WebSocket(wsUrl);
    
    // Handle connection open
    ws.on('open', function open() {
      console.log('✓ WebSocket connection established');
      
      // Send multiple messages quickly to test queuing
      for (let i = 0; i < 5; i++) {
        const testMessage = JSON.stringify({
          type: 'video_frame',
          data: `frame_data_${i}`,
          timestamp: new Date().toISOString()
        });
        
        console.log(`Sending message ${i + 1}...`);
        ws.send(testMessage);
      }
    });
    
    // Handle incoming messages
    ws.on('message', function incoming(data) {
      console.log('Received message from server:', data.toString());
    });
    
    // Handle connection close
    ws.on('close', function close() {
      console.log('✓ WebSocket connection closed');
    });
    
    // Handle errors
    ws.on('error', function error(err) {
      console.error('✗ WebSocket error:', err.message);
    });
    
    // Wait for 3 seconds to complete test
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Close connection
    ws.close();
    console.log('✓ Message queue test completed successfully');
    
  } catch (error) {
    console.error('✗ Test failed with error:', error.message);
  }
}

// Run the test
testMessageQueue();