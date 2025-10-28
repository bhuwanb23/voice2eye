/**
 * Test script for API Service
 * Run this to verify API integration is working
 */
import apiService from './apiService';

async function testApiIntegration() {
  console.log('Testing API Service Integration...');
  
  try {
    // Test health check
    console.log('1. Testing health check...');
    const health = await apiService.checkHealth();
    console.log('✅ Health check passed:', health);
    
    // Test settings retrieval
    console.log('2. Testing settings retrieval...');
    const settings = await apiService.getSettings();
    console.log('✅ Settings retrieval passed:', settings);
    
    // Test contacts retrieval
    console.log('3. Testing contacts retrieval...');
    const contacts = await apiService.getEmergencyContacts();
    console.log('✅ Contacts retrieval passed:', contacts);
    
    console.log('All API tests passed! 🎉');
    return true;
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testApiIntegration();
}

export default testApiIntegration;