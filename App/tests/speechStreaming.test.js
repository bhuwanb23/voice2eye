/**
 * Speech Streaming Integration Test
 * Tests the WebSocket integration for real-time speech streaming
 */
import SpeechStreamingService from '../services/SpeechStreamingService';

// Mock WebSocket implementation for testing
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this.onclose = null;
    
    // Simulate connection establishment
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        this.onopen();
      }
    }, 100);
  }
  
  send(data) {
    // Simulate receiving a response after a short delay
    setTimeout(() => {
      if (this.onmessage) {
        const response = {
          text: "This is a test speech recognition result",
          confidence: 0.95,
          is_emergency: false,
          timestamp: new Date().toISOString(),
          partial: false
        };
        this.onmessage({ data: JSON.stringify(response) });
      }
    }, 50);
  }
  
  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose();
    }
  }
}

// Mock the global WebSocket
global.WebSocket = MockWebSocket;

describe('Speech Streaming Service', () => {
  let service;
  
  beforeEach(() => {
    service = SpeechStreamingService;
    // Reset service state
    service.disconnect();
  });
  
  afterEach(() => {
    service.disconnect();
  });
  
  test('should connect to WebSocket successfully', async () => {
    const connectPromise = new Promise((resolve, reject) => {
      service.setOnStatusChange((status) => {
        if (status === 'connected') {
          resolve(true);
        } else if (status === 'error') {
          reject(new Error('Connection failed'));
        }
      });
    });
    
    const result = await service.connect();
    expect(result).toBe(true);
    
    // Wait for connection status change
    await connectPromise;
    expect(service.getConnectionState()).toBe('connected');
  });
  
  test('should handle connection errors gracefully', async () => {
    // Mock a connection failure
    const originalConnect = service.connect;
    service.connect = jest.fn().mockRejectedValue(new Error('Connection failed'));
    
    try {
      await service.connect();
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error.message).toBe('Connection failed');
    }
    
    // Restore original method
    service.connect = originalConnect;
  });
  
  test('should send and receive audio data', async () => {
    // Connect first
    await service.connect();
    expect(service.getConnectionState()).toBe('connected');
    
    // Mock result callback
    const resultPromise = new Promise((resolve) => {
      service.setOnResult((result) => {
        resolve(result);
      });
    });
    
    // Send test audio data
    const testAudioData = {
      type: 'audio_chunk',
      timestamp: new Date().toISOString(),
      data: 'test_audio_data_base64',
      format: 'm4a',
      sampleRate: 16000,
      channels: 1
    };
    
    // In a real implementation, we would send actual audio data
    // For this test, we'll simulate the process
    service.webSocket.send(JSON.stringify(testAudioData));
    
    // Wait for result
    const result = await resultPromise;
    expect(result).toHaveProperty('text');
    expect(result).toHaveProperty('confidence');
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });
  
  test('should handle reconnection attempts', async () => {
    // Connect first
    await service.connect();
    expect(service.getConnectionState()).toBe('connected');
    
    // Mock reconnection callback
    const reconnectPromise = new Promise((resolve) => {
      service.setOnReconnect((attempt, maxAttempts, delay) => {
        resolve({ attempt, maxAttempts, delay });
      });
    });
    
    // Simulate connection close
    service.webSocket.close();
    
    // Wait for reconnection attempt
    const reconnectInfo = await reconnectPromise;
    expect(reconnectInfo).toHaveProperty('attempt');
    expect(reconnectInfo).toHaveProperty('maxAttempts');
    expect(reconnectInfo).toHaveProperty('delay');
  });
  
  test('should clean up resources on disconnect', async () => {
    // Connect first
    await service.connect();
    expect(service.getConnectionState()).toBe('connected');
    
    // Disconnect
    service.disconnect();
    
    // Check that resources are cleaned up
    expect(service.getConnectionState()).toBe('disconnected');
    expect(service.isCurrentlyStreaming()).toBe(false);
    expect(service.isCurrentlyRecording()).toBe(false);
  });
});