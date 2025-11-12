/**
 * Real-time Speech Streaming Component
 * Complete UI component for real-time speech recognition with WebSocket streaming
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import SpeechStreamingService from '../services/SpeechStreamingService';
import ConnectionStatusIndicator from './ConnectionStatusIndicator';
import SpeechRecognitionFeedback from './SpeechRecognitionFeedback';

const RealTimeSpeechStreaming = () => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionResults, setRecognitionResults] = useState([]);
  const [reconnectInfo, setReconnectInfo] = useState(null);

  // Handle connection status changes
  const handleStatusChange = useCallback((status) => {
    setConnectionStatus(status);
    console.log('Connection status changed:', status);
  }, []);

  // Handle recognition results
  const handleRecognitionResult = useCallback((result) => {
    console.log('Recognition result received:', result);
    
    // Add timestamp if not present
    const resultWithTimestamp = {
      ...result,
      id: Date.now() + Math.random(), // Unique ID for list keys
      receivedAt: new Date().toLocaleTimeString()
    };
    
    setRecognitionResults(prev => [resultWithTimestamp, ...prev.slice(0, 19)]); // Keep last 20 results
  }, []);

  // Handle errors
  const handleError = useCallback((error) => {
    console.error('Speech streaming error:', error);
    Alert.alert('Error', error.message || 'An error occurred during speech streaming');
  }, []);

  // Handle reconnection attempts
  const handleReconnect = useCallback((attempt, maxAttempts, delay) => {
    setReconnectInfo({
      attempt,
      maxAttempts,
      delay: Math.round(delay / 1000) // Convert to seconds
    });
  }, []);

  // Force reconnection
  const forceReconnect = async () => {
    try {
      setReconnectInfo(null);
      const success = await SpeechStreamingService.forceReconnect();
      if (success) {
        Alert.alert('Success', 'Reconnected to speech streaming service');
      } else {
        Alert.alert('Error', 'Failed to reconnect to speech streaming service');
      }
    } catch (error) {
      console.error('Reconnection error:', error);
      Alert.alert('Error', 'Failed to reconnect: ' + error.message);
    }
  };

  // Set up callbacks
  useEffect(() => {
    SpeechStreamingService.setOnResult(handleRecognitionResult);
    SpeechStreamingService.setOnError(handleError);
    SpeechStreamingService.setOnStatusChange(handleStatusChange);
    SpeechStreamingService.setOnReconnect(handleReconnect);

    // Cleanup on unmount
    return () => {
      SpeechStreamingService.disconnect();
    };
  }, [handleRecognitionResult, handleError, handleStatusChange, handleReconnect]);

  // Connect to WebSocket
  const connectToStream = async () => {
    try {
      const success = await SpeechStreamingService.connect();
      if (success) {
        Alert.alert('Success', 'Connected to speech streaming service');
      } else {
        Alert.alert('Error', 'Failed to connect to speech streaming service');
      }
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Error', 'Failed to connect: ' + error.message);
    }
  };

  // Disconnect from WebSocket
  const disconnectFromStream = () => {
    SpeechStreamingService.disconnect();
    setReconnectInfo(null);
    Alert.alert('Disconnected', 'Disconnected from speech streaming service');
  };

  // Start streaming
  const startStreaming = async () => {
    try {
      const success = await SpeechStreamingService.startStreaming();
      if (success) {
        setIsStreaming(true);
        setIsRecording(true);
        Alert.alert('Success', 'Started streaming audio');
      }
    } catch (error) {
      console.error('Streaming start error:', error);
      Alert.alert('Error', 'Failed to start streaming: ' + error.message);
    }
  };

  // Stop streaming
  const stopStreaming = async () => {
    try {
      await SpeechStreamingService.stopStreaming();
      setIsStreaming(false);
      setIsRecording(false);
      Alert.alert('Stopped', 'Stopped streaming audio');
    } catch (error) {
      console.error('Streaming stop error:', error);
      Alert.alert('Error', 'Failed to stop streaming: ' + error.message);
    }
  };

  // Clear results
  const clearResults = () => {
    setRecognitionResults([]);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FF9800';
      case 'disconnected': return '#F44336';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Real-time Speech Streaming</Text>
        <Text style={styles.subtitle}>WebSocket-powered speech recognition</Text>
      </View>
      
      {/* Connection Status */}
      <ConnectionStatusIndicator 
        status={connectionStatus} 
        reconnectInfo={reconnectInfo} 
        onForceReconnect={forceReconnect}
      />
      
      {/* Control Buttons */}
      <View style={styles.controlSection}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              connectionStatus === 'connected' && styles.buttonDisabled
            ]}
            onPress={connectToStream}
            disabled={connectionStatus === 'connected'}
          >
            {connectionStatus === 'connecting' ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Connect</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.button,
              styles.secondaryButton,
              connectionStatus !== 'connected' && styles.buttonDisabled
            ]}
            onPress={disconnectFromStream}
            disabled={connectionStatus !== 'connected'}
          >
            <Text style={styles.buttonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.successButton,
              (!isStreaming || !isRecording) && styles.buttonDisabled
            ]}
            onPress={startStreaming}
            disabled={isStreaming && isRecording}
          >
            {isRecording ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Start Streaming</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.button,
              styles.dangerButton,
              (!isStreaming || !isRecording) && styles.buttonDisabled
            ]}
            onPress={stopStreaming}
            disabled={!isStreaming || !isRecording}
          >
            <Text style={styles.buttonText}>Stop Streaming</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Recognition Results */}
      <View style={styles.resultsSection}>
        <SpeechRecognitionFeedback 
          results={recognitionResults} 
          onClear={clearResults} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  controlSection: {
    margin: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    marginHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  secondaryButton: {
    backgroundColor: '#FF9800',
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  dangerButton: {
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
  resultsSection: {
    flex: 1,
    margin: 16,
  },
});

export default RealTimeSpeechStreaming;