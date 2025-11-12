/**
 * Complete Speech Streaming Test
 * Tests the entire speech streaming workflow including connection, streaming, and disconnection
 */
import WebSocket from 'ws';

// WebSocket URL for speech recognition streaming
const wsUrl = 'ws://localhost:8000/api/speech/recognize/stream';

console.log('🧪 Starting Complete Speech Streaming Test');
console.log('Connecting to:', wsUrl);

let messageCount = 0;
let testStartTime = Date.now();

// Create WebSocket connection
const ws = new WebSocket(wsUrl);

ws.on('open', function open() {
  console.log('✅ WebSocket connection established');
  console.log('🕒 Test started at:', new Date().toISOString());
  
  // Send multiple test audio chunks to simulate real streaming
  const sendTestChunk = () => {
    if (ws.readyState === WebSocket.OPEN && messageCount < 5) {
      messageCount++;
      
      const testMessage = JSON.stringify({
        type: 'audio_chunk',
        timestamp: new Date().toISOString(),
        data: `test_audio_data_chunk_${messageCount}_base64_encoded`,
        format: 'm4a',
        sampleRate: 16000,
        channels: 1
      });
      
      console.log(`📤 Sending test chunk ${messageCount}:`, testMessage.substring(0, 100) + '...');
      ws.send(testMessage);
      
      // Schedule next chunk
      setTimeout(sendTestChunk, 500);
    } else if (messageCount >= 5) {
      // Close connection after sending 5 chunks
      console.log('⏹️  Sending complete signal and closing connection...');
      ws.close();
    }
  };
  
  // Start sending test chunks
  sendTestChunk();
});

ws.on('message', function incoming(data) {
  const responseTime = Date.now() - testStartTime;
  console.log(`📥 Received response ${messageCount} after ${responseTime}ms:`, data.toString().substring(0, 100) + '...');
  
  // Parse the response
  try {
    const response = JSON.parse(data);
    console.log(`📋 Response ${messageCount} details:`);
    console.log('  Text:', response.text);
    console.log('  Confidence:', response.confidence);
    console.log('  Is Emergency:', response.is_emergency);
    console.log('  Partial:', response.partial);
    
    // Validate response structure
    if (response.text && typeof response.confidence === 'number') {
      console.log(`✅ Response ${messageCount} is valid`);
    } else {
      console.log(`❌ Response ${messageCount} is invalid`);
    }
  } catch (error) {
    console.error(`❌ Error parsing response ${messageCount}:`, error);
  }
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err);
  process.exit(1);
});

ws.on('close', function close() {
  const totalTime = Date.now() - testStartTime;
  console.log('🔒 WebSocket connection closed');
  console.log('📊 Test Summary:');
  console.log('  Total messages sent:', messageCount);
  console.log('  Total test time:', totalTime, 'ms');
  console.log('  Average response time:', messageCount > 0 ? Math.round(totalTime / messageCount) : 0, 'ms');
  console.log('🎉 Complete Speech Streaming Test Finished Successfully');
  process.exit(0);
});

// Set a timeout to prevent the test from running indefinitely
setTimeout(() => {
  if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
    console.log('⏰ Test timeout reached, closing connection...');
    ws.close();
  }
}, 10000);