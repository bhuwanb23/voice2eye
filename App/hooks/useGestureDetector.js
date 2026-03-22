import { useEffect, useRef, useState, useCallback } from 'react'; 
import * as tf from '@tensorflow/tfjs'; 
import '@tensorflow/tfjs-react-native'; 
import * as FileSystem from 'expo-file-system'; 
import { Asset } from 'expo-asset'; 
import NetInfo from '@react-native-community/netinfo'; 
 
// EDIT THIS — replace with your actual backend URL 
const BACKEND_URL = 'http://192.168.1.8:8000/api/gestures/detect'; 
 
// How confident the on-device model must be before we trust it 
// If below this number, we send to the backend instead 
const CONFIDENCE_THRESHOLD = 0.85; 
 
export function useGestureDetector() { 
  const modelRef = useRef(null); 
  const labelsRef = useRef([]); 
  const [ready, setReady] = useState(false); 
  const [loadError, setLoadError] = useState(null); 
 
  useEffect(() => { 
    let cancelled = false; 
 
    async function loadModel() { 
      try { 
        // Step 1: initialise TensorFlow.js for React Native 
        await tf.ready(); 
 
        // Step 2: load the .tflite model from app assets 
        const modelAsset = Asset.fromModule( 
          require('../assets/model/custom_gestures.tflite') 
        ); 
        await modelAsset.downloadAsync(); 
 
        const model = await tf.loadLayersModel( 
          `file://${modelAsset.localUri}` 
        ); 
 
        // Step 3: load the labels list 
        const labelsAsset = Asset.fromModule( 
          require('../assets/model/labels.json') 
        ); 
        await labelsAsset.downloadAsync(); 
        const labelsText = await FileSystem.readAsStringAsync( 
          labelsAsset.localUri 
        ); 
        const labels = JSON.parse(labelsText); 
 
        if (!cancelled) { 
          modelRef.current = model; 
          labelsRef.current = labels; 
          setReady(true); 
        } 
      } catch (e) { 
        if (!cancelled) { 
          console.warn('Gesture model failed to load:', e.message); 
          setLoadError(e.message); 
        } 
      } 
    } 
 
    loadModel(); 
    return () => { cancelled = true; }; 
  }, []); 
 
  const detect = useCallback(async (landmarks) => { 
    // landmarks is an array of 63 numbers (21 hand points × x,y,z each) 
 
    // PRIMARY PATH — run model on device 
    if (modelRef.current && Array.isArray(landmarks) && landmarks.length === 63) { 
      try { 
        const input = tf.tensor2d([landmarks]); 
        const prediction = modelRef.current.predict(input); 
        const scores = Array.from(await prediction.data()); 
 
        // Always clean up tensors to avoid memory leaks 
        input.dispose(); 
        prediction.dispose(); 
 
        const maxIndex = scores.indexOf(Math.max(...scores)); 
        const confidence = scores[maxIndex]; 
 
        if (confidence >= CONFIDENCE_THRESHOLD) { 
          return { 
            label: labelsRef.current[maxIndex] ?? 'unknown', 
            confidence: confidence, 
            source: 'on-device', 
          }; 
        } 
        // confidence too low — fall through to backend 
      } catch (e) { 
        console.warn('On-device inference error:', e.message); 
        // fall through to backend 
      } 
    } 
 
    // FALLBACK PATH — send landmarks to FastAPI backend 
    try { 
      const netState = await NetInfo.fetch(); 
      if (!netState.isConnected) { 
        return { label: 'unknown', confidence: 0, source: 'offline' }; 
      } 
 
      const response = await fetch(BACKEND_URL, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ landmarks: landmarks }), 
      }); 
 
      if (!response.ok) { 
        throw new Error(`Backend responded with status ${response.status}`); 
      } 
 
      const data = await response.json(); 
      return { 
        label: data.label, 
        confidence: data.confidence, 
        source: 'backend', 
      }; 
    } catch (e) { 
      console.warn('Backend fallback error:', e.message); 
      return { label: 'unknown', confidence: 0, source: 'error' }; 
    } 
  }, []); 
 
  return { detect, ready, loadError }; 
} 
