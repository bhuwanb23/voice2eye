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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, Camera, useCameraPermissions } from 'expo-camera';
import { useAccessibility } from '../components/AccessibilityProvider';
import AccessibleButton from '../components/AccessibleButton';
import StatusIndicator from '../components/StatusIndicator';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import apiService from '../api/services/apiService';
import GestureStreamingService from '../services/GestureStreamingService';
import GestureOverlay from '../components/GestureOverlay';

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
  
  // Gesture streaming states
  const [isGestureStreaming, setIsGestureStreaming] = useState(false);
  const [gestureConnectionStatus, setGestureConnectionStatus] = useState('disconnected');
  const [gestureStreamingError, setGestureStreamingError] = useState(null);
  const [streamingGestures, setStreamingGestures] = useState([]);
  
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('Camera ready');

  useEffect(() => {
    checkPermissions();
  }, []);

  useEffect(() => {
    // Initialize gesture streaming service
    GestureStreamingService.setOnStatusChange((status) => {
      setGestureConnectionStatus(status);
      console.log('Gesture connection status:', status);
    });
    
    GestureStreamingService.setOnError((error) => {
      setGestureStreamingError(error.message || 'Connection error');
      console.error('Gesture streaming error:', error);
      
      if (settings.voiceNavigation) {
        Speech.speak(`Gesture streaming error: ${error.message || 'Unknown error'}`, {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
      }
      
      // Show alert for critical errors
      Alert.alert('Gesture Streaming Error', error.message || 'Unknown error occurred');
    });
    
    GestureStreamingService.setOnResult((data) => {
      console.log('Gesture recognition result:', data);
      
      if (data && data.gesture_type) {
        const newGesture = {
          id: Date.now(),
          name: data.gesture_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          timestamp: new Date().toLocaleTimeString(),
          confidence: Math.round((data.confidence || 0) * 100),
          isEmergency: data.is_emergency || false,
          boundingBox: data.bounding_box || null
        };
        
        setStreamingGestures(prev => [newGesture, ...prev.slice(0, 4)]);
        
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
        if (data.is_emergency) {
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
      }
    });
    
    // Cleanup function
    return () => {
      // Stop video frame streaming if active
      stopVideoFrameStreaming();
      
      // Disconnect from gesture streaming service
      GestureStreamingService.disconnect();
    };
  }, [settings, navigation]);

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      const { status } = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera to take photos and videos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      setHasPermission(status === 'granted');
    } else {
      const { status } = await requestPermission();
      setHasPermission(status === 'granted');
    }
  };

  const toggleFlash = () => {
    setFlash((prevFlash) => (prevFlash === 'off' ? 'on' : 'off'));
  };

  const toggleCameraPosition = () => {
    setCameraPosition((prevPosition) => (prevPosition === 'back' ? 'front' : 'back'));
  };

  const handleZoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom + 0.1, 1));
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0));
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

  const handleGestureDetected = (gesture) => {
    setDetectedGestures((prevGestures) => [...prevGestures, gesture]);
  };

  const handleStartRecording = async () => {
    if (cameraRef.current) {
      setIsRecording(true);
      const videoUri = await cameraRef.current.recordAsync();
      setIsRecording(false);
      handleProcessVideo(videoUri);
    }
  };

  const handleProcessVideo = async (videoUri) => {
    setIsProcessing(true);
    try {
      const processedGestures = await apiService.processVideo(videoUri);
      setDetectedGestures(processedGestures);
      setStatusMessage('Video processed successfully');
      setStatus('success');
    } catch (error) {
      setStatusMessage('Error processing video');
      setStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Connect to gesture streaming
  const connectGestureStreaming = async () => {
    try {
      setGestureStreamingError(null);
      const success = await GestureStreamingService.connect();
      
      if (success) {
        if (settings.voiceNavigation) {
          Speech.speak('Connected to gesture streaming service.', {
            rate: settings.speechRate,
            pitch: settings.speechPitch,
          });
        }
        Alert.alert('Success', 'Connected to gesture streaming service');
      } else {
        throw new Error('Failed to connect to gesture streaming service');
      }
    } catch (error) {
      console.error('Connection error:', error);
      setGestureStreamingError(error.message);
      
      if (settings.voiceNavigation) {
        Speech.speak(`Connection failed: ${error.message}`, {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
      }
      
      Alert.alert('Error', `Failed to connect: ${error.message}`);
    }
  };

  // Disconnect from gesture streaming
  const disconnectGestureStreaming = async () => {
    try {
      GestureStreamingService.disconnect();
      
      if (settings.voiceNavigation) {
        Speech.speak('Disconnected from gesture streaming service.', {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
      }
      
      Alert.alert('Success', 'Disconnected from gesture streaming service');
    } catch (error) {
      console.error('Disconnection error:', error);
      Alert.alert('Error', `Failed to disconnect: ${error.message}`);
    }
  };

  // Start gesture streaming
  const startGestureStreaming = async () => {
    try {
      // Check if we're connected first
      if (gestureConnectionStatus !== 'connected') {
        Alert.alert('Not Connected', 'Please connect to the gesture streaming service first.');
        return;
      }
      
      const success = await GestureStreamingService.startStreaming();
      
      if (success) {
        setIsGestureStreaming(true);
        setStreamingGestures([]);
        
        // Start capturing and sending video frames
        startVideoFrameStreaming();
        
        if (settings.voiceNavigation) {
          Speech.speak('Gesture streaming started.', {
            rate: settings.speechRate,
            pitch: settings.speechPitch,
          });
        }
        
        Alert.alert('Success', 'Gesture streaming started');
      } else {
        throw new Error('Failed to start gesture streaming');
      }
    } catch (error) {
      console.error('Start streaming error:', error);
      
      if (settings.voiceNavigation) {
        Speech.speak(`Streaming start failed: ${error.message}`, {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
      }
      
      Alert.alert('Error', `Failed to start streaming: ${error.message}`);
    }
  };

  // Stop gesture streaming
  const stopGestureStreaming = async () => {
    try {
      // Stop capturing video frames
      stopVideoFrameStreaming();
      
      GestureStreamingService.stopStreaming();
      setIsGestureStreaming(false);
      
      if (settings.voiceNavigation) {
        Speech.speak('Gesture streaming stopped.', {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
      }
      
      Alert.alert('Success', 'Gesture streaming stopped');
    } catch (error) {
      console.error('Stop streaming error:', error);
      Alert.alert('Error', `Failed to stop streaming: ${error.message}`);
    }
  };

  // Start video frame streaming
  const startVideoFrameStreaming = () => {
    if (!cameraRef.current) return;
    
    // Set up interval to capture and send frames
    const frameInterval = setInterval(async () => {
      if (!isGestureStreaming || gestureConnectionStatus !== 'connected') {
        clearInterval(frameInterval);
        return;
      }
      
      try {
        // Capture a frame from the camera
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5, // Lower quality for faster streaming
          base64: true,
          skipProcessing: true
        });
        
        // Send frame through GestureStreamingService with message queuing
        if (photo.base64) {
          GestureStreamingService.sendFrame(photo.base64);
        }
      } catch (error) {
        console.error('Error capturing frame:', error);
      }
    }, 100); // Send frames every 100ms
    
    // Store interval ID to clear later
    global.gestureFrameInterval = frameInterval;
  };

  // Stop video frame streaming
  const stopVideoFrameStreaming = () => {
    if (global.gestureFrameInterval) {
      clearInterval(global.gestureFrameInterval);
      global.gestureFrameInterval = null;
    }
  };

  // Force reconnect to gesture streaming
  const reconnectGestureStreaming = async () => {
    try {
      setGestureStreamingError(null);
      const success = await GestureStreamingService.forceReconnect();
      
      if (success) {
        if (settings.voiceNavigation) {
          Speech.speak('Reconnected to gesture streaming service.', {
            rate: settings.speechRate,
            pitch: settings.speechPitch,
          });
        }
        Alert.alert('Success', 'Reconnected to gesture streaming service');
      } else {
        throw new Error('Failed to reconnect to gesture streaming service');
      }
    } catch (error) {
      console.error('Reconnection error:', error);
      setGestureStreamingError(error.message);
      
      if (settings.voiceNavigation) {
        Speech.speak(`Reconnection failed: ${error.message}`, {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
      }
      
      Alert.alert('Error', `Failed to reconnect: ${error.message}`);
    }
  };

  const handleGestureStreamingStatusChange = (status) => {
    setGestureConnectionStatus(status);
  };

  const handleGestureStreamingError = (error) => {
    setGestureStreamingError(error);
  };

  const handleStreamingGestures = (gestures) => {
    setStreamingGestures(gestures);
  };

  const handleSpeakStatusMessage = () => {
    Speech.speak(statusMessage);
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const handleHapticFeedback = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
          <Text style={styles.zoomText}>{zoom.toFixed(1)}x</Text>
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
      
      {/* Gesture Streaming Controls */}
      <View style={[styles.gestureControls, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        {gestureConnectionStatus === 'disconnected' && (
          <AccessibleButton
            title="🔗 CONNECT GESTURE STREAM"
            onPress={connectGestureStreaming}
            variant="primary"
            size="medium"
            accessibilityLabel="Connect to gesture streaming service"
            style={styles.gestureButton}
          />
        )}
        
        {gestureConnectionStatus === 'connected' && !isGestureStreaming && (
          <AccessibleButton
            title="▶ START GESTURE STREAMING"
            onPress={startGestureStreaming}
            variant="success"
            size="medium"
            accessibilityLabel="Start gesture streaming"
            style={styles.gestureButton}
          />
        )}
        
        {isGestureStreaming && (
          <AccessibleButton
            title="⏹ STOP GESTURE STREAMING"
            onPress={stopGestureStreaming}
            variant="error"
            size="medium"
            accessibilityLabel="Stop gesture streaming"
            style={styles.gestureButton}
          />
        )}
        
        {gestureConnectionStatus === 'connected' && (
          <AccessibleButton
            title="🚫 DISCONNECT GESTURE STREAM"
            onPress={disconnectGestureStreaming}
            variant="outline"
            size="small"
            accessibilityLabel="Disconnect from gesture streaming service"
            style={styles.gestureButton}
          />
        )}
        
        {gestureConnectionStatus === 'error' && (
          <AccessibleButton
            title="🔁 RECONNECT GESTURE STREAM"
            onPress={reconnectGestureStreaming}
            variant="warning"
            size="medium"
            accessibilityLabel="Reconnect to gesture streaming service"
            style={styles.gestureButton}
          />
        )}
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
      
      {/* Gesture Overlay for real-time detection */}
      <GestureOverlay
        detectedGestures={isGestureStreaming ? streamingGestures : detectedGestures}
        connectionStatus={gestureConnectionStatus}
        isStreaming={isGestureStreaming}
        streamingError={gestureStreamingError}
      />
      
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
  gestureControls: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 30,
    alignSelf: 'center',
  },
  gestureButton: {
    minWidth: 200,
    marginVertical: 5,
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
