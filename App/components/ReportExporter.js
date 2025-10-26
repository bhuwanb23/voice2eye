/**
 * Report Exporter Component
 * Allows filtering analytics data by time period and exporting reports
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useAccessibility } from './AccessibilityProvider';

const ReportExporter = ({ data }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [exporting, setExporting] = useState(false);

  const timePeriods = [
    { id: '24h', label: 'Last 24 Hours', days: 1 },
    { id: '7d', label: 'Last 7 Days', days: 7 },
    { id: '30d', label: 'Last 30 Days', days: 30 },
    { id: '90d', label: 'Last 90 Days', days: 90 },
    { id: 'custom', label: 'Custom Range', days: 0 }
  ];

  const filteredData = data || {
    voiceCommands: 145,
    gestures: 89,
    emergencies: 12,
    avgAccuracy: 94.5,
    avgResponseTime: 4.2
  };

  const generateCSVReport = (period) => {
    const periodLabel = timePeriods.find(p => p.id === period)?.label || 'Unknown';
    const timestamp = new Date().toISOString().split('T')[0];
    
    const csvContent = [
      `VOICE2EYE Analytics Report - ${periodLabel}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'Metric,Value',
      `Voice Commands,${filteredData.voiceCommands}`,
      `Gestures Detected,${filteredData.gestures}`,
      `Emergency Alerts,${filteredData.emergencies}`,
      `Average Accuracy,${filteredData.avgAccuracy}%`,
      `Average Response Time,${filteredData.avgResponseTime}s`,
      '',
      'Report Period:',
      `Start: ${new Date(Date.now() - (timePeriods.find(p => p.id === period)?.days * 24 * 60 * 60 * 1000)).toLocaleDateString()}`,
      `End: ${new Date().toLocaleDateString()}`
    ].join('\n');

    return csvContent;
  };

  const generateJSONReport = (period) => {
    const periodLabel = timePeriods.find(p => p.id === period)?.label || 'Unknown';
    
    return JSON.stringify({
      reportType: 'VOICE2EYE Analytics Report',
      generatedAt: new Date().toISOString(),
      period: periodLabel,
      periodDays: timePeriods.find(p => p.id === period)?.days,
      data: {
        statistics: {
          voiceCommands: filteredData.voiceCommands,
          gestures: filteredData.gestures,
          emergencies: filteredData.emergencies,
          avgAccuracy: filteredData.avgAccuracy,
          avgResponseTime: filteredData.avgResponseTime
        },
        metadata: {
          startDate: new Date(Date.now() - (timePeriods.find(p => p.id === period)?.days * 24 * 60 * 60 * 1000)).toISOString(),
          endDate: new Date().toISOString()
        }
      }
    }, null, 2);
  };

  const exportReport = async (format) => {
    setExporting(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const extension = format === 'csv' ? 'csv' : 'json';
      const filename = `voice2eye_report_${timestamp}.${extension}`;
      const filepath = `${FileSystem.documentDirectory}${filename}`;

      let content;
      if (format === 'csv') {
        content = generateCSVReport(selectedPeriod);
      } else {
        content = generateJSONReport(selectedPeriod);
      }

      await FileSystem.writeAsStringAsync(filepath, content);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(filepath, {
          mimeType: format === 'csv' ? 'text/csv' : 'application/json',
          dialogTitle: 'Export VOICE2EYE Report'
        });
      } else {
        Alert.alert(
          'Export Complete',
          `Report saved to: ${filename}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Export Failed',
        `Error exporting report: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setExporting(false);
    }
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      <Text style={[styles.sectionLabel, { color: colors.text }]}>Time Period</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.periodScrollContent}
      >
        {timePeriods.map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.periodButton,
              {
                backgroundColor: selectedPeriod === period.id ? colors.primary : colors.surface,
                borderColor: colors.primary
              }
            ]}
            onPress={() => setSelectedPeriod(period.id)}
            accessible={true}
            accessibilityLabel={`Select ${period.label}`}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.periodButtonText,
                {
                  color: selectedPeriod === period.id ? '#FFFFFF' : colors.text
                }
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderDataPreview = () => (
    <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.previewTitle, { color: colors.text }]}>Data Preview</Text>
      <View style={styles.previewRow}>
        <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Period:</Text>
        <Text style={[styles.previewValue, { color: colors.text }]}>
          {timePeriods.find(p => p.id === selectedPeriod)?.label}
        </Text>
      </View>
      <View style={styles.previewRow}>
        <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Voice Commands:</Text>
        <Text style={[styles.previewValue, { color: colors.primary }]}>
          {filteredData.voiceCommands}
        </Text>
      </View>
      <View style={styles.previewRow}>
        <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Gestures:</Text>
        <Text style={[styles.previewValue, { color: colors.accent }]}>
          {filteredData.gestures}
        </Text>
      </View>
      <View style={styles.previewRow}>
        <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Emergencies:</Text>
        <Text style={[styles.previewValue, { color: colors.error }]}>
          {filteredData.emergencies}
        </Text>
      </View>
      <View style={styles.previewRow}>
        <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Avg Accuracy:</Text>
        <Text style={[styles.previewValue, { color: colors.success }]}>
          {filteredData.avgAccuracy}%
        </Text>
      </View>
      <View style={styles.previewRow}>
        <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Avg Response:</Text>
        <Text style={[styles.previewValue, { color: colors.warning }]}>
          {filteredData.avgResponseTime}s
        </Text>
      </View>
    </View>
  );

  const renderExportButtons = () => (
    <View style={styles.exportButtons}>
      <Text style={[styles.sectionLabel, { color: colors.text }]}>Export Format</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: colors.success }]}
          onPress={() => exportReport('csv')}
          disabled={exporting}
          accessible={true}
          accessibilityLabel="Export as CSV"
          accessibilityRole="button"
        >
          <Text style={styles.exportButtonIcon}>📊</Text>
          <Text style={styles.exportButtonText}>CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: colors.primary }]}
          onPress={() => exportReport('json')}
          disabled={exporting}
          accessible={true}
          accessibilityLabel="Export as JSON"
          accessibilityRole="button"
        >
          <Text style={styles.exportButtonIcon}>📄</Text>
          <Text style={styles.exportButtonText}>JSON</Text>
        </TouchableOpacity>
      </View>
      {exporting && (
        <Text style={[styles.exportStatus, { color: colors.primary }]}>
          Exporting...
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Export Report</Text>
      
      {renderPeriodSelector()}
      {renderDataPreview()}
      {renderExportButtons()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  periodSelector: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  periodScrollContent: {
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    marginRight: 8,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  previewLabel: {
    fontSize: 14,
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  exportButtons: {
    paddingHorizontal: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  exportButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exportButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  exportStatus: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ReportExporter;
