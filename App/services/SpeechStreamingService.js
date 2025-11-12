/**
 * Speech Streaming Service
 * Handles real-time speech recognition streaming with WebSocket connection
 */
import apiService from '../api/services/apiService';
import { Audio, Platform } from 'expo-av';
import * as FileSystem from 'expo-file-system';

class SpeechStreamingService {
  constructor() {
    this.webSocket = null;
    this.recording = null;
    this.isStreaming = false;
    this.isRecording = false;
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
    
    // Audio settings
    this.audioSettings = {
      android: {
        extension: '.m4a',
        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 128000,
      },
      ios: {
        extension: '.m4a',
        audioQuality: Audio.IOS_AUDIO_QUALITY_MIN,
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
    };
    
    // Streaming settings
    this.streamingInterval = 100; // Send audio chunks every 100ms
    this.streamingTimer = null;
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
    console.log(`Speech Streaming Service: Connection status changed to ${status}`);
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

  // Connect to speech streaming WebSocket
  async connect() {
    try {
      // Check if we're already connected
      if (this.connectionState === 'connected' && this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
        console.log('Already connected to speech streaming service');
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
      this.webSocket = apiService.connectSpeechStream(
        (data) => {
          console.log('Speech recognition result received:', data);
          if (this.onResultCallback) {
            this.onResultCallback(data);
          }
        },
        (error) => {
          console.error('Speech WebSocket error:', error);
          this.updateConnectionStatus('error');
          if (this.onErrorCallback) {
            this.onErrorCallback(error);
          }
          this.handleReconnection();
        },
        () => {
          console.log('Speech WebSocket closed');
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
      console.error('Failed to connect to speech stream:', error);
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
      await this.stopStreaming();
    }
    
    // Connect again
    return this.connect();
  }

  // Request audio recording permissions
  async requestPermissions() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Audio permission request failed:', error);
      return false;
    }
  }

  // Start audio recording and streaming
  async startStreaming() {
    // Check if we're connected
    if (this.connectionState !== 'connected') {
      throw new Error('WebSocket not connected. Please connect first.');
    }
    
    // Check if we're already recording
    if (this.isRecording) {
      console.warn('Already recording');
      return false;
    }
    
    try {
      // Request permissions if needed
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Audio recording permission not granted');
      }
      
      // Check if recording object already exists
      if (this.recording) {
        try {
          await this.recording.stopAndUnloadAsync();
        } catch (error) {
          console.warn('Error stopping existing recording:', error);
        }
        this.recording = null;
      }
      
      // Start recording
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(this.audioSettings);
      await this.recording.startAsync();
      this.isRecording = true;
      this.isStreaming = true;
      
      console.log('Audio streaming started');
      
      // Start streaming loop
      this.startStreamingLoop();
      
      return true;
    } catch (error) {
      console.error('Failed to start audio streaming:', error);
      this.isRecording = false;
      this.isStreaming = false;
      
      // Clean up recording object on error
      if (this.recording) {
        try {
          await this.recording.stopAndUnloadAsync();
        } catch (err) {
          console.warn('Error cleaning up recording:', err);
        }
        this.recording = null;
      }
      
      throw error;
    }
  }

  // Start streaming loop
  startStreamingLoop() {
    if (!this.isStreaming || !this.recording) return;
    
    this.streamingTimer = setInterval(async () => {
      try {
        if (this.recording && this.isRecording) {
          // Get current recording status
          const status = await this.recording.getStatusAsync();
          
          if (status.isRecording) {
            // Send audio data through WebSocket
            await this.sendAudioChunk();
          }
        }
      } catch (error) {
        console.error('Error in streaming loop:', error);
        if (this.onErrorCallback) {
          this.onErrorCallback(error);
        }
      }
    }, this.streamingInterval);
  }

  // Stop streaming loop
  stopStreamingLoop() {
    if (this.streamingTimer) {
      clearInterval(this.streamingTimer);
      this.streamingTimer = null;
    }
  }

  // Send audio chunk through WebSocket
  async sendAudioChunk() {
    if (!this.recording || !this.isRecording) return false;
    
    try {
      // Get current recording status to check if we have data
      const status = await this.recording.getStatusAsync();
      
      if (status.isRecording && this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
        // Get the current audio data as a base64 string
        // Note: In a real implementation, we would send smaller chunks more frequently
        // For now, we'll send the current recording data as a chunk
        const uri = this.recording.getURI();
        if (uri) {
          // Read the audio file and send as base64
          const base64Data = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64
          });
          
          // Send audio chunk through WebSocket
          const audioChunk = {
            type: 'audio_chunk',
            timestamp: new Date().toISOString(),
            data: base64Data,
            format: Platform.OS === 'android' ? 'm4a' : 'm4a',
            sampleRate: 16000,
            channels: 1
          };
          
          this.webSocket.send(JSON.stringify(audioChunk));
          return true;
        }
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error sending audio chunk:', error);
      return false;
    }
  }

  // Stop audio streaming
  async stopStreaming() {
    this.isStreaming = false;
    this.stopStreamingLoop();
    
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      } catch (error) {
        console.error('Error stopping recording:', error);
        // Don't rethrow - we want to continue cleanup
      }
    }
    
    this.isRecording = false;
    console.log('Audio streaming stopped');
  }

  // Send audio data through WebSocket
  sendAudioData(audioChunk) {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      try {
        this.webSocket.send(JSON.stringify({
          type: 'audio_data',
          data: audioChunk,
          timestamp: new Date().toISOString()
        }));
        return true;
      } catch (error) {
        console.error('Error sending audio data:', error);
        return false;
      }
    }
    return false;
  }

  // Disconnect WebSocket
  disconnect() {
    this.isStreaming = false;
    this.isRecording = false;
    this.stopStreamingLoop();
    
    if (this.recording) {
      this.recording.stopAndUnloadAsync().catch(error => {
        console.error('Error stopping recording:', error);
      });
      this.recording = null;
    }
    
    if (this.webSocket) {
      try {
        this.webSocket.close();
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      }
      this.webSocket = null;
    }
    
    this.updateConnectionStatus('disconnected');
  }

  // Get current connection state
  getConnectionState() {
    return this.connectionState;
  }

  // Get streaming status
  isCurrentlyStreaming() {
    return this.isStreaming;
  }

  // Get recording status
  isCurrentlyRecording() {
    return this.isRecording;
  }
}

// Export singleton instance
export default new SpeechStreamingService();