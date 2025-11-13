/**
 * Gesture Streaming Test
 * Test the WebSocket connection to /api/gestures/analyze/stream endpoint
 */
import GestureStreamingService from '../services/GestureStreamingService';
import apiService from '../api/services/apiService';

// Test gesture streaming connection
async function testGestureStreaming() {
  console.log('Testing gesture streaming connection...');
  
  try {
    // Test connection to gesture streaming WebSocket
    console.log('Connecting to gesture streaming WebSocket...');
    const success = await GestureStreamingService.connect();
    
    if (success) {
      console.log('✓ Successfully connected to gesture streaming WebSocket');
      
      // Test disconnection
      console.log('Disconnecting from gesture streaming WebSocket...');
      GestureStreamingService.disconnect();
      console.log('✓ Successfully disconnected from gesture streaming WebSocket');
      
      return true;
    } else {
      console.error('✗ Failed to connect to gesture streaming WebSocket');
      return false;
    }
  } catch (error) {
    console.error('✗ Error testing gesture streaming:', error);
    return false;
  }
}

// Test gesture streaming with reconnection
async function testGestureStreamingWithReconnection() {
  console.log('Testing gesture streaming with reconnection...');
  
  try {
    // Connect
    console.log('Connecting to gesture streaming WebSocket...');
    const success = await GestureStreamingService.connect();
    
    if (success) {
      console.log('✓ Successfully connected to gesture streaming WebSocket');
      
      // Force reconnection
      console.log('Testing forced reconnection...');
      const reconnectSuccess = await GestureStreamingService.forceReconnect();
      
      if (reconnectSuccess) {
        console.log('✓ Successfully reconnected to gesture streaming WebSocket');
        
        // Disconnect
        GestureStreamingService.disconnect();
        console.log('✓ Successfully disconnected from gesture streaming WebSocket');
        
        return true;
      } else {
        console.error('✗ Failed to reconnect to gesture streaming WebSocket');
        return false;
      }
    } else {
      console.error('✗ Failed to connect to gesture streaming WebSocket');
      return false;
    }
  } catch (error) {
    console.error('✗ Error testing gesture streaming with reconnection:', error);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('Starting gesture streaming tests...\n');
  
  let allTestsPassed = true;
  
  // Test basic connection
  const connectionTest = await testGestureStreaming();
  if (!connectionTest) {
    allTestsPassed = false;
  }
  
  console.log('\n---\n');
  
  // Test reconnection
  const reconnectionTest = await testGestureStreamingWithReconnection();
  if (!reconnectionTest) {
    allTestsPassed = false;
  }
  
  console.log('\n=== Test Results ===');
  if (allTestsPassed) {
    console.log('✓ All gesture streaming tests passed!');
  } else {
    console.log('✗ Some gesture streaming tests failed!');
  }
  
  return allTestsPassed;
}

// Export for use in other test files
export { testGestureStreaming, testGestureStreamingWithReconnection, runTests };

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export default runTests;