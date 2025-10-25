/**
 * Test script for Navigation Flow
 * This script tests the navigation flow between screens
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import App from '../App';

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
  AccessibilityProvider: ({ children }) => <NavigationContainer>{children}</NavigationContainer>,
}));

describe('Navigation Flow', () => {
  it('renders the app with bottom navigation', () => {
    const { getByText } = render(<App />);
    
    // Check that the dashboard screen is rendered
    expect(getByText('VOICE2EYE')).toBeTruthy();
    
    // Check that navigation items are present
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Contacts')).toBeTruthy();
    expect(getByText('Gestures')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();
  });

  it('navigates between tabs', () => {
    const { getByText } = render(<App />);
    
    // Navigate to Contacts screen
    const contactsTab = getByText('Contacts');
    fireEvent.press(contactsTab);
    
    // Check that we're on the Contacts screen
    expect(getByText('Emergency Contacts')).toBeTruthy();
    
    // Navigate to Settings screen
    const settingsTab = getByText('Settings');
    fireEvent.press(settingsTab);
    
    // Check that we're on the Settings screen
    expect(getByText('Settings')).toBeTruthy();
  });
});