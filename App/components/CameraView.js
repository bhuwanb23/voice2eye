/**
 * Camera View Component
 * Camera preview with gesture detection overlay and controls
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera } from 'expo-camera';
import { useAccessibility } from './AccessibilityProvider';

const CameraViewComponent = ({
  onGestureDetected,
  onFrameCaptured,
  showControls = true,
}) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [zoom, setZoom] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastDetectedGesture, setLastDetectedGesture] = useState(null);
  const [fps, setFps] = useState(30);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleCameraReady = () => {
    setFps(30);
  };

  const flipCamera = () => {
    setType(type === Camera.Constants.Type.back 
      ? Camera.Constants.Type.front 
      : Camera.Constants.Type.back);
  };

  const toggleFlash = () => {
    setFlashMode(flashMode === Camera.Constants.FlashMode.off
      ? Camera.Constants.FlashMode.on
      : Camera.Constants.FlashMode.off);
  };

  const captureFrame = async () => {
    if (cameraRef.current && !isCapturing) {
      setIsCapturing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          skipProcessing: false,
        });
        
        if (onFrameCaptured) {
          onFrameCaptured(photo);
        }
        
        // Simulate gesture detection
        simulateGestureDetection();
      } catch (error) {
        Alert.alert('Error', 'Failed to capture frame');
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const simulateGestureDetection = () => {
    const gestures = ['Open Hand', 'Fist', 'Two Fingers', 'Thumbs Up', 'Pointing'];
    const randomGesture = gestures[Math.floor(Math.random() * gestures.length)];
    
    setLastDetectedGesture({
      name: randomGesture,
      confidence: 0.75 + Math.random() * 0.2,
      timestamp: Date.now(),
    });
    
    if (onGestureDetected) {
      onGestureDetected({
        name: randomGesture,
        confidence: 0.75 + Math.random() * 0.2,
      });
    }
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Camera permission denied
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={type}
        flashMode={flashMode}
        zoom={zoom}
        onCameraReady={handleCameraReady}
      >
        {/* Gesture Detection Overlay */}
        <View style={styles.overlay}>
          <View style={styles.gestureIndicator}>
            {lastDetectedGesture && (
              <View style={[styles.gestureBadge, { backgroundColor: `${colors.primary}E0` }]}>
                <Text style={styles.gestureName}>{lastDetectedGesture.name}</Text>
                <Text style={styles.gestureConfidence}>
                  {Math.round(lastDetectedGesture.confidence * 100)}%
                </Text>
              </View>
            )}
          </View>

          {/* Camera Controls */}
          {showControls && (
            <View style={styles.controlsContainer}>
              <View style={styles.controlRow}>
                {/* Flip Camera */}
                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: `${colors.surface}E0` }]}
                  onPress={flipCamera}
                >
                  <Text style={styles.controlIcon}>🔄</Text>
                </TouchableOpacity>

                {/* Capture Button */}
                <TouchableOpacity
                  style={[styles.captureButton, { backgroundColor: colors.primary }]}
                  onPress={captureFrame}
                  disabled={isCapturing}
                >
                  {isCapturing ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <View style={styles.captureButtonInner} />
                  )}
                </TouchableOpacity>

                {/* Flash Toggle */}
                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: `${colors.surface}E0` }]}
                  onPress={toggleFlash}
                >
                  <Text style={styles.controlIcon}>
                    {flashMode === Camera.Constants.FlashMode.on ? '⚡' : '⚡️'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* FPS Counter */}
              <View style={[styles.fpsCounter, { backgroundColor: `${colors.surface}E0` }]}>
                <Text style={[styles.fpsText, { color: colors.text }]}>
                  {fps} FPS
                </Text>
              </View>
            </View>
          )}
        </View>
      </Camera>

      {/* Status Info */}
      <View style={[styles.statusBar, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statusText, { color: colors.textSecondary }]}>
          Gesture Detection Active
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  gestureIndicator: {
    alignItems: 'center',
    marginTop: 40,
  },
  gestureBadge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  gestureName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gestureConfidence: {
    color: 'white',
    fontSize: 14,
  },
  controlsContainer: {
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 24,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
  },
  fpsCounter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 16,
  },
  fpsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBar: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statusText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default CameraViewComponent;
