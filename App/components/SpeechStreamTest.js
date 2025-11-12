/**
 * Speech Stream Test Component
 * Test component for WebSocket speech streaming functionality
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import apiService from '../api/services/apiService';

const SpeechStreamTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [recognitionResults, setRecognitionResults] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const webSocketRef = useRef(null);

  const connectToSpeechStream = () => {
    try {
      console.log('Connecting to speech stream WebSocket...');
      setConnectionStatus('connecting');
      
      webSocketRef.current = apiService.connectSpeechStream(
        (data) => {
          console.log('Speech result received:', data);
          setRecognitionResults(prev => [...prev, data]);
        },
        (error) => {
          console.error('Speech WebSocket error:', error);
          setConnectionStatus('error');
          Alert.alert('Error', 'WebSocket connection error: ' + error.message);
        },
        () => {
          console.log('Speech WebSocket closed');
          setConnectionStatus('disconnected');
          setIsStreaming(false);
        }
      );
      
      // Simulate sending some data after connection
      setTimeout(() => {
        if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
          setConnectionStatus('connected');
          setIsStreaming(true);
          
          // Send test message
          webSocketRef.current.send(JSON.stringify({
            type: 'test',
            data: 'Hello from client'
          }));
        }
      }, 1000);
      
    } catch (error) {
      console.error('Failed to connect to speech stream:', error);
      setConnectionStatus('error');
      Alert.alert('Error', 'Failed to connect: ' + error.message);
    }
  };

  const disconnectFromSpeechStream = () => {
    if (webSocketRef.current) {
      webSocketRef.current.close();
      setConnectionStatus('disconnected');
      setIsStreaming(false);
    }
  };

  const clearResults = () => {
    setRecognitionResults([]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FF9800';
      case 'disconnected': return '#F44336';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Speech Stream Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          Status: {connectionStatus}
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button, 
            connectionStatus === 'connected' ? styles.buttonDisabled : styles.buttonPrimary
          ]}
          onPress={connectToSpeechStream}
          disabled={connectionStatus === 'connected'}
        >
          <Text style={styles.buttonText}>
            {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.button, 
            connectionStatus !== 'connected' ? styles.buttonDisabled : styles.buttonSecondary
          ]}
          onPress={disconnectFromSpeechStream}
          disabled={connectionStatus !== 'connected'}
        >
          <Text style={styles.buttonText}>Disconnect</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Recognition Results</Text>
          <TouchableOpacity onPress={clearResults}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.resultsList}>
          {recognitionResults.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <Text style={styles.resultText}>{result.text || 'No text'}</Text>
              <Text style={styles.resultMeta}>
                Confidence: {(result.confidence * 100).toFixed(1)}% | 
                {result.partial ? ' Partial' : ' Final'}
              </Text>
            </View>
          ))}
          
          {recognitionResults.length === 0 && (
            <Text style={styles.noResults}>No results yet. Connect and send audio to see results.</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#2196F3',
  },
  buttonSecondary: {
    backgroundColor: '#F44336',
  },
  buttonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearText: {
    color: '#2196F3',
    fontSize: 16,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
  },
  resultMeta: {
    fontSize: 12,
    color: '#757575',
  },
  noResults: {
    textAlign: 'center',
    color: '#757575',
    marginTop: 20,
  },
});

export default SpeechStreamTest;