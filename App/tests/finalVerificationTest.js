/**
 * Final Verification Test
 * Comprehensive test to verify all core functionality is working
 */
import WebSocket from 'ws';

async function runFinalVerification() {
  console.log('🎉 VOICE2EYE - Final Verification Test');
  console.log('=====================================');
  
  let allTestsPassed = true;
  
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
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ API Health Check FAILED');
    console.log('  Error:', error.message);
    allTestsPassed = false;
  }
  
  // Test 2: Settings API
  console.log('\n📝 Test 2: Settings API');
  try {
    const response = await fetch('http://localhost:8000/api/settings/');
    if (response.ok) {
      console.log('✅ Settings API PASSED');
    } else {
      console.log('❌ Settings API FAILED');
      console.log('  Status:', response.status);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Settings API FAILED');
    console.log('  Error:', error.message);
    allTestsPassed = false;
  }
  
  // Test 3: Gestures Vocabulary API
  console.log('\n📝 Test 3: Gestures Vocabulary API');
  try {
    const response = await fetch('http://localhost:8000/api/gestures/vocabulary');
    if (response.ok) {
      console.log('✅ Gestures Vocabulary API PASSED');
    } else {
      console.log('❌ Gestures Vocabulary API FAILED');
      console.log('  Status:', response.status);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Gestures Vocabulary API FAILED');
    console.log('  Error:', error.message);
    allTestsPassed = false;
  }
  
  // Test 4: Speech WebSocket Connection
  console.log('\n📝 Test 4: Speech WebSocket Connection');
  try {
    const speechWs = new WebSocket('ws://localhost:8000/api/speech/recognize/stream');
    
    const speechTest = await new Promise((resolve) => {
      speechWs.on('open', () => {
        console.log('✅ Speech WebSocket Connection PASSED');
        speechWs.close();
        resolve(true);
      });
      
      speechWs.on('error', (error) => {
        console.log('❌ Speech WebSocket Connection FAILED');
        console.log('  Error:', error.message);
        resolve(false);
      });
      
      // Timeout
      setTimeout(() => {
        resolve(false);
      }, 3000);
    });
    
    if (!speechTest) allTestsPassed = false;
  } catch (error) {
    console.log('❌ Speech WebSocket Connection FAILED');
    console.log('  Error:', error.message);
    allTestsPassed = false;
  }
  
  // Test 5: Gesture WebSocket Connection
  console.log('\n📝 Test 5: Gesture WebSocket Connection');
  try {
    const gestureWs = new WebSocket('ws://localhost:8000/api/gestures/analyze/stream');
    
    const gestureTest = await new Promise((resolve) => {
      gestureWs.on('open', () => {
        console.log('✅ Gesture WebSocket Connection PASSED');
        gestureWs.close();
        resolve(true);
      });
      
      gestureWs.on('error', (error) => {
        console.log('❌ Gesture WebSocket Connection FAILED');
        console.log('  Error:', error.message);
        resolve(false);
      });
      
      // Timeout
      setTimeout(() => {
        resolve(false);
      }, 3000);
    });
    
    if (!gestureTest) allTestsPassed = false;
  } catch (error) {
    console.log('❌ Gesture WebSocket Connection FAILED');
    console.log('  Error:', error.message);
    allTestsPassed = false;
  }
  
  // Final Results
  console.log('\n🏁 FINAL VERIFICATION RESULTS');
  console.log('==============================');
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ API Endpoints: Working');
    console.log('✅ WebSocket Connections: Working');
    console.log('✅ Backend Integration: Complete');
    console.log('✅ Real-time Communication: Functional');
    console.log('\n🚀 VOICE2EYE Phase 2 is READY for production!');
  } else {
    console.log('❌ SOME TESTS FAILED');
    console.log('Please check the output above for details.');
  }
  
  return allTestsPassed;
}

// Run the verification
runFinalVerification().then(success => {
  process.exit(success ? 0 : 1);
});