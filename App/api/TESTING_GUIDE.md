# API Integration Testing Guide

## Quick Start Testing

### 1. Start Backend Server
```bash
cd backend
python -m uvicorn api.server:app --reload --host 0.0.0.0 --port 8000
```

Verify it's running: http://localhost:8000/api/docs

### 2. Test API Health
```javascript
import apiService from '../api/services/apiService';

// Test connection
apiService.checkHealth().then(data => {
  console.log('✓ Backend connected:', data);
});
```

### 3. Integration Testing Checklist

#### ✅ Settings API Integration
- [ ] Test `getSettings()` - Load settings on SettingsScreen mount
- [ ] Test `updateSetting(key, value)` - Save settings changes
- [ ] Test `getEmergencyContacts()` - Load contacts list
- [ ] Test `addEmergencyContact()` - Add new contact
- [ ] Test `updateEmergencyContact()` - Edit existing contact
- [ ] Test `deleteEmergencyContact()` - Remove contact

#### ✅ Analytics API Integration  
- [ ] Test `getUsageStatistics()` - Dashboard shows real stats
- [ ] Test `getPerformanceMetrics()` - Performance metrics display
- [ ] Test `getEmergencyAnalytics()` - Emergency patterns show
- [ ] Test `generateReport()` - Export functionality works

#### ✅ Emergency API Integration
- [ ] Test `triggerEmergency()` - Trigger creates alert
- [ ] Test `confirmEmergency()` - Confirmation sends messages
- [ ] Test `cancelEmergency()` - Cancellation works
- [ ] Test `getEmergencyHistory()` - History loads correctly

#### ✅ Gestures API Integration
- [ ] Test `analyzeGesture()` - Image upload works
- [ ] Test `getGestureVocabulary()` - Gesture list loads
- [ ] Test `getGestureStatus()` - Status displays
- [ ] Test WebSocket streaming - Real-time gestures work

## Manual Testing Steps

### Test Settings Screen
1. Navigate to Settings
2. Change a setting (e.g., speech rate)
3. Verify API call is made
4. Reload app
5. Verify setting persists

### Test Emergency Screen
1. Navigate to Emergency
2. Click trigger button
3. Wait for countdown
4. Confirm or cancel
5. Check API logs for request
6. Verify history updates

### Test Analytics Dashboard
1. Navigate to Dashboard
2. Check stats load from API
3. Wait for API responses
4. Verify numbers match backend
5. Test report export

### Test Gesture Training
1. Navigate to Gesture Training
2. Open camera
3. Capture gesture image
4. Verify API call made
5. Check response displays

## Common Issues & Solutions

### Issue: "Network request failed"
**Solution**: 
- Check backend is running: `curl http://localhost:8000/api`
- Update IP in apiService.js to match your local IP
- For Android emulator, use `10.0.2.2:8000`

### Issue: "CORS error"
**Solution**: Backend CORS is configured to allow all origins

### Issue: "Cannot connect to backend"
**Solution**:
- Ensure firewalls allow port 8000
- Check backend logs for errors
- Try connecting from browser to backend URL

### Issue: "401 Unauthorized"
**Solution**: Authentication not yet implemented - should work without auth

## Testing with Mock Data

When backend isn't available, API will fail gracefully. For testing:
1. Use mock data in development
2. Add `__DEV__` checks in components
3. Fallback to sample data

Example:
```javascript
const loadData = async () => {
  try {
    const data = await apiService.getUsageStatistics();
    setData(data);
  } catch (error) {
    // Fallback to mock data
    setData(mockUsageStats);
  }
};
```

## Next Steps After Testing

Once all tests pass:
1. ✅ Document any API issues found
2. ✅ Update API service with fixes
3. ✅ Add error handling to all screens
4. ✅ Implement offline mode
5. ✅ Add loading states
6. ✅ Update TODO.md with completion status
