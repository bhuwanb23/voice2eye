import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
} from 'react-native-vision-camera';
import * as Speech from 'expo-speech';

export function GestureCamera() {
  const device = useCameraDevice('front');  // changed to back camera
  const [hasPermission, setHasPermission] = useState(false);
  const [status, setStatus] = useState('Starting...');
  const [gestureResult, setGestureResult] = useState(null);
  const cameraRef = useRef(null);
  const isProcessing = useRef(false);
  const intervalRef = useRef(null);
  const lastSpokenGesture = useRef(null);

  useEffect(() => {
    setStatus('Requesting permission...');
    Camera.requestCameraPermission().then((s) => {
      console.log('Camera permission:', s);
      setStatus('Permission: ' + s);
      setHasPermission(s === 'granted');
    });
  }, []);

  const speakGesture = (gestureName) => {
    if (lastSpokenGesture.current === gestureName) return;
    
    Speech.speak(`${gestureName} detected`, {
      language: 'en',
      pitch: 1.0,
      rate: 1.0,
    });
    lastSpokenGesture.current = gestureName;
  };

  useEffect(() => {
    if (hasPermission && device) {
      intervalRef.current = setInterval(async () => {
        if (isProcessing.current || !cameraRef.current) return;
        isProcessing.current = true;

        try {
          const photo = await cameraRef.current.takePhoto({
            qualityPrioritization: 'speed',
            flash: 'off',
            enableShutterSound: false,
          });

          // Resize before sending using fetch + blob
          const response = await fetch(`file://${photo.path}`);
          const blob = await response.blob();
          const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(blob);
          });

          const res = await fetch('http://192.168.1.4:8000/api/gestures/detect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ frame: base64 }),
          });

          if (res.ok) {
            const data = await res.json();
            console.log('GESTURE DATA (GestureCamera):', JSON.stringify(data));
            if (data.label && data.label !== 'unknown') {
              const gestureName = data.label.replace('_', ' ');
              setGestureResult({
                label: gestureName,
                confidence: data.confidence,
              });
              speakGesture(gestureName);
            } else {
              lastSpokenGesture.current = null;
              setGestureResult(null);
            }
          }
        } catch (e) {
          console.warn('Frame error (GestureCamera):', e.message);
        } finally {
          isProcessing.current = false;
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasPermission, device]);

  useEffect(() => {
    console.log('Device:', device);
    console.log('Has permission:', hasPermission);
    if (device) setStatus('Camera ready');
    else setStatus('No camera device found');
  }, [device, hasPermission]);

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Status: {status}</Text>
        <Text style={styles.message}>Waiting for camera permission...</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>No camera device found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />
      <View style={styles.badge}>
        {gestureResult ? (
          <>
            <Text style={styles.gestureLabel}>{gestureResult.label}</Text>
            <Text style={styles.confidenceText}>
              {Math.round(gestureResult.confidence * 100)}% confidence
            </Text>
          </>
        ) : (
          <Text style={styles.hintText}>Show a gesture ✋</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
    padding: 24,
  },
  message: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 8 },
  badge: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  hintText: { color: '#fff', fontSize: 16 },
  gestureLabel: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  confidenceText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 4,
  },
});
