/**
 * End-to-End Gesture Streaming Test
 * Test the complete gesture streaming workflow with real data
 */
import GestureStreamingService from '../services/GestureStreamingService.js';

// Mock gesture data for testing
const mockGestureData = {
  gesture_type: 'thumbs_up',
  confidence: 0.95,
  is_emergency: false,
  bounding_box: {
    x: 0.3,
    y: 0.4,
    width: 0.2,
    height: 0.3
  }
};

// Test end-to-end gesture streaming workflow
async function testEndToEndGestureStreaming() {
  console.log('Testing end-to-end gesture streaming workflow...');
  
  return new Promise((resolve) => {
    let testPassed = true;
    
    // Set up callbacks
    GestureStreamingService.setOnStatusChange((status) => {
      console.log(`Gesture connection status: ${status}`);
    });
    
    GestureStreamingService.setOnError((error) => {
      console.error('Gesture streaming error:', error);
      testPassed = false;
    });
    
    GestureStreamingService.setOnResult((data) => {
      console.log('Gesture recognition result received:', data);
      if (data.gesture_type) {
        console.log('✓ Gesture recognition working correctly');
      } else {
        console.error('✗ Invalid gesture data received');
        testPassed = false;
      }
    });
    
    // Test workflow
    GestureStreamingService.connect()
      .then((success) => {
        if (success) {
          console.log('✓ Connected to gesture streaming service');
          
          // Start streaming
          return GestureStreamingService.startStreaming();
        } else {
          throw new Error('Failed to connect');
        }
      })
      .then((success) => {
        if (success) {
          console.log('✓ Started gesture streaming');
          
          // Simulate sending a frame
          const frameData = 'mock_frame_data';
          const sent = GestureStreamingService.sendFrame(frameData);
          
          if (sent) {
            console.log('✓ Frame sent successfully');
          } else {
            console.error('✗ Failed to send frame');
            testPassed = false;
          }
          
          // Stop streaming
          GestureStreamingService.stopStreaming();
          console.log('✓ Stopped gesture streaming');
          
          // Disconnect
          GestureStreamingService.disconnect();
          console.log('✓ Disconnected from gesture streaming service');
        } else {
          throw new Error('Failed to start streaming');
        }
      })
      .catch((error) => {
        console.error('✗ Error in gesture streaming workflow:', error);
        testPassed = false;
      })
      .finally(() => {
        resolve(testPassed);
      });
  });
}

// Test error handling
async function testErrorHandling() {
  console.log('Testing error handling...');
  
  try {
    // Try to start streaming without connecting
    console.log('Attempting to start streaming without connecting...');
    await GestureStreamingService.startStreaming();
    console.error('✗ Should have thrown an error');
    return false;
  } catch (error) {
    console.log('✓ Correctly threw error when trying to start streaming without connecting');
    return true;
  }
}

// Test reconnection logic
async function testReconnectionLogic() {
  console.log('Testing reconnection logic...');
  
  try {
    // Connect
    const success = await GestureStreamingService.connect();
    if (!success) {
      throw new Error('Failed to connect');
    }
    
    console.log('✓ Connected successfully');
    
    // Force reconnection
    const reconnectSuccess = await GestureStreamingService.forceReconnect();
    if (reconnectSuccess) {
      console.log('✓ Reconnection successful');
      
      // Disconnect
      GestureStreamingService.disconnect();
      return true;
    } else {
      throw new Error('Reconnection failed');
    }
  } catch (error) {
    console.error('✗ Error in reconnection test:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting end-to-end gesture streaming tests...\n');
  
  let allTestsPassed = true;
  
  // Test end-to-end workflow
  console.log('=== Testing End-to-End Workflow ===');
  const workflowTest = await testEndToEndGestureStreaming();
  if (!workflowTest) {
    allTestsPassed = false;
  }
  
  console.log('\n---\n');
  
  // Test error handling
  console.log('=== Testing Error Handling ===');
  const errorTest = await testErrorHandling();
  if (!errorTest) {
    allTestsPassed = false;
  }
  
  console.log('\n---\n');
  
  // Test reconnection logic
  console.log('=== Testing Reconnection Logic ===');
  const reconnectionTest = await testReconnectionLogic();
  if (!reconnectionTest) {
    allTestsPassed = false;
  }
  
  console.log('\n=== Test Results ===');
  if (allTestsPassed) {
    console.log('✓ All end-to-end gesture streaming tests passed!');
  } else {
    console.log('✗ Some end-to-end gesture streaming tests failed!');
  }
  
  return allTestsPassed;
}

// Export for use in other test files
export { testEndToEndGestureStreaming, testErrorHandling, testReconnectionLogic, runAllTests };

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export default runAllTests;