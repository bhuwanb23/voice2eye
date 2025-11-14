/**
 * Simple Test Script
 * Basic test to verify API and WebSocket connectivity
 */
import WebSocket from 'ws';

async function runSimpleTest() {
  console.log('🚀 Starting Simple Test');
  console.log('====================');
  
  // Test 1: API Health Check
  console.log('\n📝 Test 1: API Health Check');
  try {
    const response = await fetch('http://localhost:8000/api/');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Health Check PASSED');
      console.log('  Message:', data.message);
      console.log('  Version:', data.version);
      console.log('  Status:', data.status);
    } else {
      console.log('❌ API Health Check FAILED');
      console.log('  Status:', response.status);
    }
  } catch (error) {
    console.log('❌ API Health Check FAILED');
    console.log('  Error:', error.message);
  }
  
  // Test 2: Speech WebSocket Connection
  console.log('\n📝 Test 2: Speech WebSocket Connection');
  try {
    const speechWs = new WebSocket('ws://localhost:8000/api/speech/recognize/stream');
    
    speechWs.on('open', () => {
      console.log('✅ Speech WebSocket Connection PASSED');
      speechWs.close();
    });
    
    speechWs.on('error', (error) => {
      console.log('❌ Speech WebSocket Connection FAILED');
      console.log('  Error:', error.message);
    });
  } catch (error) {
    console.log('❌ Speech WebSocket Connection FAILED');
    console.log('  Error:', error.message);
  }
  
  // Test 3: Gesture WebSocket Connection
  console.log('\n📝 Test 3: Gesture WebSocket Connection');
  try {
    const gestureWs = new WebSocket('ws://localhost:8000/api/gestures/analyze/stream');
    
    gestureWs.on('open', () => {
      console.log('✅ Gesture WebSocket Connection PASSED');
      gestureWs.close();
    });
    
    gestureWs.on('error', (error) => {
      console.log('❌ Gesture WebSocket Connection FAILED');
      console.log('  Error:', error.message);
    });
  } catch (error) {
    console.log('❌ Gesture WebSocket Connection FAILED');
    console.log('  Error:', error.message);
  }
  
  // Wait a bit for WebSocket connections to complete
  setTimeout(() => {
    console.log('\n🎉 Simple Test Completed');
  }, 2000);
}

// Run the test
runSimpleTest();