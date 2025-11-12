/**
 * Test script for WebSocket connection
 * Run this to verify WebSocket integration is working
 */
import apiService from './apiService.js';

function testWebSocketConnection() {
  console.log('Testing WebSocket Connection...');
  
  try {
    // Test speech streaming WebSocket
    console.log('1. Testing speech streaming WebSocket...');
    const ws = apiService.connectSpeechStream(
      (data) => {
        console.log('✅ Speech result received:', data);
      },
      (error) => {
        console.error('❌ Speech WebSocket error:', error);
      },
      () => {
        console.log(' Speech WebSocket closed');
      }
    );
    
    // Keep connection open for a few seconds to test
    setTimeout(() => {
      console.log('Closing WebSocket connection...');
      ws.close();
    }, 5000);
    
    console.log('WebSocket test initiated! 🎉');
    return true;
  } catch (error) {
    console.error('❌ WebSocket test failed:', error.message);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testWebSocketConnection();
}

export default testWebSocketConnection;