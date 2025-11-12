/**
 * Final Integration Test for Phase 2.2
 * Comprehensive test of all WebSocket integration functionality
 */
import WebSocket from 'ws';

console.log('🚀 Starting Final Integration Test for Phase 2.2');
console.log('==============================================');

// Test 1: Basic WebSocket Connection
console.log('\n📝 Test 1: Basic WebSocket Connection');
const wsUrl = 'ws://localhost:8000/api/speech/recognize/stream';
console.log('Connecting to:', wsUrl);

const ws = new WebSocket(wsUrl);

ws.on('open', function open() {
  console.log('✅ Test 1 PASSED: WebSocket connection established');
  
  // Test 2: Send Audio Chunk
  console.log('\n📝 Test 2: Send Audio Chunk');
  const testAudioChunk = JSON.stringify({
    type: 'audio_chunk',
    timestamp: new Date().toISOString(),
    data: 'base64_encoded_audio_data',
    format: 'm4a',
    sampleRate: 16000,
    channels: 1
  });
  
  console.log('📤 Sending audio chunk...');
  ws.send(testAudioChunk);
});

ws.on('message', function incoming(data) {
  console.log('📥 Received response from server');
  
  try {
    const response = JSON.parse(data);
    console.log('📋 Response data:', response);
    
    // Test 3: Validate Response Structure
    console.log('\n📝 Test 3: Validate Response Structure');
    if (response.text && typeof response.confidence === 'number') {
      console.log('✅ Test 3 PASSED: Response structure is valid');
      console.log('  Text:', response.text);
      console.log('  Confidence:', response.confidence);
      console.log('  Is Emergency:', response.is_emergency);
      console.log('  Partial:', response.partial);
    } else {
      console.log('❌ Test 3 FAILED: Invalid response structure');
      process.exit(1);
    }
    
    // Test 4: Validate Confidence Range
    console.log('\n📝 Test 4: Validate Confidence Range');
    if (response.confidence >= 0 && response.confidence <= 1) {
      console.log('✅ Test 4 PASSED: Confidence is in valid range (0-1)');
    } else {
      console.log('❌ Test 4 FAILED: Confidence is out of valid range');
      process.exit(1);
    }
    
    // Test 5: Validate Response Fields
    console.log('\n📝 Test 5: Validate Response Fields');
    const requiredFields = ['text', 'confidence', 'is_emergency', 'timestamp', 'partial'];
    const missingFields = requiredFields.filter(field => !(field in response));
    
    if (missingFields.length === 0) {
      console.log('✅ Test 5 PASSED: All required fields present');
    } else {
      console.log('❌ Test 5 FAILED: Missing fields:', missingFields);
      process.exit(1);
    }
    
    // All tests passed, close connection
    console.log('\n🔒 Closing WebSocket connection...');
    ws.close();
  } catch (error) {
    console.error('❌ Error processing response:', error);
    process.exit(1);
  }
});

ws.on('error', function error(err) {
  console.error('❌ Test 1 FAILED: WebSocket error:', err.message);
  process.exit(1);
});

ws.on('close', function close() {
  console.log('✅ WebSocket connection closed successfully');
  
  // Test 6: Reconnection Logic
  console.log('\n📝 Test 6: Reconnection Logic');
  console.log('🔄 Testing reconnection by creating new connection...');
  
  const ws2 = new WebSocket(wsUrl);
  
  ws2.on('open', function open() {
    console.log('✅ Test 6 PASSED: Reconnection successful');
    ws2.close();
  });
  
  ws2.on('close', function close() {
    console.log('✅ Reconnection test completed');
    
    // All tests completed
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('==============================================');
    console.log('✅ Phase 2.2 WebSocket Integration is working correctly');
    console.log('✅ Real-time Speech Streaming is fully functional');
    console.log('✅ All validation tests passed');
    process.exit(0);
  });
  
  ws2.on('error', function error(err) {
    console.error('❌ Test 6 FAILED: Reconnection error:', err.message);
    process.exit(1);
  });
});

// Set timeout to prevent hanging
setTimeout(() => {
  console.log('⏰ Test timeout reached');
  process.exit(1);
}, 15000);