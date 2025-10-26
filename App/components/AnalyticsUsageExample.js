/**
 * Analytics Components Usage Example
 * 
 * This file demonstrates how to integrate and use all the analytics dashboard components:
 * - PerformanceMetrics
 * - EmergencyPatterns
 * - ReportExporter
 * 
 * Usage in your screen component:
 */

import React from 'react';
import { ScrollView } from 'react-native';
import PerformanceMetrics from './PerformanceMetrics';
import EmergencyPatterns from './EmergencyPatterns';
import ReportExporter from './ReportExporter';

// Example usage in a screen component
export default function AnalyticsScreen() {
  // Mock data - replace with real API data
  const metricsData = {
    latency: 150,           // Response time in ms
    accuracy: 94.5,         // Recognition accuracy in %
    uptime: 99.8,           // Uptime in %
    cpuUsage: 45            // CPU usage in %
  };

  const patternsData = {
    timeOfDay: [
      { hour: '00-06', count: 2, percentage: 10 },
      { hour: '06-12', count: 8, percentage: 40 },
      { hour: '12-18', count: 6, percentage: 30 },
      { hour: '18-24', count: 4, percentage: 20 }
    ],
    dayOfWeek: [
      { day: 'Mon', count: 3 },
      { day: 'Tue', count: 5 },
      { day: 'Wed', count: 2 },
      { day: 'Thu', count: 4 },
      { day: 'Fri', count: 6 },
      { day: 'Sat', count: 1 },
      { day: 'Sun', count: 1 }
    ],
    triggerType: [
      { type: 'voice', count: 12, color: '#007AFF' },
      { type: 'gesture', count: 5, color: '#FF9500' },
      { type: 'manual', count: 3, color: '#FF3B30' }
    ],
    avgResponseTime: 5.2,
    totalEmergencies: 22
  };

  const exportData = {
    voiceCommands: 145,
    gestures: 89,
    emergencies: 12,
    avgAccuracy: 94.5,
    avgResponseTime: 4.2
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      {/* Performance Metrics with Charts */}
      <PerformanceMetrics metrics={metricsData} />
      
      {/* Emergency Patterns with Visualizations */}
      <EmergencyPatterns patterns={patternsData} />
      
      {/* Report Exporter with Time Filtering */}
      <ReportExporter data={exportData} />
    </ScrollView>
  );
}

/**
 * INTEGRATION NOTES:
 * 
 * 1. PerformanceMetrics Component:
 *    - Displays system performance with interactive charts
 *    - Features selectable metrics (latency, accuracy, uptime, CPU)
 *    - Shows progress bars and bar charts
 *    - Props: metrics (object with latency, accuracy, uptime, cpuUsage)
 * 
 * 2. EmergencyPatterns Component:
 *    - Visualizes emergency alert patterns
 *    - Shows time of day patterns, day of week trends
 *    - Displays trigger type distribution
 *    - Includes insights and recommendations
 *    - Props: patterns (object with timeOfDay, dayOfWeek, triggerType data)
 * 
 * 3. ReportExporter Component:
 *    - Filters data by time period (24h, 7d, 30d, 90d, custom)
 *    - Exports reports in CSV or JSON format
 *    - Shows data preview before export
 *    - Uses expo-sharing and expo-file-system
 *    - Props: data (object with analytics data)
 * 
 * DATA STRUCTURE EXAMPLES:
 * 
 * metricsData = {
 *   latency: 150,      // Response time in ms
 *   accuracy: 94.5,    // Accuracy percentage
 *   uptime: 99.8,      // Uptime percentage
 *   cpuUsage: 45       // CPU usage percentage
 * }
 * 
 * patternsData = {
 *   timeOfDay: [{ hour: '00-06', count: 2, percentage: 10 }, ...],
 *   dayOfWeek: [{ day: 'Mon', count: 3 }, ...],
 *   triggerType: [{ type: 'voice', count: 12, color: '#007AFF' }, ...],
 *   avgResponseTime: 5.2,
 *   totalEmergencies: 22
 * }
 * 
 * exportData = {
 *   voiceCommands: 145,
 *   gestures: 89,
 *   emergencies: 12,
 *   avgAccuracy: 94.5,
 *   avgResponseTime: 4.2
 * }
 */
