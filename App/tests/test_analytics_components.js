/**
 * Test script for Analytics Components
 * This script tests the analytics components and API integration
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import DashboardScreen from '../screens/DashboardScreen';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import AnalyticsCards from '../components/AnalyticsCards';
import PerformanceMetrics from '../components/PerformanceMetrics';
import EmergencyPatterns from '../components/EmergencyPatterns';
import ReportExporter from '../components/ReportExporter';

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

// Mock apiService
jest.mock('../api/services/apiService', () => ({
  checkHealth: jest.fn(),
  getUsageStatistics: jest.fn(),
  getPerformanceMetrics: jest.fn(),
  getEmergencyAnalytics: jest.fn(),
  generateReport: jest.fn(),
}));

import apiService from '../api/services/apiService';

describe('Analytics Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders AnalyticsDashboard with all components', () => {
    const mockUsageStats = {
      totalEvents: 100,
      voiceCommands: 60,
      gestureDetections: 30,
      emergencyEvents: 5,
      averageSessionDuration: 120.5
    };
    
    const mockServiceStatus = {
      speech: 'ready',
      gesture: 'ready',
      emergency: 'ready',
      camera: 'ready'
    };
    
    const mockMetrics = {
      latency: 150,
      accuracy: 95.5,
      uptime: 99.8,
      cpuUsage: 42
    };
    
    const mockPatterns = {
      timeOfDay: [
        { hour: '00-06', count: 2, percentage: 10 },
        { hour: '06-12', count: 8, percentage: 40 }
      ],
      triggerType: [
        { type: 'voice', count: 3, color: '#007AFF' },
        { type: 'gesture', count: 2, color: '#FF9500' }
      ],
      totalEmergencies: 5
    };
    
    const mockExportData = {
      voiceCommands: 60,
      gestures: 30,
      emergencies: 5,
      avgAccuracy: 95.5,
      avgResponseTime: 3.2
    };

    const { getByText } = render(
      <AnalyticsDashboard 
        usageStats={mockUsageStats}
        serviceStatus={mockServiceStatus}
        metrics={mockMetrics}
        patterns={mockPatterns}
        exportData={mockExportData}
      />
    );
    
    // Check that the dashboard overview title is present
    expect(getByText('Dashboard Overview')).toBeTruthy();
    
    // Check that analytics cards are rendered with correct data
    expect(getByText('100')).toBeTruthy(); // Total events
    expect(getByText('60')).toBeTruthy(); // Voice commands
  });

  it('renders AnalyticsCards with usage statistics', () => {
    const mockUsageStats = {
      totalEvents: 127,
      voiceCommands: 89,
      gestureDetections: 36,
      emergencyEvents: 2,
      averageSessionDuration: 145.6
    };

    const { getByText } = render(<AnalyticsCards usageStats={mockUsageStats} />);
    
    // Check that usage statistics are displayed correctly
    expect(getByText('127')).toBeTruthy(); // Total events
    expect(getByText('89')).toBeTruthy(); // Voice commands
    expect(getByText('36')).toBeTruthy(); // Gestures
    expect(getByText('2')).toBeTruthy(); // Emergencies
  });

  it('renders PerformanceMetrics with metrics data', () => {
    const mockMetrics = {
      latency: 150,
      accuracy: 94.5,
      uptime: 99.8,
      cpuUsage: 45
    };

    const { getByText } = render(<PerformanceMetrics metrics={mockMetrics} />);
    
    // Check that performance metrics are displayed correctly
    expect(getByText('Performance')).toBeTruthy();
    expect(getByText('150')).toBeTruthy(); // Latency
    expect(getByText('94.5')).toBeTruthy(); // Accuracy
  });

  it('renders EmergencyPatterns with pattern data', () => {
    const mockPatterns = {
      timeOfDay: [
        { hour: '00-06', count: 2, percentage: 10 },
        { hour: '06-12', count: 8, percentage: 40 }
      ],
      triggerType: [
        { type: 'voice', count: 12, color: '#007AFF' },
        { type: 'gesture', count: 5, color: '#FF9500' }
      ],
      totalEmergencies: 20
    };

    const { getByText } = render(<EmergencyPatterns patterns={mockPatterns} />);
    
    // Check that emergency patterns are displayed correctly
    expect(getByText('Emergency Patterns')).toBeTruthy();
    expect(getByText('20')).toBeTruthy(); // Total emergencies
    expect(getByText('00-06')).toBeTruthy(); // Time period
  });

  it('renders ReportExporter and handles export', async () => {
    const mockExportData = {
      voiceCommands: 145,
      gestures: 89,
      emergencies: 12,
      avgAccuracy: 94.5,
      avgResponseTime: 4.2
    };

    // Mock the API response for generateReport
    apiService.generateReport.mockResolvedValue({
      report_type: 'comprehensive_analytics',
      generated_at: '2023-01-01T00:00:00Z'
    });

    const { getByText } = render(<ReportExporter data={mockExportData} />);
    
    // Check that export report section is displayed
    expect(getByText('Export Report')).toBeTruthy();
    
    // Test JSON export button
    const jsonButton = getByText('📄 JSON');
    expect(jsonButton).toBeTruthy();
    
    // Test CSV export button
    const csvButton = getByText('📊 CSV');
    expect(csvButton).toBeTruthy();
  });
});

describe('Dashboard Screen Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads analytics data on mount', async () => {
    // Mock API responses
    apiService.getUsageStatistics.mockResolvedValue({
      total_events: 150,
      voice_commands: 100,
      gesture_detections: 45,
      emergency_events: 5,
      average_session_duration: 180.5
    });
    
    apiService.getPerformanceMetrics.mockResolvedValue({
      metrics: [
        { name: 'speech_recognition_latency', value: 200 },
        { name: 'gesture_detection_latency', value: 85 }
      ]
    });
    
    apiService.getEmergencyAnalytics.mockResolvedValue({
      triggered_count: 8,
      confirmed_count: 7,
      cancelled_count: 1,
      trigger_types: {
        voice: 4,
        gesture: 3,
        manual: 1
      },
      hourly_patterns: {
        '08': 2,
        '12': 3,
        '18': 2,
        '22': 1
      }
    });

    const { getByText } = render(<DashboardScreen />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(getByText('150')).toBeTruthy(); // Total events from API
    });
    
    // Verify API calls were made
    expect(apiService.getUsageStatistics).toHaveBeenCalledWith(7);
    expect(apiService.getPerformanceMetrics).toHaveBeenCalledWith(7);
    expect(apiService.getEmergencyAnalytics).toHaveBeenCalledWith(30);
  });

  it('handles API errors gracefully', async () => {
    // Mock API errors
    apiService.getUsageStatistics.mockRejectedValue(new Error('Network error'));
    apiService.getPerformanceMetrics.mockRejectedValue(new Error('Network error'));
    apiService.getEmergencyAnalytics.mockRejectedValue(new Error('Network error'));

    const { getByText } = render(<DashboardScreen />);
    
    // Wait for error handling
    await waitFor(() => {
      expect(getByText('Failed to load analytics - using mock data')).toBeTruthy();
    });
  });
});