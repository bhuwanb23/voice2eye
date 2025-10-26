# API Integration Guide

## Overview
This directory contains the API service layer for integrating the VOICE2EYE frontend with the backend API.

## Structure
```
api/
├── services/
│   └── apiService.js    # Main API service singleton
└── README.md            # This file
```

## API Service (`apiService.js`)

### Base Configuration
- **Development URL**: `http://192.168.1.100:8000/api`
- **Production URL**: Update in production builds
- **Default Headers**: `Content-Type: application/json`

### Available Methods

#### Health Check
```javascript
await apiService.checkHealth();
// Returns: { message, version, status }
```

#### Settings API
```javascript
// Get all settings
await apiService.getSettings();

// Update a setting
await apiService.updateSetting(key, value);

// Get emergency contacts
await apiService.getEmergencyContacts(enabledOnly);

// Add emergency contact
await apiService.addEmergencyContact({
  name: "John Doe",
  phone: "+1234567890",
  relationship: "Family",
  priority: 1,
  enabled: true
});

// Update emergency contact
await apiService.updateEmergencyContact(contactId, updates);

// Delete emergency contact
await apiService.deleteEmergencyContact(contactId);
```

#### Analytics API
```javascript
// Get usage statistics (last 7 days by default)
await apiService.getUsageStatistics(days);

// Get performance metrics
await apiService.getPerformanceMetrics(days, metricName);

// Get emergency analytics
await apiService.getEmergencyAnalytics(days);

// Generate report
await apiService.generateReport(startDate, endDate, format);
```

#### Emergency API
```javascript
// Trigger emergency
const alert = await apiService.triggerEmergency({
  trigger_type: "voice", // or "gesture", "manual"
  trigger_data: { /* additional data */ },
  location: { /* location data */ }
});

// Confirm emergency
await apiService.confirmEmergency(alertId);

// Cancel emergency
await apiService.cancelEmergency(alertId, reason);

// Get emergency status
await apiService.getEmergencyStatus(alertId);

// Get emergency history
await apiService.getEmergencyHistory(days, limit);
```

#### Gestures API
```javascript
// Analyze gesture from image
await apiService.analyzeGesture(imageUri, confidenceThreshold);

// Get gesture vocabulary
await apiService.getGestureVocabulary();

// Get gesture status
await apiService.getGestureStatus();

// WebSocket connection for real-time streaming
const ws = apiService.connectGestureStream((data) => {
  console.log('Gesture detected:', data);
});
```

## Usage Examples

### Settings Screen Integration
```javascript
import apiService from '../api/services/apiService';

// In your component
useEffect(() => {
  loadSettings();
}, []);

const loadSettings = async () => {
  try {
    const data = await apiService.getSettings();
    setSettings(data.settings);
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
};
```

### Emergency Screen Integration
```javascript
import apiService from '../api/services/apiService';

const handleEmergencyTrigger = async () => {
  try {
    const result = await apiService.triggerEmergency({
      trigger_type: 'manual',
      trigger_data: {},
    });
    
    // Store alert ID for confirmation
    setAlertId(result.alert_id);
    
    // Start countdown
    startCountdown();
  } catch (error) {
    Alert.alert('Error', 'Failed to trigger emergency');
  }
};
```

### Analytics Integration
```javascript
import apiService from '../api/services/apiService';

const loadAnalytics = async () => {
  try {
    const [usage, performance, emergencies] = await Promise.all([
      apiService.getUsageStatistics(7),
      apiService.getPerformanceMetrics(7),
      apiService.getEmergencyAnalytics(30),
    ]);
    
    setAnalytics({ usage, performance, emergencies });
  } catch (error) {
    console.error('Failed to load analytics:', error);
  }
};
```

## Error Handling

All API methods throw errors on failure. Always wrap API calls in try-catch:

```javascript
try {
  const data = await apiService.getSettings();
  // Handle success
} catch (error) {
  console.error('API Error:', error);
  // Handle error - show user-friendly message
}
```

## Development Setup

1. Start the backend API server:
```bash
cd backend
python -m uvicorn api.server:app --reload --host 0.0.0.0 --port 8000
```

2. Update the IP address in `apiService.js`:
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://YOUR_LOCAL_IP:8000/api'
  : 'https://your-production-domain.com/api';
```

3. To find your local IP:
- **Windows**: `ipconfig` → IPv4 Address
- **Mac/Linux**: `ifconfig` or `ip addr`

4. For Android emulator, use: `http://10.0.2.2:8000/api`

## Testing

The backend provides mock data when not fully integrated. API endpoints will work even without database connections.

Test the connection:
```javascript
import apiService from '../api/services/apiService';

// Test health check
apiService.checkHealth().then(data => {
  console.log('Backend is running:', data);
});
```

## Next Steps

1. **Update API URLs**: Replace `192.168.1.100` with your actual local IP
2. **Integrate into screens**: Follow the usage examples above
3. **Handle offline mode**: Add retry logic and local caching
4. **Add loading states**: Show loading indicators during API calls
5. **Test all endpoints**: Verify each API integration works correctly
