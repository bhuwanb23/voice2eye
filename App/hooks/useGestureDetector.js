import { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { fetch as tfFetch } from '@tensorflow/tfjs-react-native';
import NetInfo from '@react-native-community/netinfo';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

// ✏️ EDIT: set your backend URL
const BACKEND_URL = 'https://YOUR_BACKEND_URL/detect';
const CONFIDENCE_THRESHOLD = 0.85;

export interface GestureResult {
  label: string;
  confidence: number;
  source: 'on-device' | 'backend' | 'unknown';
}

export function useGestureDetector() {
  const modelRef = useRef<tf.LayersModel | null>(null);
  const labelsRef = useRef<string[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await tf.ready();

        // Load model from assets
        const modelAsset = Asset.fromModule(require('../assets/model/custom_gestures.tflite'));
        await modelAsset.downloadAsync();

        // Load as TFLite delegate
        const model = await tf.loadLayersModel(
          `file://${modelAsset.localUri}`
        );

        // Load labels
        const labelsAsset = Asset.fromModule(require('../assets/model/labels.json'));
        await labelsAsset.downloadAsync();
        const labelsText = await FileSystem.readAsStringAsync(labelsAsset.localUri!);
        const labels = JSON.parse(labelsText);

        if (!cancelled) {
          modelRef.current = model;
          labelsRef.current = labels;
          setReady(true);
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const detect = useCallback(async (landmarks: number[]): Promise<GestureResult> => {
    // --- PRIMARY: on-device ---
    if (modelRef.current && landmarks.length === 63) {
      try {
        const input = tf.tensor2d([landmarks]);
        const pred = modelRef.current.predict(input) as tf.Tensor;
        const scores = Array.from(await pred.data());
        input.dispose();
        pred.dispose();

        const maxIdx = scores.indexOf(Math.max(...scores));
        const confidence = scores[maxIdx];

        if (confidence >= CONFIDENCE_THRESHOLD) {
          return {
            label: labelsRef.current[maxIdx] ?? 'unknown',
            confidence,
            source: 'on-device',
          };
        }
      } catch (e) {
        console.warn('On-device inference failed:', e);
      }
    }

    // --- FALLBACK: backend ---
    try {
      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        return { label: 'unknown', confidence: 0, source: 'unknown' };
      }

      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landmarks }),
        signal: AbortSignal.timeout(3000), // 3s timeout
      });

      if (!res.ok) throw new Error(`Backend error ${res.status}`);
      const data = await res.json();

      return {
        label: data.label,
        confidence: data.confidence,
        source: 'backend',
      };
    } catch (e) {
      console.warn('Backend fallback failed:', e);
      return { label: 'unknown', confidence: 0, source: 'unknown' };
    }
  }, []);

  return { detect, ready, error };
}