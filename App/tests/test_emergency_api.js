/**
 * Test script for Emergency API endpoints
 * This script tests the emergency API integration
 */
import apiService from '../api/services/apiService';

// Mock useAccessibility hook
jest.mock('../components/AccessibilityProvider', () => ({
  useAccessibility: () => ({
    settings: {
      voiceNavigation: false,
      speechRate: 1.0,
      speechPitch: 1.0,
      theme: 'light',
      highContrast: false,
    },
    getThemeColors: () => ({
      primary: '#4A90E2',
      secondary: '#2E7D32',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#212529',
      textSecondary: '#6C757D',
      accent: '#FF6B6B',
      error: '#DC3545',
      success: '#28A745',
      warning: '#FFC107',
      border: '#DEE2E6',
    }),
    updateSetting: jest.fn(),
    saveSettings: jest.fn(),
    resetToDefaults: jest.fn(),
    getAccessibilityProps: jest.fn(),
  }),
}));

describe('Emergency API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should trigger emergency successfully', async () => {
    // Mock the API response
    const mockResponse = {
      alert_id: 'test_alert_123',
      status: 'pending',
      confirmation_required: true,
      confirmation_timeout: 30,
      timestamp: '2023-01-01T00:00:00Z'
    };

    // Mock the fetch implementation
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    const result = await apiService.triggerEmergency({
      trigger_type: 'manual',
      trigger_data: {
        emergency_type: 'general',
        custom_message: 'Test emergency',
        location: 'Test location'
      }
    });

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/emergency/trigger'),
      expect.objectContaining({
        method: 'POST',
        body: expect.any(String)
      })
    );
  });

  it('should confirm emergency successfully', async () => {
    // Mock the API response
    const mockResponse = {
      alert_id: 'test_alert_123',
      status: 'confirmed',
      messages_sent: 3,
      failed_contacts: 0,
      timestamp: '2023-01-01T00:00:00Z'
    };

    // Mock the fetch implementation
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    const result = await apiService.confirmEmergency('test_alert_123');

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/emergency/confirm'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ alert_id: 'test_alert_123' })
      })
    );
  });

  it('should cancel emergency successfully', async () => {
    // Mock the API response
    const mockResponse = {
      alert_id: 'test_alert_123',
      status: 'cancelled',
      cancellation_reason: 'User cancelled',
      timestamp: '2023-01-01T00:00:00Z'
    };

    // Mock the fetch implementation
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    const result = await apiService.cancelEmergency('test_alert_123', 'User cancelled');

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/emergency/cancel'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ 
          alert_id: 'test_alert_123', 
          cancellation_reason: 'User cancelled' 
        })
      })
    );
  });

  it('should get emergency status successfully', async () => {
    // Mock the API response
    const mockResponse = {
      alert_id: 'test_alert_123',
      status: 'confirmed',
      trigger_type: 'manual',
      messages_sent: [],
      location: 'Test location',
      timestamp: '2023-01-01T00:00:00Z'
    };

    // Mock the fetch implementation
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    const result = await apiService.getEmergencyStatus('test_alert_123');

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/emergency/status/test_alert_123'),
      expect.objectContaining({
        method: 'GET'
      })
    );
  });

  it('should get emergency history successfully', async () => {
    // Mock the API response
    const mockResponse = {
      alerts: [
        {
          alert_id: 'test_alert_123',
          trigger_type: 'manual',
          status: 'confirmed',
          timestamp: '2023-01-01T00:00:00Z',
          location: 'Test location',
          messages_sent: 3
        }
      ],
      total_count: 1,
      days: 30,
      limit: 50
    };

    // Mock the fetch implementation
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    const result = await apiService.getEmergencyHistory(30, 50);

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/emergency/history?days=30&limit=50'),
      expect.objectContaining({
        method: 'GET'
      })
    );
  });

  it('should get emergency contacts successfully', async () => {
    // Mock the API response
    const mockResponse = {
      contacts: [
        {
          id: '1',
          name: 'Emergency Services',
          phone: '911',
          priority: 'high',
          group: 'emergency',
          relationship: 'Emergency Services',
          isPrimary: true,
          enabled: true
        }
      ]
    };

    // Mock the fetch implementation
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    const result = await apiService.getEmergencyContacts(true);

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/settings/contacts?enabled_only=true'),
      expect.objectContaining({
        method: 'GET'
      })
    );
  });

  it('should handle trigger emergency API error', async () => {
    // Mock the fetch implementation to return an error
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })
    );

    await expect(
      apiService.triggerEmergency({
        trigger_type: 'manual',
        trigger_data: {
          emergency_type: 'general',
          custom_message: 'Test emergency',
          location: 'Test location'
        }
      })
    ).rejects.toThrow('HTTP error! status: 500');
  });

  it('should handle confirm emergency API error', async () => {
    // Mock the fetch implementation to return an error
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })
    );

    await expect(
      apiService.confirmEmergency('nonexistent_alert')
    ).rejects.toThrow('HTTP error! status: 404');
  });

  it('should handle cancel emergency API error', async () => {
    // Mock the fetch implementation to return an error
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      })
    );

    await expect(
      apiService.cancelEmergency('invalid_alert', 'User cancelled')
    ).rejects.toThrow('HTTP error! status: 400');
  });

  it('should handle get emergency status API error', async () => {
    // Mock the fetch implementation to return an error
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })
    );

    await expect(
      apiService.getEmergencyStatus('nonexistent_alert')
    ).rejects.toThrow('HTTP error! status: 404');
  });

  it('should handle network error', async () => {
    // Mock the fetch implementation to throw a network error
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network error'))
    );

    await expect(
      apiService.getEmergencyHistory(30, 50)
    ).rejects.toThrow('Network error');
  });

  it('should handle JSON parsing error', async () => {
    // Mock the fetch implementation to return invalid JSON
    global.fetch = jest.fn(() =>
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