/**
 * Gesture Streaming Test Component
 * A simple component to test gesture streaming functionality
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import AccessibleButton from './AccessibleButton';
// Note: This component is for testing within the React Native app
// The actual GestureStreamingService import will work within the app environment

const GestureStreamingTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);

  // In a real implementation within the app, we would import and use the service:
  // import GestureStreamingService from '../services/GestureStreamingService';
  
  // For this test component, we'll simulate the service functionality
  const simulateGestureService = {
    setOnStatusChange: (callback) => {
      // Simulate status changes
      setTimeout(() => callback('connecting'), 100);
      setTimeout(() => callback('connected'), 1000);
    },
    
    setOnError: (callback) => {
      // Error handling would be implemented here
    },
    
    setOnResult: (callback) => {
      // Simulate receiving results
      setTimeout(() => {
        callback({
          gesture_type: 'thumbs_up',
          confidence: 0.95,
          is_emergency: false,
          bounding_box: {
            x: 0.3,
            y: 0.4,
            width: 0.2,
            height: 0.3
          }
        });
      }, 2000);
    },
    
    connect: async () => {
      // Simulate connection process
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 1500);
      });
    },
    
    disconnect: () => {
      // Simulate disconnection
    },
    
    startStreaming: async () => {
      // Simulate starting streaming
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 500);
      });
    },
    
    stopStreaming: () => {
      // Simulate stopping streaming
    },
    
    forceReconnect: async () => {
      // Simulate reconnection
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 2000);
      });
    }
  };

  useEffect(() => {
    // Set up callbacks for the gesture streaming service
    simulateGestureService.setOnStatusChange((status) => {
      setConnectionStatus(status);
      console.log('Gesture connection status:', status);
    });

    simulateGestureService.setOnError((error) => {
      setError(error.message || 'Connection error');
      console.error('Gesture streaming error:', error);
      Alert.alert('Error', error.message || 'Connection error');
    });

    simulateGestureService.setOnResult((data) => {
      setLastResult(data);
      console.log('Gesture recognition result:', data);
    });

    // Cleanup on unmount (in real implementation)
    // return () => {
    //   GestureStreamingService.disconnect();
    // };
  }, []);

  const handleConnect = async () => {
    try {
      setError(null);
      const success = await simulateGestureService.connect();
      
      if (success) {
        Alert.alert('Success', 'Connected to gesture streaming service');
      } else {
        throw new Error('Failed to connect');
      }
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', `Failed to connect: ${err.message}`);
    }
  };

  const handleDisconnect = () => {
    try {
      simulateGestureService.disconnect();
      setIsStreaming(false);
      setLastResult(null);
      Alert.alert('Success', 'Disconnected from gesture streaming service');
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', `Failed to disconnect: ${err.message}`);
    }
  };

  const handleStartStreaming = async () => {
    try {
      if (connectionStatus !== 'connected') {
        Alert.alert('Not Connected', 'Please connect first');
        return;
      }

      const success = await simulateGestureService.startStreaming();
      
      if (success) {
        setIsStreaming(true);
        Alert.alert('Success', 'Gesture streaming started');
      } else {
        throw new Error('Failed to start streaming');
      }
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', `Failed to start streaming: ${err.message}`);
    }
  };

  const handleStopStreaming = () => {
    try {
      simulateGestureService.stopStreaming();
      setIsStreaming(false);
      Alert.alert('Success', 'Gesture streaming stopped');
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', `Failed to stop streaming: ${err.message}`);
    }
  };

  const handleReconnect = async () => {
    try {
      setError(null);
      const success = await simulateGestureService.forceReconnect();
      
      if (success) {
        Alert.alert('Success', 'Reconnected to gesture streaming service');
      } else {
        throw new Error('Failed to reconnect');
      }
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', `Failed to reconnect: ${err.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gesture Streaming Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Connection Status:</Text>
        <Text style={[styles.statusValue, styles[`status_${connectionStatus}`]]}>
          {connectionStatus.toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Streaming Status:</Text>
        <Text style={[styles.statusValue, isStreaming ? styles.streaming_active : styles.streaming_inactive]}>
          {isStreaming ? 'ACTIVE' : 'INACTIVE'}
        </Text>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorLabel}>Error:</Text>
          <Text style={styles.errorValue}>{error}</Text>
        </View>
      )}
      
      {lastResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>Last Result:</Text>
          <Text style={styles.resultValue}>{JSON.stringify(lastResult, null, 2)}</Text>
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <AccessibleButton
          title="Connect"
          onPress={handleConnect}
          variant="primary"
          disabled={connectionStatus === 'connected'}
          style={styles.button}
        />
        
        <AccessibleButton
          title="Disconnect"
          onPress={handleDisconnect}
          variant="outline"
          disabled={connectionStatus === 'disconnected'}
          style={styles.button}
        />
        
        <AccessibleButton
          title="Start Streaming"
          onPress={handleStartStreaming}
          variant="success"
          disabled={connectionStatus !== 'connected' || isStreaming}
          style={styles.button}
        />
        
        <AccessibleButton
          title="Stop Streaming"
          onPress={handleStopStreaming}
          variant="error"
          disabled={!isStreaming}
          style={styles.button}
        />
        
        <AccessibleButton
          title="Reconnect"
          onPress={handleReconnect}
          variant="warning"
          disabled={connectionStatus === 'connecting'}
          style={styles.button}
        />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          This is a test component to verify gesture streaming functionality. 
          The actual implementation uses the GestureStreamingService which connects to:
          ws://localhost:8000/api/gestures/analyze/stream
        </Text>
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
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  status_connected: {
    color: '#4CAF50',
  },
  status_connecting: {
    color: '#FF9800',
  },
  status_disconnected: {
    color: '#F44336',
  },
  status_error: {
    color: '#F44336',
  },
  streaming_active: {
    color: '#4CAF50',
  },
  streaming_inactive: {
    color: '#9E9E9E',
  },
  errorContainer: {
    padding: 15,
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    marginBottom: 15,
  },
  errorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  errorValue: {
    fontSize: 14,
    color: '#F44336',
  },
  resultContainer: {
    padding: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    marginBottom: 15,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  resultValue: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    marginVertical: 5,
  },
  infoContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default GestureStreamingTest;