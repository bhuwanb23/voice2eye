/**
 * Gesture Overlay Component
 * Displays real-time gesture detection visualization on camera view
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GestureOverlay = ({ 
  detectedGestures, 
  connectionStatus, 
  isStreaming, 
  streamingError 
}) => {
  // Get connection status color
  const getConnectionStatusColor = (status) => {
    switch (status) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FF9800';
      case 'disconnected': return '#F44336';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  // Get connection status text
  const getConnectionStatusText = (status) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  // Render gesture bounding box with actual coordinates
  const renderGestureBoundingBox = (gesture, index) => {
    // Use actual bounding box coordinates if available, otherwise use simulated positions
    const boundingBox = gesture.boundingBox || {
      x: Math.random() * 0.6 + 0.2, // Random x between 20-80%
      y: Math.random() * 0.6 + 0.2, // Random y between 20-80%
      width: Math.random() * 0.3 + 0.2, // Random width between 20-50%
      height: Math.random() * 0.3 + 0.2 // Random height between 20-50%
    };
    
    // Convert normalized coordinates to percentages
    const position = {
      top: `${boundingBox.y * 100}%`,
      left: `${boundingBox.x * 100}%`,
      width: `${boundingBox.width * 100}%`,
      height: `${boundingBox.height * 100}%`
    };
    
    // Get confidence color (green to red gradient)
    const getConfidenceColor = (confidence) => {
      if (confidence >= 80) return '#4CAF50'; // Green
      if (confidence >= 60) return '#FFEB3B'; // Yellow
      if (confidence >= 40) return '#FF9800'; // Orange
      return '#F44336'; // Red
    };
    
    return (
      <View 
        key={`bbox-${gesture.id || index}`} 
        style={[
          styles.boundingBox, 
          {
            top: position.top,
            left: position.left,
            width: position.width,
            height: position.height,
          }
        ]}
      >
        <View 
          style={[
            styles.boundingBoxBorder, 
            { borderColor: getConfidenceColor(gesture.confidence) }
          ]} 
        />
        <View 
          style={[
            styles.gestureLabelContainer, 
            { backgroundColor: getConfidenceColor(gesture.confidence) }
          ]}
        >
          <Text style={styles.gestureLabelText}>
            {gesture.name} ({gesture.confidence}%)
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Connection Status Indicator */}
      <View style={styles.connectionStatusContainer}>
        <View 
          style={[
            styles.connectionIndicator, 
            { backgroundColor: getConnectionStatusColor(connectionStatus) }
          ]} 
        />
        <Text style={styles.connectionStatusText}>
          {getConnectionStatusText(connectionStatus)}
        </Text>
        {isStreaming && (
          <Text style={styles.streamingIndicator}>STREAMING</Text>
        )}
      </View>

      {/* Streaming Error */}
      {streamingError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {streamingError}</Text>
        </View>
      )}

      {/* Detected Gestures */}
      {detectedGestures.length > 0 && (
        <View style={styles.gestureHistoryContainer}>
          <Text style={styles.historyTitle}>Recent Gestures</Text>
          {detectedGestures.slice(0, 3).map((gesture) => (
            <View key={gesture.id} style={styles.gestureItem}>
              <Text style={styles.gestureName}>{gesture.name}</Text>
              <Text style={styles.gestureConfidence}>{gesture.confidence}%</Text>
            </View>
          ))}
        </View>
      )}

      {/* Gesture Bounding Boxes */}
      {isStreaming && detectedGestures.length > 0 && (
        detectedGestures.slice(0, 3).map((gesture, index) => 
          renderGestureBoundingBox(gesture, index)
        )
      )}

      {/* Gesture Detection Area */}
      <View style={styles.detectionArea}>
        <Text style={styles.detectionText}>Gesture Detection Area</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 20,
  },
  connectionStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  connectionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  connectionStatusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  streamingIndicator: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  errorContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  errorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  gestureHistoryContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 15,
    maxHeight: 150,
  },
  historyTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  gestureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  gestureName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  gestureConfidence: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  boundingBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  boundingBoxBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 8,
  },
  gestureLabelContainer: {
    position: 'absolute',
    top: -25,
    left: 0,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    padding: 4,
    borderRadius: 4,
  },
  gestureLabelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detectionArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    margin: 50,
    borderRadius: 20,
  },
  detectionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 10,
  },
});

export default GestureOverlay;