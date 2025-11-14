/**
 * Test script for Emergency API endpoints
 * This script tests the emergency API integration
 */
import apiService from '../api/services/apiService.js';

// Mock useAccessibility hook
jest.mock('../components/AccessibilityProvider', () => ({
  useAccessibility: () => ({
    isScreenReaderEnabled: false,
    isHighContrastEnabled: false,
    isReducedMotionEnabled: false,
  }),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Emergency API Integration', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('should trigger emergency alert', async () => {
    // Mock successful response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        alert_id: 'test-alert-123',
        status: 'triggered',
        timestamp: new Date().toISOString()
      })
    });

    const triggerData = {
      trigger_type: 'manual',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'New York, NY'
      },
      message: 'Test emergency alert'
    };

    const result = await apiService.triggerEmergency(triggerData);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/emergency/trigger',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(triggerData),
      }
    );

    expect(result.alert_id).toBe('test-alert-123');
    expect(result.status).toBe('triggered');
  });

  test('should confirm emergency alert', async () => {
    // Mock successful response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        alert_id: 'test-alert-123',
        status: 'confirmed',
        timestamp: new Date().toISOString()
      })
    });

    const result = await apiService.confirmEmergency('test-alert-123');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/emergency/confirm',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alert_id: 'test-alert-123' }),
      }
    );

    expect(result.alert_id).toBe('test-alert-123');
    expect(result.status).toBe('confirmed');
  });

  test('should cancel emergency alert', async () => {
    // Mock successful response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        alert_id: 'test-alert-123',
        status: 'cancelled',
        timestamp: new Date().toISOString()
      })
    });

    const result = await apiService.cancelEmergency('test-alert-123', 'Test cancellation');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/emergency/cancel',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          alert_id: 'test-alert-123',
          cancellation_reason: 'Test cancellation'
        }),
      }
    );

    expect(result.alert_id).toBe('test-alert-123');
    expect(result.status).toBe('cancelled');
  });

  test('should get emergency status', async () => {
    // Mock successful response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        alert_id: 'test-alert-123',
        status: 'active',
        trigger_type: 'manual',
        timestamp: new Date().toISOString()
      })
    });

    const result = await apiService.getEmergencyStatus('test-alert-123');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/emergency/status/test-alert-123'
    );

    expect(result.alert_id).toBe('test-alert-123');
    expect(result.status).toBe('active');
  });

  test('should get emergency history', async () => {
    // Mock successful response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        alerts: [
          {
            alert_id: 'test-alert-123',
            status: 'resolved',
            trigger_type: 'manual',
            timestamp: new Date().toISOString()
          }
        ],
        total_count: 1
      })
    });

    const result = await apiService.getEmergencyHistory(30, 50);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/emergency/history?days=30&limit=50'
    );

    expect(result.alerts).toHaveLength(1);
    expect(result.alerts[0].alert_id).toBe('test-alert-123');
  });

  test('should handle API errors gracefully', async () => {
    // Mock error response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    await expect(
      apiService.triggerEmergency({})
    ).rejects.toThrow('API Error: 500 Internal Server Error');
  });

  test('should handle network errors', async () => {
    // Mock network error
    global.fetch.mockRejectedValueOnce(new Error('Network request failed'));

    await expect(
      apiService.triggerEmergency({})
    ).rejects.toThrow('Network request failed');
  });

  test('should handle invalid JSON responses', async () => {
    // Mock response with invalid JSON
    global.fetch.mockResolvedValueOnce(
      Promise.resolve({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      })
    );

    await expect(
      apiService.getEmergencyContacts(true)
    ).rejects.toThrow('Invalid JSON');
  });
});