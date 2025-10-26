/**
 * API Service
 * Centralized service for all backend API calls
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ 
  ? 'http://192.168.31.67:8000/api'  // Local development - replace with your local IP
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
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `API Error: ${response.status}`);
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
  connectGestureStream(onGestureDetected) {
    const wsUrl = this.baseURL.replace('http', 'ws') + '/gestures/analyze/stream';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
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
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return ws;
  }
}

// Export singleton instance
export default new ApiService();
