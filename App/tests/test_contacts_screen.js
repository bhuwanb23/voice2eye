/**
 * Test script for Contacts Screen functionality
 * This script tests the basic functionality of the Contacts Screen
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ContactsScreen from '../screens/ContactsScreen';
import { AccessibilityProvider } from '../components/AccessibilityProvider';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Mock useAccessibility hook
jest.mock('../components/AccessibilityProvider', () => ({
  useAccessibility: () => ({
    settings: {
      voiceNavigation: false,
      speechRate: 1.0,
      speechPitch: 1.0,
    },
    getThemeColors: () => ({
      primary: '#4A90E2',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#212529',
      textSecondary: '#6C757D',
      border: '#DEE2E6',
    }),
  }),
  AccessibilityProvider: ({ children }) => <>{children}</>,
}));

describe('ContactsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <AccessibilityProvider>
        <ContactsScreen navigation={mockNavigation} />
      </AccessibilityProvider>
    );
    
    expect(getByText('Emergency Contacts')).toBeTruthy();
    expect(getByText('Manage your emergency contact list')).toBeTruthy();
  });

  it('displays sample contacts', async () => {
    const { getByText } = render(
      <AccessibilityProvider>
        <ContactsScreen navigation={mockNavigation} />
      </AccessibilityProvider>
    );
    
    // Wait for contacts to load
    await waitFor(() => {
      expect(getByText('Emergency Services')).toBeTruthy();
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Jane Smith')).toBeTruthy();
      expect(getByText('Mike Johnson')).toBeTruthy();
    });
  });

  it('shows add contact button', () => {
    const { getByText } = render(
      <AccessibilityProvider>
        <ContactsScreen navigation={mockNavigation} />
      </AccessibilityProvider>
    );
    
    const addButton = getByText('+');
    expect(addButton).toBeTruthy();
  });

  it('navigates to ContactForm when add button is pressed', () => {
    const { getByText } = render(
      <AccessibilityProvider>
        <ContactsScreen navigation={mockNavigation} />
      </AccessibilityProvider>
    );
    
    const addButton = getByText('+');
    fireEvent.press(addButton);
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('ContactForm', { mode: 'add' });
  });

  it('navigates to ContactForm when edit button is pressed', async () => {
    const { getByText } = render(
      <AccessibilityProvider>
        <ContactsScreen navigation={mockNavigation} />
      </AccessibilityProvider>
    );
    
    // Wait for contacts to load
    await waitFor(() => {
      const editButton = getByText('Edit');
      fireEvent.press(editButton);
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('ContactForm', {
        mode: 'edit',
        contact: expect.any(Object),
      });
    });
  });
});