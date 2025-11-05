/**
 * Camera Screen
 * Real-time gesture detection and camera controls
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, Camera, useCameraPermissions } from 'expo-camera';
import { useAccessibility } from '../components/AccessibilityProvider';
import AccessibleButton from '../components/AccessibleButton';
import StatusIndicator from '../components/StatusIndicator';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';

const CameraScreen = ({ navigation }) => {
  const { settings, getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [hasPermission, setHasPermission] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [flash, setFlash] = useState('off');
  const [cameraPosition, setCameraPosition] = useState('back');
  const [zoom, setZoom] = useState(1);
  const [detectedGestures, setDetectedGestures] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('Camera ready');

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      const cameraPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      
      const audioPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      
      if (cameraPermission === PermissionsAndroid.RESULTS.GRANTED && 
          audioPermission === PermissionsAndroid.RESULTS.GRANTED) {
        setHasPermission(true);
        setCameraActive(true);
        setStatus('ready');
        setStatusMessage('Camera ready');
        
        if (settings.voiceNavigation) {
          Speech.speak('Camera permissions granted. Camera is ready.', {
            rate: settings.speechRate,
            pitch: settings.speechPitch,
          });
        }
      } else {
        setHasPermission(false);
        setStatus('error');
        setStatusMessage('Camera permissions denied');
        
        if (settings.voiceNavigation) {
          Speech.speak('Camera permissions denied. Please enable camera permissions in settings.', {
            rate: settings.speechRate,
            pitch: settings.speechPitch,
          });
        }
        
        Alert.alert(
          'Permissions Required',
          'Camera and audio permissions are required for this feature. Please enable them in your device settings.',
          [
            { text: 'OK', onPress: () => navigation.goBack() },
            { text: 'Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } else {
      // iOS permissions are handled by the Camera component
      const { status } = await requestPermission();
      setHasPermission(status === 'granted');
      setCameraActive(status === 'granted');
      setStatus(status === 'granted' ? 'ready' : 'error');
      setStatusMessage(status === 'granted' ? 'Camera ready' : 'Camera permissions denied');
      
      if (status === 'granted' && settings.voiceNavigation) {
        Speech.speak('Camera permissions granted. Camera is ready.', {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
      } else if (status !== 'granted' && settings.voiceNavigation) {
        Speech.speak('Camera permissions denied. Please enable camera permissions in settings.', {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
      }
    }
  };

  const toggleFlash = () => {
    const nextFlash = flash === 'off' ? 'on' : 'off';
    setFlash(nextFlash);
    
    if (settings.voiceNavigation) {
      Speech.speak(`Flash ${nextFlash}`, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
      });
    }
  };

  const switchCamera = () => {
    const nextPosition = cameraPosition === 'back' ? 'front' : 'back';
    setCameraPosition(nextPosition);
    
    if (settings.voiceNavigation) {
      Speech.speak(`Switched to ${nextPosition} camera`, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
      });
    }
  };

  const zoomIn = () => {
    if (zoom < 5) {
      const newZoom = zoom + 0.5;
      setZoom(newZoom);
      
      if (settings.voiceNavigation) {
        Speech.speak(`Zoom level ${newZoom}`, {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
      }
    }
  };

  const zoomOut = () => {
    if (zoom > 1) {
      const newZoom = zoom - 0.5;
      setZoom(newZoom);
      
      if (settings.voiceNavigation) {
        Speech.speak(`Zoom level ${newZoom}`, {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
      }
    }
  };

  const resetZoom = () => {
    setZoom(1);
    
    if (settings.voiceNavigation) {
      Speech.speak('Zoom reset', {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
      });
    }
  };

  const simulateGestureDetection = async () => {
    if (!cameraRef.current || isProcessing) return;
    
    try {
      setIsProcessing(true);
      setStatus('processing');
      setStatusMessage('Detecting gesture...');
      
      // Check camera permissions first
      if (!hasPermission) {
        throw new Error('Camera permission not granted');
      }
      
      // Capture photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        skipProcessing: true
      });
      
      if (settings.voiceNavigation) {
        Speech.speak('Analyzing gesture', {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
      }
      
      // Send to backend for gesture analysis
      const result = await apiService.analyzeGesture(photo.uri, 0.7);
      
      // Process result
      if (result && result.gesture_type) {
        const newGesture = {
          id: Date.now(),
          name: result.gesture_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          timestamp: new Date().toLocaleTimeString(),
          confidence: Math.round(result.confidence * 100),
          isEmergency: result.is_emergency || false
        };
        
        setDetectedGestures(prev => [newGesture, ...prev.slice(0, 4)]);
        
        // Provide real-time feedback based on confidence
        let feedbackMessage = '';
        if (newGesture.confidence >= 90) {
          feedbackMessage = `Excellent! ${newGesture.name} detected with ${newGesture.confidence}% confidence`;
        } else if (newGesture.confidence >= 70) {
          feedbackMessage = `Good! ${newGesture.name} detected with ${newGesture.confidence}% confidence`;
        } else if (newGesture.confidence >= 50) {
          feedbackMessage = `Fair! ${newGesture.name} detected with ${newGesture.confidence}% confidence`;
        } else {
          feedbackMessage = `Low confidence detection: ${newGesture.name} (${newGesture.confidence}%)`;
        }
        
        if (settings.voiceNavigation) {
          Speech.speak(feedbackMessage, {
            rate: settings.speechRate,
            pitch: settings.speechPitch,
          });
        }
        
        // Provide haptic feedback based on confidence
        if (settings.hapticFeedback) {
          if (newGesture.confidence >= 90) {
            // Strong vibration for high confidence
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          } else if (newGesture.confidence >= 70) {
            // Medium vibration for good confidence
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } else {
            // Light vibration for low confidence
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
        
        // Handle emergency gesture
        if (result.is_emergency) {
          setStatus('emergency');
          setStatusMessage('Emergency gesture detected!');
          
          if (settings.voiceNavigation) {
            Speech.speak('Emergency gesture detected! Navigating to emergency screen.', {
              rate: settings.speechRate,
              pitch: settings.speechPitch,
            });
          }
          
          // Navigate to emergency after a short delay
          setTimeout(() => {
            navigation.navigate('Emergency');
          }, 2000);
        } else {
          // Set status based on confidence
          if (newGesture.confidence >= 80) {
            setStatus('success');
          } else if (newGesture.confidence >= 60) {
            setStatus('warning');
          } else {
            setStatus('error');
          }
          setStatusMessage(`${newGesture.name} (${newGesture.confidence}%)`);
        }
      } else {
        setStatus('warning');
        setStatusMessage('No gesture detected. Try again.');
        
        if (settings.voiceNavigation) {
          Speech.speak('No gesture detected. Please try again.', {
            rate: settings.speechRate,
            pitch: settings.speechPitch,
          });
        }
        
        // Light haptic feedback for no detection
        if (settings.hapticFeedback) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }
    } catch (error) {
      console.error('Gesture detection failed:', error);
      setStatus('error');
      setStatusMessage('Detection failed. Please try again.');
      
      // Provide specific error guidance
      let errorMessage = 'Gesture detection failed. Please try again.';
      if (error.message.includes('permission')) {
        errorMessage = 'Camera permission required. Please enable camera access in settings.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout. Please try again.';
      }
      
      if (settings.voiceNavigation) {
        Speech.speak(errorMessage, {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
      }
      
      // Error haptic feedback
      if (settings.hapticFeedback) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      // Show alert for critical errors
      if (error.message.includes('permission')) {
        Alert.alert(
          'Permission Required',
          'Camera permission is required for gesture detection. Please enable it in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } finally {
      setIsProcessing(false);
      
      // Reset status after delay
      setTimeout(() => {
        if (status !== 'error' && status !== 'emergency') {
          setStatus('ready');
          setStatusMessage('Camera ready');
        }
      }, 3000);
    }
  };

  const startTrainingCapture = async () => {
    if (!cameraRef.current) return;
    
    try {
      setIsRecording(true);
      setStatus('recording');
      setStatusMessage('Recording gesture for training...');
      
      if (settings.voiceNavigation) {
        Speech.speak('Starting gesture recording for training', {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
      }
      
      // In a real implementation, this would start recording video
      // For now, we'll just simulate it
      setTimeout(() => {
        setIsRecording(false);
        setStatus('ready');
        setStatusMessage('Recording complete');
        
        if (settings.voiceNavigation) {
          Speech.speak('Gesture recording complete. You can now train this gesture.', {
            rate: settings.speechRate,
            pitch: settings.speechPitch,
          });
        }
        
        Alert.alert(
          'Training Capture Complete',
          'Gesture has been recorded. You can now train this gesture in the Gesture Training section.',
          [{ text: 'OK' }]
        );
      }, 3000);
    } catch (error) {
      setIsRecording(false);
      setStatus('error');
      setStatusMessage('Recording failed');
      
      if (settings.voiceNavigation) {
        Speech.speak('Recording failed. Please try again.', {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
      }
      
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const renderCameraControls = () => (
    <View style={styles.controlsContainer}>
      {/* Top Controls */}
      <View style={[styles.topControls, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <AccessibleButton
          title={flash === 'on' ? '💡 ON' : '💡 OFF'}
          onPress={toggleFlash}
          variant="outline"
          size="small"
          accessibilityLabel={`Flash is ${flash}. Tap to toggle.`}
          style={styles.controlButton}
        />
        
        <AccessibleButton
          title="🔄 SWITCH"
          onPress={switchCamera}
          variant="outline"
          size="small"
          accessibilityLabel={`Camera is ${cameraPosition}. Tap to switch.`}
          style={styles.controlButton}
        />
      </View>
      
      {/* Zoom Controls */}
      <View style={[styles.zoomControls, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <AccessibleButton
          title="−"
          onPress={zoomOut}
          variant="outline"
          size="small"
          disabled={zoom <= 1}
          accessibilityLabel="Zoom out"
          style={styles.zoomButton}
        />
        
        <View style={styles.zoomIndicator}>
          <Text style={styles.zoomText}>{zoom}x</Text>
        </View>
        
        <AccessibleButton
          title="+"
          onPress={zoomIn}
          variant="outline"
          size="small"
          disabled={zoom >= 5}
          accessibilityLabel="Zoom in"
          style={styles.zoomButton}
        />
        
        <AccessibleButton
          title="↺"
          onPress={resetZoom}
          variant="outline"
          size="small"
          accessibilityLabel="Reset zoom"
          style={styles.resetButton}
        />
      </View>
      
      {/* Bottom Controls */}
      <View style={[styles.bottomControls, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <AccessibleButton
          title={isProcessing ? "🔄 PROCESSING" : "🎯 DETECT"}
          onPress={simulateGestureDetection}
          variant="primary"
          size="large"
          disabled={isProcessing}
          accessibilityLabel={isProcessing ? "Processing gesture" : "Detect gestures"}
          style={styles.mainButton}
        />
        
        <AccessibleButton
          title={isRecording ? "⏹ STOP" : "⏺ RECORD"}
          onPress={startTrainingCapture}
          variant={isRecording ? "error" : "accent"}
          size="large"
          disabled={isProcessing}
          accessibilityLabel={isRecording ? "Stop recording" : "Start recording for training"}
          style={styles.mainButton}
        />
      </View>
    </View>
  );

  const renderGestureOverlay = () => (
    <View style={styles.overlayContainer}>
      {/* Gesture Detection Area */}
      <View style={styles.detectionArea}>
        <Text style={styles.detectionText}>Gesture Detection Area</Text>
      </View>
      
      {/* Status Indicator with Enhanced Visual Feedback */}
      <View style={[styles.statusOverlay, getStatusOverlayStyle()]}>
        <Text style={styles.statusTextOverlay}>{statusMessage}</Text>
        {isProcessing && <ActivityIndicator color="#FFFFFF" size="small" />}
      </View>
      
      {/* Detected Gestures */}
      {detectedGestures.length > 0 && (
        <View style={[styles.gestureHistory, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
          <Text style={styles.historyTitle}>Recent Gestures</Text>
          {detectedGestures.map((gesture) => (
            <View key={gesture.id} style={styles.gestureItem}>
              <Text style={styles.gestureName}>{gesture.name}</Text>
              <Text style={styles.gestureTime}>{gesture.timestamp}</Text>
              <Text style={[styles.gestureConfidence, getConfidenceStyle(gesture.confidence)]}>
                {gesture.confidence}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // Get status overlay style based on status
  const getStatusOverlayStyle = () => {
    switch (status) {
      case 'success':
        return { backgroundColor: 'rgba(76, 175, 80, 0.9)' }; // Green
      case 'warning':
        return { backgroundColor: 'rgba(255, 152, 0, 0.9)' }; // Orange
      case 'error':
        return { backgroundColor: 'rgba(244, 67, 54, 0.9)' }; // Red
      case 'emergency':
        return { backgroundColor: 'rgba(233, 30, 99, 0.9)' }; // Pink
      case 'processing':
        return { backgroundColor: 'rgba(33, 150, 243, 0.9)' }; // Blue
      default:
        return { backgroundColor: 'rgba(0, 0, 0, 0.5)' }; // Default
    }
  };

  // Get confidence style based on confidence level
  const getConfidenceStyle = (confidence) => {
    if (confidence >= 90) {
      return { color: '#4CAF50' }; // Green
    } else if (confidence >= 70) {
      return { color: '#2196F3' }; // Blue
    } else if (confidence >= 50) {
      return { color: '#FF9800' }; // Orange
    } else {
      return { color: '#F44336' }; // Red
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.permissionContainer}>
          <Text style={[styles.permissionTitle, { color: colors.text }]}>
            Requesting camera permission
          </Text>
          <AccessibleButton
            title="Request Permission"
            onPress={requestPermission}
            variant="primary"
            size="large"
            accessibilityLabel="Request camera permission"
            style={styles.permissionButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!hasPermission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.permissionContainer}>
          <Text style={[styles.permissionTitle, { color: colors.text }]}>
            Camera Permission Required
          </Text>
          <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
            Please grant camera permission to use this feature.
          </Text>
          <AccessibleButton
            title="Request Permission"
            onPress={checkPermissions}
            variant="primary"
            size="large"
            accessibilityLabel="Request camera permission"
            style={styles.permissionButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Camera View */}
      {cameraActive && (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={cameraPosition}
          flash={flash}
          zoom={zoom}
          onCameraReady={() => {
            setStatus('ready');
            setStatusMessage('Camera ready');
          }}
        />
      )}
      
      {/* Overlay UI */}
      {renderGestureOverlay()}
      
      {/* Status Indicator */}
      <StatusIndicator
        status={status}
        message={statusMessage}
        announceVoice={false}
        style={styles.statusIndicator}
      />
      
      {/* Camera Controls */}
      {renderCameraControls()}
      
      {/* Back Button */}
      <View style={styles.backButtonContainer}>
        <AccessibleButton
          title="← Back"
          onPress={() => navigation.goBack()}
          variant="outline"
          size="small"
          accessibilityLabel="Go back to previous screen"
          style={styles.backButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  permissionButton: {
    minWidth: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  detectionArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    margin: 50,
    borderRadius: 20,
  },
  detectionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
  },
  gestureHistory: {
    maxHeight: 150,
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  },
  gestureName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  gestureTime: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  gestureConfidence: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 20,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 30,
  },
  controlButton: {
    minWidth: 80,
  },
  zoomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 30,
    alignSelf: 'center',
  },
  zoomButton: {
    minWidth: 50,
    marginHorizontal: 5,
  },
  zoomIndicator: {
    marginHorizontal: 15,
  },
  zoomText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButton: {
    minWidth: 50,
    marginLeft: 10,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderRadius: 30,
  },
  mainButton: {
    minWidth: 120,
  },
  statusIndicator: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  backButton: {
    minWidth: 80,
  },
  statusOverlay: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  statusTextOverlay: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default CameraScreen;