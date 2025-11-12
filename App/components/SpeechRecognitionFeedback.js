/**
 * Speech Recognition Feedback Component
 * Displays real-time speech recognition results with visual feedback
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const SpeechRecognitionFeedback = ({ results, onClear }) => {
  // Get confidence color
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return '#4CAF50'; // High confidence - green
    if (confidence >= 0.7) return '#FF9800'; // Medium confidence - orange
    return '#F44336'; // Low confidence - red
  };

  // Get confidence text
  const getConfidenceText = (confidence) => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recognition Results</Text>
        {results.length > 0 && (
          <Text style={styles.clearButton} onPress={onClear}>
            Clear
          </Text>
        )}
      </View>
      
      <ScrollView style={styles.resultsContainer}>
        {results.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No recognition results yet</Text>
            <Text style={styles.emptySubtext}>Start streaming to see real-time results</Text>
          </View>
        ) : (
          results.map((result) => (
            <View key={result.id || result.timestamp} style={styles.resultItem}>
              <Text style={styles.resultText}>{result.text || 'No text available'}</Text>
              
              <View style={styles.metadata}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Confidence:</Text>
                  <Text style={styles.metaValue}>
                    {result.confidence ? (result.confidence * 100).toFixed(1) + '%' : 'N/A'}
                  </Text>
                </View>
                
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Type:</Text>
                  <Text style={styles.metaValue}>
                    {result.partial ? 'Partial' : 'Final'}
                  </Text>
                </View>
              </View>
              
              {result.confidence !== undefined && (
                <View style={styles.confidenceContainer}>
                  <View style={styles.confidenceBar}>
                    <View 
                      style={[
                        styles.confidenceFill, 
                        { 
                          width: `${result.confidence * 100}%`,
                          backgroundColor: getConfidenceColor(result.confidence)
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.confidenceText, { color: getConfidenceColor(result.confidence) }]}>
                    {getConfidenceText(result.confidence)} Confidence
                  </Text>
                </View>
              )}
              
              <Text style={styles.timestamp}>
                Received: {formatTimestamp(result.timestamp || result.receivedAt)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  resultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
  },
  metaLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  metaValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  confidenceContainer: {
    marginVertical: 8,
  },
  confidenceBar: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    marginBottom: 4,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
});

export default SpeechRecognitionFeedback;