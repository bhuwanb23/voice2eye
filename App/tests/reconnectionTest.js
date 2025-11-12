/**
 * Reconnection Logic Test
 * Tests the reconnection logic and exponential backoff functionality
 */
import WebSocket from 'ws';

// WebSocket URL for speech recognition streaming
const wsUrl = 'ws://localhost:8000/api/speech/recognize/stream';

console.log('🔄 Starting Reconnection Logic Test');
console.log('Connecting to:', wsUrl);

let connectionAttempts = 0;
let maxAttempts = 3;
let reconnectDelay = 1000; // Start with 1 second

// Function to attempt connection
function attemptConnection() {
  connectionAttempts++;
  console.log(`🔗 Connection attempt ${connectionAttempts}/${maxAttempts}`);
  
  const ws = new WebSocket(wsUrl);
  
  ws.on('open', function open() {
    console.log('✅ WebSocket connection established');
    
    // Send a test message
    const testMessage = JSON.stringify({
      type: 'test',
      message: 'Reconnection test message',
      timestamp: new Date().toISOString()
    });
    
    console.log('📤 Sending test message:', testMessage);
    ws.send(testMessage);
  });
  
  ws.on('message', function incoming(data) {
    console.log('📥 Received response:', data.toString());
    
    // After first successful connection, simulate a disconnection
    if (connectionAttempts === 1) {
      console.log('💥 Simulating connection loss...');
      ws.close();
    } else {
      console.log('✅ Reconnection test successful');
      console.log('🎉 All reconnection tests passed');
      process.exit(0);
    }
  });
  
  ws.on('error', function error(err) {
    console.error('❌ WebSocket error on attempt', connectionAttempts, ':', err.message);
    
    // Attempt to reconnect if we haven't reached max attempts
    if (connectionAttempts < maxAttempts) {
      const delay = reconnectDelay * Math.pow(2, connectionAttempts - 1); // Exponential backoff
      console.log(`⏳ Retrying in ${delay}ms...`);
      
      setTimeout(() => {
        attemptConnection();
      }, delay);
    } else {
      console.error('💥 Max reconnection attempts reached');
      process.exit(1);
    }
  });
  
  ws.on('close', function close() {
    console.log('🔒 WebSocket connection closed');
    
    // Attempt to reconnect if this was the first connection
    if (connectionAttempts === 1) {
      console.log('🔄 Testing reconnection logic...');
      
      // Simulate exponential backoff
      const delay = reconnectDelay * Math.pow(2, connectionAttempts - 1);
      console.log(`⏳ Reconnecting in ${delay}ms...`);
      
      setTimeout(() => {
        attemptConnection();
      }, delay);
    }
  });
}

// Start the first connection attempt
attemptConnection();

// Set a timeout to prevent the test from running indefinitely
setTimeout(() => {
  console.log('⏰ Test timeout reached');
  process.exit(1);
}, 30000);