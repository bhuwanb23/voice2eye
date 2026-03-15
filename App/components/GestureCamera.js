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
} from 'react-native-vision-camera';

export function GestureCamera() {
  const device = useCameraDevice('front');  // changed to back camera
  const [hasPermission, setHasPermission] = useState(false);
  const [status, setStatus] = useState('Starting...');

  useEffect(() => {
    setStatus('Requesting permission...');
    Camera.requestCameraPermission().then((s) => {
      console.log('Camera permission:', s);
      setStatus('Permission: ' + s);
      setHasPermission(s === 'granted');
    });
  }, []);

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
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
      />
      <View style={styles.badge}>
        <Text style={styles.hintText}>Camera working ✓ — no gesture yet</Text>
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
});