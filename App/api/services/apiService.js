/**
 * API Service
 * Centralized service for all backend API calls
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// For mobile development, we need to use the actual IP address of the development machine
// instead of localhost, as localhost on mobile refers to the device itself
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:8000/api'  // Android emulator IP for localhost
  : 'https://your-production-domain.com/api';  // Production URL

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Generic fetch wrapper with error handling
   */
  async fetch(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      };

      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      // Handle empty responses
      const text = await response.text();
      
      // Parse JSON or handle empty responses
      let data;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.warn('Failed to parse JSON response:', text);
          data = {};
        }
      } else {
        data = {};
      }
      
      if (!response.ok) {
        const errorMessage = data.detail || data.message || `API Error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ============ HEALTH CHECK ============
  async checkHealth() {
    return this.fetch('/');
  }

  // ============ SETTINGS API ============
  
  async getSettings() {
    return this.fetch('/settings/');
  }

  async updateSetting(key, value) {
    // Send individual setting update as expected by the backend
    return this.fetch('/settings/', {
      method: 'PUT',
      body: JSON.stringify({ key, value }),
    });
  }

  // Emergency Contacts
  async getEmergencyContacts(enabledOnly = true) {
    return this.fetch(`/settings/contacts?enabled_only=${enabledOnly}`);
  }

  async addEmergencyContact(contact) {
    // Validate contact before sending
    if (!contact.name || !contact.phone) {
      throw new Error('Contact must have name and phone number');
    }
    
    // Check for duplicate phone numbers
    const existingContacts = await this.getEmergencyContacts(false);
    if (existingContacts.contacts && existingContacts.contacts.some(c => c.phone === contact.phone)) {
      throw new Error('A contact with this phone number already exists');
    }
    
    return this.fetch('/settings/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    });
  }

  async updateEmergencyContact(contactId, updates) {
    return this.fetch(`/settings/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteEmergencyContact(contactId) {
    return this.fetch(`/settings/contacts/${contactId}`, {
      method: 'DELETE',
    });
  }

  // ============ ANALYTICS API ============
  
  async getUsageStatistics(days = 7) {
    return this.fetch(`/analytics/usage?days=${days}`);
  }

  async getPerformanceMetrics(days = 7, metricName = null) {
    const url = metricName 
      ? `/analytics/performance?days=${days}&metric_name=${metricName}`
      : `/analytics/performance?days=${days}`;
    return this.fetch(url);
  }

  async getEmergencyAnalytics(days = 30) {
    return this.fetch(`/analytics/emergencies?days=${days}`);
  }

  async generateReport(startDate = null, endDate = null, format = 'json') {
    const params = new URLSearchParams({ format });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return this.fetch(`/analytics/report?${params.toString()}`);
  }

  // ============ EMERGENCY API ============
  
  async triggerEmergency(triggerData) {
    return this.fetch('/emergency/trigger', {
      method: 'POST',
      body: JSON.stringify(triggerData),
    });
  }

  async confirmEmergency(alertId) {
    return this.fetch('/emergency/confirm', {
      method: 'POST',
      body: JSON.stringify({ alert_id: alertId }),
    });
  }

  async cancelEmergency(alertId, reason = null) {
    return this.fetch('/emergency/cancel', {
      method: 'POST',
      body: JSON.stringify({ alert_id: alertId, cancellation_reason: reason }),
    });
  }

  async getEmergencyStatus(alertId) {
    return this.fetch(`/emergency/status/${alertId}`);
  }

  async getEmergencyHistory(days = 30, limit = 50) {
    return this.fetch(`/emergency/history?days=${days}&limit=${limit}`);
  }

  // ============ GESTURES API ============
  
  async analyzeGesture(imageUri, confidenceThreshold = 0.7) {
    // Convert image to FormData for multipart/form-data upload
    const formData = new FormData();
    formData.append('image_file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'gesture.jpg',
    });
    formData.append('confidence_threshold', confidenceThreshold);

    return fetch(`${this.baseURL}/gestures/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    }).then(response => response.json());
  }

  async getGestureVocabulary() {
    return this.fetch('/gestures/vocabulary');
  }

  async getGestureStatus() {
    return this.fetch('/gestures/status');
  }

  // WebSocket for real-time gesture streaming
  connectGestureStream(onGestureDetected, onError, onClose) {
    const wsUrl = this.baseURL.replace('http', 'ws') + '/gestures/analyze/stream';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Gesture WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onGestureDetected(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('Gesture WebSocket error:', error);
      if (onError) onError(error);
    };

    ws.onclose = () => {
      console.log('Gesture WebSocket disconnected');
      if (onClose) onClose();
    };

    return ws;
  }

  // ============ SPEECH API ============
  
  async recognizeSpeech(audioFile) {
    const formData = new FormData();
    formData.append('audio_file', audioFile);

    return fetch(`${this.baseURL}/speech/recognize`, {
      method: 'POST',
      body: formData,
    }).then(response => response.json());
  }

  async synthesizeSpeech(text, tone = 'normal', rate = 150, volume = 0.8) {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('tone', tone);
    formData.append('rate', rate.toString());
    formData.append('volume', volume.toString());

    return fetch(`${this.baseURL}/speech/synthesize`, {
      method: 'POST',
      body: formData,
    }).then(response => response.json());
  }

  async getSpeechStatus() {
    return this.fetch('/speech/status');
  }

  // WebSocket for real-time speech streaming
  connectSpeechStream(onResult, onError, onClose) {
    const wsUrl = this.baseURL.replace('http', 'ws') + '/speech/recognize/stream';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Speech WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onResult(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        if (onError) onError(error);
      }
    };

    ws.onerror = (error) => {
      console.error('Speech WebSocket error:', error);
      if (onError) onError(error);
    };

    ws.onclose = () => {
      console.log('Speech WebSocket disconnected');
      if (onClose) onClose();
    };

    return ws;
  }
}

// Export singleton instance
export default new ApiService();