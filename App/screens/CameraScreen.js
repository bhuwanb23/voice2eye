/**
 * Camera Screen
 * Robust camera implementation with permissions, lifecycle management, and full capture pipeline.
 * Handles photo capture, video recording, and real-time gesture streaming.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  AppState,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons'; // Assuming Expo icons are available
import apiService from '../api/services/apiService';
import GestureStreamingService from '../services/GestureStreamingService';
import GestureOverlay from '../components/GestureOverlay';
import AccessibleButton from '../components/AccessibleButton';

const CameraScreen = ({ navigation }) => {
  // --- State Management ---
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [appState, setAppState] = useState(AppState.currentState);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);

  // Camera Settings
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [zoom, setZoom] = useState(0);
  const [mode, setMode] = useState('photo'); // 'photo', 'video', 'gesture'

  // Capture State
  const [isRecording, setIsRecording] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null); // Preview captured image
  
  // Gesture Streaming State
  const [isGestureStreaming, setIsGestureStreaming] = useState(false);
  const [gestureConnectionStatus, setGestureConnectionStatus] = useState('disconnected');
  const [gestureStreamingError, setGestureStreamingError] = useState(null);
  const [streamingGestures, setStreamingGestures] = useState([]);

  // --- Lifecycle & Permissions ---

  // Handle App State (Background/Foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        setIsCameraActive(true); // Resume camera
      } else if (nextAppState.match(/inactive|background/)) {
        setIsCameraActive(false); // Pause camera
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);

  // Handle Screen Focus (Navigation)
  useFocusEffect(
    useCallback(() => {
      setIsCameraActive(true);
      return () => {
        setIsCameraActive(false);
        stopGestureStreaming(); // Ensure streaming stops when leaving screen
      };
    }, [])
  );

  // Initial Permission Check
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
    if (!mediaLibraryPermission?.granted) {
      requestMediaLibraryPermission();
    }
  }, [permission, mediaLibraryPermission]);

  // --- Camera Operations ---

  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      setIsCapturing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: false,
          exif: true,
        });
        setCapturedImage(photo.uri);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture: ' + error.message);
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const savePicture = async () => {
    if (capturedImage) {
      try {
        await MediaLibrary.saveToLibraryAsync(capturedImage);
        Alert.alert('Saved', 'Photo saved to gallery!');
        setCapturedImage(null);
      } catch (error) {
        Alert.alert('Error', 'Failed to save photo: ' + error.message);
      }
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  const recordVideo = async () => {
    if (cameraRef.current) {
      if (isRecording) {
        cameraRef.current.stopRecording();
        setIsRecording(false);
      } else {
        setIsRecording(true);
        try {
          const video = await cameraRef.current.recordAsync();
          Alert.alert('Video Recorded', 'Video saved temporarily: ' + video.uri);
          // Here you would typically save to gallery or upload
        } catch (error) {
          Alert.alert('Error', 'Failed to record video: ' + error.message);
          setIsRecording(false);
        }
      }
    }
  };

  // --- Gesture Streaming Logic ---

  const startGestureStreaming = async () => {
    try {
      if (gestureConnectionStatus !== 'connected') {
        const connected = await GestureStreamingService.connect();
        if (!connected) throw new Error('Failed to connect');
      }
      
      const success = await GestureStreamingService.startStreaming();
      if (success) {
        setIsGestureStreaming(true);
        startVideoFrameStreaming();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start streaming: ' + error.message);
    }
  };

  const stopGestureStreaming = async () => {
    stopVideoFrameStreaming();
    GestureStreamingService.stopStreaming();
    setIsGestureStreaming(false);
  };

  const startVideoFrameStreaming = () => {
    if (!cameraRef.current) return;
    // Implementation for frame streaming interval
    const frameInterval = setInterval(async () => {
      if (!isGestureStreaming || !isCameraActive) {
        clearInterval(frameInterval);
        return;
      }
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.3,
          base64: true,
          skipProcessing: true,
        });
        if (photo.base64) {
          GestureStreamingService.sendFrame(photo.base64);
        }
      } catch (error) {
        console.log('Frame capture error (expected if camera busy):', error.message);
      }
    }, 200); // 5 FPS
    global.gestureFrameInterval = frameInterval;
  };

  const stopVideoFrameStreaming = () => {
    if (global.gestureFrameInterval) {
      clearInterval(global.gestureFrameInterval);
      global.gestureFrameInterval = null;
    }
  };

  // --- UI Handlers ---

  const toggleFlash = () => {
    setFlash(current => (current === 'off' ? 'on' : 'off'));
  };

  const toggleCamera = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // --- Render ---

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <AccessibleButton
          title="Grant Permission"
          onPress={requestPermission}
          variant="primary"
        />
        <AccessibleButton
          title="Open Settings"
          onPress={Linking.openSettings}
          variant="outline"
          style={{ marginTop: 10 }}
        />
      </View>
    );
  }

  // Preview Mode (After capturing photo)
  if (capturedImage) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedImage }} style={styles.previewImage} />
        <View style={styles.previewControls}>
          <AccessibleButton
            title="Retake"
            onPress={retakePicture}
            variant="outline"
            style={styles.previewButton}
          />
          <AccessibleButton
            title="Save"
            onPress={savePicture}
            variant="primary"
            style={styles.previewButton}
          />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isCameraActive && (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          flash={flash}
          zoom={zoom}
          onCameraReady={() => setCameraReady(true)}
          onMountError={(error) => Alert.alert('Camera Error', error.message)}
        >
          {/* Gesture Overlay */}
          {mode === 'gesture' && (
            <GestureOverlay
              detectedGestures={streamingGestures}
              connectionStatus={gestureConnectionStatus}
              isStreaming={isGestureStreaming}
            />
          )}

          {/* Controls Overlay */}
          <View style={styles.controlsContainer}>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity onPress={toggleFlash} style={styles.iconButton}>
                <Text style={styles.iconText}>{flash === 'on' ? '⚡' : '⚡️'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleCamera} style={styles.iconButton}>
                <Text style={styles.iconText}>🔄</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
              {/* Mode Switcher */}
              <View style={styles.modeSwitcher}>
                <TouchableOpacity onPress={() => setMode('photo')}>
                  <Text style={[styles.modeText, mode === 'photo' && styles.activeMode]}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMode('video')}>
                  <Text style={[styles.modeText, mode === 'video' && styles.activeMode]}>Video</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMode('gesture')}>
                  <Text style={[styles.modeText, mode === 'gesture' && styles.activeMode]}>Gesture</Text>
                </TouchableOpacity>
              </View>

              {/* Shutter Button */}
              <View style={styles.shutterContainer}>
                {mode === 'photo' && (
                  <TouchableOpacity onPress={takePicture} style={styles.shutterButton}>
                    <View style={styles.shutterInner} />
                  </TouchableOpacity>
                )}
                {mode === 'video' && (
                  <TouchableOpacity onPress={recordVideo} style={[styles.shutterButton, isRecording && styles.recordingButton]}>
                    <View style={[styles.shutterInner, isRecording && styles.recordingInner]} />
                  </TouchableOpacity>
                )}
                {mode === 'gesture' && (
                  <TouchableOpacity
                    onPress={isGestureStreaming ? stopGestureStreaming : startGestureStreaming}
                    style={[styles.shutterButton, isGestureStreaming && styles.streamingButton]}
                  >
                    <Text style={styles.shutterIcon}>{isGestureStreaming ? '⬛' : '▶'}</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  bottomBar: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  iconButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 25,
  },
  iconText: {
    fontSize: 24,
    color: 'white',
  },
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
    marginBottom: 20,
  },
  modeText: {
    color: 'white',
    paddingHorizontal: 15,
    paddingVertical: 5,
    fontSize: 14,
    fontWeight: '600',
  },
  activeMode: {
    color: '#FFD700', // Gold color for active
    fontWeight: 'bold',
  },
  shutterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
  },
  shutterButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'white',
  },
  recordingButton: {
    borderColor: 'red',
  },
  recordingInner: {
    backgroundColor: 'red',
    borderRadius: 4,
    width: 30,
    height: 30,
  },
  streamingButton: {
    borderColor: '#4CAF50',
  },
  shutterIcon: {
    fontSize: 24,
    color: 'white',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    bottom: 30,
  },
  backText: {
    color: 'white',
    fontSize: 16,
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'black',
  },
  previewButton: {
    minWidth: 120,
  },
});

export default CameraScreen;
