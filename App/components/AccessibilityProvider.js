/**
 * Accessibility Provider for VOICE2EYE
 * Manages accessibility settings and provides context to all components
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    // Visual Settings
    highContrast: false,
    textScale: 1.0, // 1.0 to 2.0 (100% to 200%)
    largeText: false,
    buttonSize: 'medium', // small, medium, large, extra-large
    
    // Audio Settings
    voiceNavigation: true,
    audioOnlyMode: false,
    speechRate: 0.8,
    speechPitch: 1.0,
    hapticFeedback: true,
    
    // Navigation Settings
    gestureNavigation: false,
    screenReader: false,
    voiceCommands: true,
    
    // Emergency Settings
    emergencyMode: false,
    emergencyContacts: [],
    
    // UI Settings
    theme: 'light', // light, dark, high-contrast
    animations: true,
    soundEffects: true,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('accessibility_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await AsyncStorage.setItem('accessibility_settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  };

  const updateSetting = (key, value) => {
    saveSettings({ [key]: value });
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      highContrast: false,
      textScale: 1.0,
      largeText: false,
      buttonSize: 'medium',
      voiceNavigation: true,
      audioOnlyMode: false,
      speechRate: 0.8,
      speechPitch: 1.0,
      hapticFeedback: true,
      gestureNavigation: false,
      screenReader: false,
      voiceCommands: true,
      emergencyMode: false,
      emergencyContacts: [],
      theme: 'light',
      animations: true,
      soundEffects: true,
    };
    saveSettings(defaultSettings);
  };

  const getAccessibilityProps = (componentType = 'default') => {
    const baseProps = {
      accessible: true,
      accessibilityRole: 'button',
    };

    switch (componentType) {
      case 'button':
        return {
          ...baseProps,
          accessibilityRole: 'button',
          accessibilityHint: 'Double tap to activate',
          style: {
            minHeight: settings.buttonSize === 'small' ? 44 : 
                      settings.buttonSize === 'medium' ? 48 :
                      settings.buttonSize === 'large' ? 56 : 64,
            minWidth: settings.buttonSize === 'small' ? 88 : 
                     settings.buttonSize === 'medium' ? 120 :
                     settings.buttonSize === 'large' ? 160 : 200,
          },
        };
      
      case 'text':
        return {
          ...baseProps,
          accessibilityRole: 'text',
          style: {
            fontSize: (settings.largeText ? 18 : 16) * settings.textScale,
            fontWeight: settings.highContrast ? 'bold' : 'normal',
          },
        };
      
      case 'header':
        return {
          ...baseProps,
          accessibilityRole: 'header',
          style: {
            fontSize: (settings.largeText ? 24 : 20) * settings.textScale,
            fontWeight: 'bold',
          },
        };
      
      case 'input':
        return {
          ...baseProps,
          accessibilityRole: 'textbox',
          accessibilityHint: 'Enter text or use voice input',
        };
      
      default:
        return baseProps;
    }
  };

  const getThemeColors = () => {
    if (settings.highContrast) {
      return {
        primary: '#000000',
        secondary: '#FFFFFF',
        background: '#FFFFFF',
        surface: '#F5F5F5',
        text: '#000000',
        textSecondary: '#333333',
        accent: '#FF0000',
        error: '#FF0000',
        success: '#00AA00',
        warning: '#FFAA00',
        border: '#000000',
      };
    }

    if (settings.theme === 'dark') {
      return {
        primary: '#BB86FC',
        secondary: '#03DAC6',
        background: '#121212',
        surface: '#1E1E1E',
        text: '#FFFFFF',
        textSecondary: '#B3B3B3',
        accent: '#FF6B6B',
        error: '#CF6679',
        success: '#4CAF50',
        warning: '#FF9800',
        border: '#333333',
      };
    }

    // Light theme
    return {
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
    };
  };

  const value = {
    settings,
    isLoading,
    updateSetting,
    saveSettings,
    resetToDefaults,
    getAccessibilityProps,
    getThemeColors,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
