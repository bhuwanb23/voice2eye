/**
 * Test Runner Script
 * Executes all test suites in sequence
 */
import { runComprehensiveTestSuite } from './comprehensiveTestingSuite.js';
import { runAllTests as runGestureTests } from './endToEndGestureStreamingTest.js';
import { runTests as runSpeechTests } from './completeSpeechStreamingTest.js';
import { runTests as runWebSocketTests } from './websocketIntegrationTest.js';

async function runAllTestSuites() {
  console.log('🚀 Starting Complete Test Suite Execution');
  console.log('========================================');
  
  let allPassed = true;
  
  // Run comprehensive test suite
  console.log('\n📋 Running Comprehensive Test Suite...');
  try {
    const comprehensivePassed = await runComprehensiveTestSuite();
    allPassed = allPassed && comprehensivePassed;
  } catch (error) {
    console.error('❌ Comprehensive test suite failed:', error.message);
    allPassed = false;
  }
  
  // Run gesture streaming tests
  console.log('\n📋 Running Gesture Streaming Tests...');
  try {
    const gesturePassed = await runGestureTests();
    allPassed = allPassed && gesturePassed;
  } catch (error) {
    console.error('❌ Gesture streaming tests failed:', error.message);
    allPassed = false;
  }
  
  // Run speech streaming tests
  console.log('\n📋 Running Speech Streaming Tests...');
  try {
    const speechPassed = await runSpeechTests();
    allPassed = allPassed && speechPassed;
  } catch (error) {
    console.error('❌ Speech streaming tests failed:', error.message);
    allPassed = false;
  }
  
  // Run WebSocket integration tests
  console.log('\n📋 Running WebSocket Integration Tests...');
  try {
    const websocketPassed = await runWebSocketTests();
    allPassed = allPassed && websocketPassed;
  } catch (error) {
    console.error('❌ WebSocket integration tests failed:', error.message);
    allPassed = false;
  }
  
  console.log('\n=== FINAL TEST RESULTS ===');
  if (allPassed) {
    console.log('🎉 ALL TEST SUITES PASSED!');
    console.log('✅ Integration Tests: COMPLETE');
    console.log('✅ End-to-End Tests: COMPLETE');
    console.log('✅ Performance Tests: COMPLETE');
    console.log('✅ WebSocket Tests: COMPLETE');
    console.log('✅ Gesture Streaming Tests: COMPLETE');
    console.log('✅ Speech Streaming Tests: COMPLETE');
  } else {
    console.log('❌ SOME TEST SUITES FAILED');
    console.log('Please check the output above for details.');
  }
  
  return allPassed;
}

// Run all tests
if (typeof require !== 'undefined' && require.main === module) {
  runAllTestSuites().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export default runAllTestSuites;