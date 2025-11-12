/**
 * Connection Status Indicator Component
 * Visual indicator for WebSocket connection status with detailed information
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ConnectionStatusIndicator = ({ status, reconnectInfo, onForceReconnect }) => {
  // Get status configuration
  const getStatusConfig = (status) => {
    switch (status) {
      case 'connected':
        return {
          color: '#4CAF50',
          bgColor: '#E8F5E9',
          text: 'Connected',
          description: 'Real-time streaming active'
        };
      case 'connecting':
        return {
          color: '#2196F3',
          bgColor: '#E3F2FD',
          text: 'Connecting...',
          description: 'Establishing connection'
        };
      case 'disconnected':
        return {
          color: '#F44336',
          bgColor: '#FFEBEE',
          text: 'Disconnected',
          description: 'Not connected to service'
        };
      case 'error':
        return {
          color: '#F44336',
          bgColor: '#FFEBEE',
          text: 'Connection Error',
          description: 'Failed to connect'
        };
      default:
        return {
          color: '#9E9E9E',
          bgColor: '#FAFAFA',
          text: 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <View style={[styles.container, { backgroundColor: statusConfig.bgColor }]}>
      <View style={styles.statusRow}>
        <View style={[styles.statusIndicator, { backgroundColor: statusConfig.color }]} />
        <Text style={[styles.statusText, { color: statusConfig.color }]}>
          {statusConfig.text}
        </Text>
      </View>
      
      <Text style={styles.descriptionText}>{statusConfig.description}</Text>
      
      {reconnectInfo && (
        <View style={styles.reconnectInfo}>
          <Text style={styles.reconnectText}>
            Reconnecting... (Attempt {reconnectInfo.attempt}/{reconnectInfo.maxAttempts})
          </Text>
          <Text style={styles.reconnectText}>
            Next attempt in {reconnectInfo.delay} seconds
          </Text>
          <TouchableOpacity 
            style={styles.forceReconnectButton}
            onPress={onForceReconnect}
          >
            <Text style={styles.forceReconnectText}>Force Reconnect</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {(status === 'disconnected' || status === 'error') && !reconnectInfo && onForceReconnect && (
        <TouchableOpacity 
          style={styles.forceReconnectButton}
          onPress={onForceReconnect}
        >
          <Text style={styles.forceReconnectText}>Reconnect Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 18,
  },
  reconnectInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 4,
  },
  reconnectText: {
    fontSize: 12,
    color: '#F57C00',
  },
  forceReconnectButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#2196F3',
    borderRadius: 4,
    alignItems: 'center',
  },
  forceReconnectText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ConnectionStatusIndicator;