/**
 * Report Exporter Component
 * Compact report export with time filtering
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useAccessibility } from './AccessibilityProvider';
import apiService from '../api/services/apiService';

const ReportExporter = ({ data }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [exporting, setExporting] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const timePeriods = [
    { id: '24h', label: '24H', days: 1 },
    { id: '7d', label: '7D', days: 7 },
    { id: '30d', label: '30D', days: 30 },
    { id: '90d', label: '90D', days: 90 }
  ];

  const exportData = async (format) => {
    setExporting(true);
    try {
      // Calculate date range based on selected period
      const endDate = new Date();
      const startDate = new Date();
      const selectedPeriodData = timePeriods.find(p => p.id === selectedPeriod);
      
      if (selectedPeriodData) {
        startDate.setDate(startDate.getDate() - selectedPeriodData.days);
      }

      // Generate report using API
      const reportData = await apiService.generateReport(
        startDate.toISOString(),
        endDate.toISOString(),
        format
      );

      // If API returns file content, use it; otherwise generate from local data
      let content;
      if (reportData && typeof reportData === 'string') {
        content = reportData;
      } else {
        const localReportData = {
          period: selectedPeriod,
          data: data || {},
          generatedAt: new Date().toISOString(),
          apiData: reportData
        };

        content = format === 'json' 
          ? JSON.stringify(localReportData, null, 2)
          : generateCSV(localReportData);
      }

      const filename = `voice2eye_report_${selectedPeriod}_${Date.now()}.${format}`;
      const fileUri = FileSystem.documentDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, content);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: format === 'json' ? 'application/json' : 'text/csv',
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Error', 'Failed to generate report: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const generateCSV = (data) => {
    return `Period,${selectedPeriod}\n` +
           `Generated,${data.generatedAt}\n` +
           `Voice Commands,${data.data.voiceCommands || 0}\n` +
           `Gestures,${data.data.gestures || 0}\n` +
           `Emergencies,${data.data.emergencies || 0}\n` +
           `Avg Accuracy,${data.data.avgAccuracy || 0}\n` +
           `Avg Response Time,${data.data.avgResponseTime || 0}\n` +
           `API Data Available,${data.apiData ? 'Yes' : 'No'}`;
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Export Report</Text>
      </View>

      {/* Time Period Selector */}
      <View style={styles.periodContainer}>
        {timePeriods.map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.periodButton,
              {
                backgroundColor: selectedPeriod === period.id ? colors.primary : colors.surface,
                borderColor: colors.primary,
              }
            ]}
            onPress={() => setSelectedPeriod(period.id)}
          >
            <Text style={[
              styles.periodLabel,
              { color: selectedPeriod === period.id ? '#fff' : colors.primary }
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Export Buttons */}
      <View style={styles.exportContainer}>
        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: colors.primary }]}
          onPress={() => exportData('json')}
          disabled={exporting}
        >
          <Text style={styles.exportButtonText}>
            {exporting ? 'Exporting...' : '📄 JSON'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: colors.success }]}
          onPress={() => exportData('csv')}
          disabled={exporting}
        >
          <Text style={styles.exportButtonText}>
            {exporting ? 'Exporting...' : '📊 CSV'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Info text */}
      <Text style={[styles.infoText, { color: colors.textSecondary }]}>
        Reports will include analytics data for the selected period
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  periodContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  exportContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exportButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  exportButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  infoText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default ReportExporter;
