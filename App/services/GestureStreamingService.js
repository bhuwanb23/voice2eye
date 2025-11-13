/**
 * Gesture Streaming Service
 * Handles real-time gesture recognition streaming with WebSocket connection
 */
import apiService from '../api/services/apiService';
import { Camera } from 'expo-camera';

class GestureStreamingService {
  constructor() {
    this.webSocket = null;
    this.isStreaming = false;
    this.connectionState = 'disconnected'; // disconnected, connecting, connected, error
    
    // Callbacks
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onStatusChangeCallback = null;
    this.onReconnectCallback = null;
    
    // Reconnection settings
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
    
    // Streaming settings
    this.streamingInterval = 100; // Send frames every 100ms
    this.streamingTimer = null;
    this.frameQueue = [];
  }

  // Set callbacks
  setOnResult(callback) {
    this.onResultCallback = callback;
  }

  setOnError(callback) {
    this.onErrorCallback = callback;
  }

  setOnStatusChange(callback) {
    this.onStatusChangeCallback = callback;
  }

  setOnReconnect(callback) {
    this.onReconnectCallback = callback;
  }

  // Update connection status and notify listeners
  updateConnectionStatus(status) {
    this.connectionState = status;
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status);
    }
    
    // Log status changes for debugging
    console.log(`Gesture Streaming Service: Connection status changed to ${status}`);
    
    // When we connect, process any queued frames
    if (status === 'connected') {
      setTimeout(() => {
        this.processFrameQueue();
      }, 100);
    }
  }
  
  // Get detailed connection info
  getConnectionInfo() {
    return {
      state: this.connectionState,
      isConnected: this.connectionState === 'connected',
      isConnecting: this.connectionState === 'connecting',
      isDisconnected: this.connectionState === 'disconnected',
      isError: this.connectionState === 'error',
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  // Connect to gesture streaming WebSocket
  async connect() {
    try {
      // Check if we're already connected
      if (this.connectionState === 'connected' && this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
        console.log('Already connected to gesture streaming service');
        return true;
      }
      
      this.updateConnectionStatus('connecting');
      
      // Close existing connection if any
      if (this.webSocket) {
        try {
          this.webSocket.close();
        } catch (error) {
          console.warn('Error closing existing WebSocket:', error);
        }
        this.webSocket = null;
      }
      
      // Connect to WebSocket
      this.webSocket = apiService.connectGestureStream(
        (data) => {
          console.log('Gesture recognition result received:', data);
          if (this.onResultCallback) {
            this.onResultCallback(data);
          }
        },
        (error) => {
          console.error('Gesture WebSocket error:', error);
          this.updateConnectionStatus('error');
          if (this.onErrorCallback) {
            this.onErrorCallback(error);
          }
          this.handleReconnection();
        },
        () => {
          console.log('Gesture WebSocket closed');
          this.updateConnectionStatus('disconnected');
          this.handleReconnection();
        }
      );
      
      // Wait a bit for connection to establish
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
        this.updateConnectionStatus('connected');
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        return true;
      } else {
        throw new Error('WebSocket connection failed to establish');
      }
    } catch (error) {
      console.error('Failed to connect to gesture stream:', error);
      this.updateConnectionStatus('error');
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
      return false;
    }
  }

  // Handle reconnection logic
  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      // Calculate exponential backoff delay
      const delay = Math.min(
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
        this.maxReconnectDelay
      );
      
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
      if (this.onReconnectCallback) {
        this.onReconnectCallback(this.reconnectAttempts, this.maxReconnectAttempts, delay);
      }
      
      // Schedule reconnection
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.log('Max reconnection attempts reached');
      if (this.onErrorCallback) {
        this.onErrorCallback(new Error('Max reconnection attempts reached'));
      }
    }
  }
  
  // Reset reconnection attempts
  resetReconnectionAttempts() {
    this.reconnectAttempts = 0;
  }
  
  // Force reconnection
  async forceReconnect() {
    console.log('Forcing reconnection...');
    this.resetReconnectionAttempts();
    
    // Disconnect if connected
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }
    
    // Stop any ongoing streaming
    if (this.isStreaming) {
      this.stopStreaming();
    }
    
    // Connect again
    return this.connect();
  }

  // Start gesture streaming
  async startStreaming() {
    // Check if we're connected
    if (this.connectionState !== 'connected') {
      throw new Error('WebSocket not connected. Please connect first.');
    }
    
    // Check if we're already streaming
    if (this.isStreaming) {
      console.warn('Already streaming');
      return false;
    }
    
    this.isStreaming = true;
    console.log('Gesture streaming started');
    
    return true;
  }

  // Stop gesture streaming
  stopStreaming() {
    this.isStreaming = false;
    console.log('Gesture streaming stopped');
  }

  // Send video frame through WebSocket with message queuing for offline support
  sendFrame(frameData) {
    // Add frame to queue
    this.frameQueue.push({
      data: frameData,
      timestamp: new Date().toISOString(),
      retries: 0
    });
    
    // Process the queue
    return this.processFrameQueue();
  }
  
  // Process frame queue with offline support
  processFrameQueue() {
    if (this.frameQueue.length === 0) {
      return false;
    }
    
    // If we're not connected, don't try to send
    if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
      console.warn('Not connected, frame queued for later sending');
      return false;
    }
    
    // Send all queued frames
    while (this.frameQueue.length > 0) {
      const frame = this.frameQueue[0];
      
      try {
        this.webSocket.send(JSON.stringify({
          type: 'video_frame',
          data: frame.data,
          timestamp: frame.timestamp
        }));
        
        // Remove frame from queue after successful send
        this.frameQueue.shift();
      } catch (error) {
        console.error('Error sending frame data:', error);
        frame.retries++;
        
        // If we've retried too many times, remove from queue
        if (frame.retries > 3) {
          console.warn('Frame failed to send after 3 retries, removing from queue');
          this.frameQueue.shift();
        } else {
          // Break and wait for next attempt
          break;
        }
      }
    }
    
    return true;
  }
  
  // Clear frame queue (use when disconnecting or resetting)
  clearFrameQueue() {
    this.frameQueue = [];
    console.log('Frame queue cleared');
  }
  
  // Send continuous frames (for real-time streaming)
  sendContinuousFrames(frameData) {
    if (!this.isStreaming) {
      console.warn('Not streaming, frame not sent');
      return false;
    }
    
    return this.sendFrame(frameData);
  }

  // Disconnect WebSocket
  disconnect() {
    this.isStreaming = false;
    
    if (this.webSocket) {
      try {
        this.webSocket.close();
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      }
      this.webSocket = null;
    }
    
    this.updateConnectionStatus('disconnected');
    this.clearFrameQueue(); // Clear frame queue on disconnect
  }

  // Get current connection state
  getConnectionState() {
    return this.connectionState;
  }

  // Get streaming status
  isCurrentlyStreaming() {
    return this.isStreaming;
  }
}

// Export singleton instance
export default new GestureStreamingService();