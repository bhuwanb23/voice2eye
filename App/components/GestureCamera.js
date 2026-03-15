import React, { useState, useCallback, useEffect } from 'react'; 
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
} from 'react-native'; 
import { 
  Camera, 
  useCameraDevice, 
  useFrameProcessor, 
} from 'react-native-vision-camera'; 
import { useHandLandmarker } from 'react-native-mediapipe'; 
import { runOnJS } from 'react-native-reanimated'; 
import { useGestureDetector } from '../hooks/useGestureDetector'; 

export function GestureCamera() { 
  const device = useCameraDevice('front'); 
  const { detect, ready, loadError } = useGestureDetector(); 
  const [gestureResult, setGestureResult] = useState(null); 
  const [hasPermission, setHasPermission] = useState(false); 

  // Ask for camera permission when component mounts 
  useEffect(() => { 
    Camera.requestCameraPermission().then((status) => { 
      setHasPermission(status === 'granted'); 
    }); 
  }, []); 

  // Set up MediaPipe hand landmark detector 
  const { detectHandLandmarks } = useHandLandmarker({ 
    numHands: 1, 
    minHandDetectionConfidence: 0.5, 
    minHandPresenceConfidence: 0.5, 
    minTrackingConfidence: 0.5, 
  }); 

  // This runs on the JS thread after landmarks are found 
  const handleLandmarks = useCallback( 
    async (rawLandmarks) => { 
      if (!ready) return; 
      const result = await detect(rawLandmarks); 
      if (result && result.label !== 'unknown') { 
        setGestureResult(result); 
      } 
    }, 
    [detect, ready] 
  ); 

  // This runs on every camera frame (native thread) 
  const frameProcessor = useFrameProcessor( 
    (frame) => { 
      'worklet'; 
      const landmarks = detectHandLandmarks(frame); 
      if (landmarks && landmarks.length === 63) { 
        runOnJS(handleLandmarks)(landmarks); 
      } 
    }, 
    [handleLandmarks] 
  ); 

  // --- Render: no permission --- 
  if (!hasPermission) { 
    return ( 
      <View style={styles.center}> 
        <Text style={styles.message}> 
          Camera permission is required to detect gestures. 
        </Text> 
      </View> 
    ); 
  } 

  // --- Render: model load error --- 
  if (loadError) { 
    return ( 
      <View style={styles.center}> 
        <Text style={styles.message}> 
          Could not load gesture model: {loadError} 
        </Text> 
      </View> 
    ); 
  } 

  // --- Render: no camera device found --- 
  if (!device) { 
    return ( 
      <View style={styles.center}> 
        <Text style={styles.message}>No camera found on this device.</Text> 
      </View> 
    ); 
  } 

  // --- Render: main camera view --- 
  return ( 
    <View style={styles.container}> 
      <Camera 
        style={StyleSheet.absoluteFill} 
        device={device} 
        isActive={true} 
        frameProcessor={frameProcessor} 
      /> 

      {/* Show spinner while model is loading */} 
      {!ready && ( 
        <View style={styles.loadingOverlay}> 
          <ActivityIndicator size="large" color="#ffffff" /> 
          <Text style={styles.loadingText}>Loading gesture model…</Text> 
        </View> 
      )} 

      {/* Show detected gesture label at the bottom */} 
      {gestureResult && ( 
        <View style={styles.resultBadge}> 
          <Text style={styles.gestureLabel}>{gestureResult.label}</Text> 
          <Text style={styles.confidenceText}> 
            {Math.round(gestureResult.confidence * 100)}% confidence 
            {'  ·  '} 
            {gestureResult.source} 
          </Text> 
        </View> 
      )} 

      {/* Prompt when model is ready but no gesture detected yet */} 
      {ready && !gestureResult && ( 
        <View style={styles.resultBadge}> 
          <Text style={styles.hintText}>Show a hand gesture…</Text> 
        </View> 
      )} 
    </View> 
  ); 
} 

const styles = StyleSheet.create({ 
  container: { 
    flex: 1, 
    backgroundColor: '#000', 
  }, 
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#000', 
    padding: 24, 
  }, 
  message: { 
    color: '#ffffff', 
    fontSize: 16, 
    textAlign: 'center', 
  }, 
  loadingOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 12, 
  }, 
  loadingText: { 
    color: '#ffffff', 
    fontSize: 14, 
    marginTop: 8, 
  }, 
  resultBadge: { 
    position: 'absolute', 
    bottom: 48, 
    alignSelf: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.65)', 
    borderRadius: 16, 
    paddingHorizontal: 24, 
    paddingVertical: 14, 
    alignItems: 'center', 
  }, 
  gestureLabel: { 
    color: '#ffffff', 
    fontSize: 32, 
    fontWeight: '700', 
    textTransform: 'capitalize', 
  }, 
  confidenceText: { 
    color: 'rgba(255, 255, 255, 0.6)', 
    fontSize: 12, 
    marginTop: 4, 
  }, 
  hintText: { 
    color: 'rgba(255, 255, 255, 0.7)', 
    fontSize: 16, 
  }, 
}); 
