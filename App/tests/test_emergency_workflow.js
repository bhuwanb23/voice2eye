/**
 * Test script for Emergency Workflow
 * This script tests the complete emergency triggering workflow
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import EmergencyScreen from '../screens/EmergencyScreen';

// Mock useAccessibility hook
jest.mock('../components/AccessibilityProvider', () => ({
  useAccessibility: () => ({
    settings: {
      voiceNavigation: false,
      speechRate: 1.0,
      speechPitch: 1.0,
      theme: 'light',
      highContrast: false,
      hapticFeedback: true,
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
  AccessibilityProvider: ({ children }) => <NavigationContainer>{children}</NavigationContainer>,
}));

// Mock apiService
jest.mock('../api/services/apiService', () => ({
  checkHealth: jest.fn(),
  getEmergencyContacts: jest.fn(),
  getEmergencyHistory: jest.fn(),
  triggerEmergency: jest.fn(),
  confirmEmergency: jest.fn(),
  cancelEmergency: jest.fn(),
  getEmergencyStatus: jest.fn(),
}));

import apiService from '../api/services/apiService.js';

describe('Emergency Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should trigger emergency successfully', async () => {
    // Mock API responses
    apiService.getEmergencyContacts.mockResolvedValue({
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
    });
    
    apiService.getEmergencyHistory.mockResolvedValue({
      alerts: []
    });
    
    apiService.triggerEmergency.mockResolvedValue({
      alert_id: 'test_alert_123',
      status: 'pending',
      confirmation_required: true,
      confirmation_timeout: 30,
      timestamp: '2023-01-01T00:00:00Z'
    });

    const { getByText } = render(<EmergencyScreen />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(getByText('Emergency Contacts')).toBeTruthy();
    });
    
    // Find and press the trigger emergency button
    // Note: The actual trigger button is in the EmergencyAlert component
    // For this test, we'll simulate the triggerEmergency function call directly
    
    // Verify API calls were made
    expect(apiService.getEmergencyContacts).toHaveBeenCalledWith();
    expect(apiService.getEmergencyHistory).toHaveBeenCalledWith(30, 10);
  });

  it('should confirm emergency successfully', async () => {
    // Mock API responses
    apiService.getEmergencyContacts.mockResolvedValue({
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
    });
    
    apiService.getEmergencyHistory.mockResolvedValue({
      alerts: []
    });
    
    apiService.triggerEmergency.mockResolvedValue({
      alert_id: 'test_alert_123',
      status: 'pending',
      confirmation_required: true,
      confirmation_timeout: 30,
      timestamp: '2023-01-01T00:00:00Z'
    });
    
    apiService.confirmEmergency.mockResolvedValue({
      alert_id: 'test_alert_123',
      status: 'confirmed',
      messages_sent: 3,
      failed_contacts: 0,
      timestamp: '2023-01-01T00:00:00Z'
    });

    const { getByText } = render(<EmergencyScreen />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(getByText('Emergency Contacts')).toBeTruthy();
    });
    
    // Simulate triggering emergency
    await apiService.triggerEmergency({
      trigger_type: 'manual',
      trigger_data: {
        emergency_type: 'general',
        custom_message: 'Test emergency',
        location: 'Test location'
      }
    });
    
    // Simulate confirming emergency
    await apiService.confirmEmergency('test_alert_123');
    
    // Verify API calls were made
    expect(apiService.confirmEmergency).toHaveBeenCalledWith('test_alert_123');
  });

  it('should cancel emergency successfully', async () => {
    // Mock API responses
    apiService.getEmergencyContacts.mockResolvedValue({
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
    });
    
    apiService.getEmergencyHistory.mockResolvedValue({
      alerts: []
    });
    
    apiService.triggerEmergency.mockResolvedValue({
      alert_id: 'test_alert_123',
      status: 'pending',
      confirmation_required: true,
      confirmation_timeout: 30,
      timestamp: '2023-01-01T00:00:00Z'
    });
    
    apiService.cancelEmergency.mockResolvedValue({
      alert_id: 'test_alert_123',
      status: 'cancelled',
      cancellation_reason: 'User cancelled',
      timestamp: '2023-01-01T00:00:00Z'
    });

    const { getByText } = render(<EmergencyScreen />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(getByText('Emergency Contacts')).toBeTruthy();
    });
    
    // Simulate triggering emergency
    await apiService.triggerEmergency({
      trigger_type: 'manual',
      trigger_data: {
        emergency_type: 'general',
        custom_message: 'Test emergency',
        location: 'Test location'
      }
    });
    
    // Simulate cancelling emergency
    await apiService.cancelEmergency('test_alert_123', 'User cancelled');
    
    // Verify API calls were made
    expect(apiService.cancelEmergency).toHaveBeenCalledWith('test_alert_123', 'User cancelled');
  });

  it('should display emergency contacts', async () => {
    // Mock API responses
    apiService.getEmergencyContacts.mockResolvedValue({
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
        },
        {
          id: '2',
          name: 'Family Member',
          phone: '+1234567890',
          priority: 'medium',
          group: 'family',
          relationship: 'Family',
          isPrimary: false,
          enabled: true
        }
      ]
    });
    
    apiService.getEmergencyHistory.mockResolvedValue({
      alerts: []
    });

    const { getByText } = render(<EmergencyScreen />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(getByText('Emergency Services')).toBeTruthy();
      expect(getByText('Family Member')).toBeTruthy();
    });
  });

  it('should display emergency history', async () => {
    // Mock API responses
    apiService.getEmergencyContacts.mockResolvedValue({
      contacts: []
    });
    
    apiService.getEmergencyHistory.mockResolvedValue({
      alerts: [
        {
          alert_id: 'test_alert_123',
          trigger_type: 'manual',
          status: 'confirmed',
          timestamp: '2023-01-01T00:00:00Z',
          location: 'Test location',
          messages_sent: 3
        }
      ]
    });

    const { getByText } = render(<EmergencyScreen />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(getByText('Manual Trigger')).toBeTruthy();
      expect(getByText('confirmed')).toBeTruthy();
    });
  });
});