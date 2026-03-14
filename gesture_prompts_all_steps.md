# Hand Gesture Detection — 7 Step-by-Step AI Prompts
# Expo (Managed) · JavaScript · FastAPI Backend
# Paste each prompt ONE AT A TIME to your AI assistant. Wait for it to finish before moving to the next.

================================================================================
PROMPT 1 OF 7 — PROJECT SETUP & DEPENDENCIES
================================================================================

I have an existing React Native app built with Expo managed workflow using a JavaScript blank template (not TypeScript). The app already has a working camera. I am now adding hand gesture detection on top of it. Do NOT touch any existing files yet. Just set up the dependencies.

Here is exactly what I need you to do:

TASK 1 — Install these npm packages by running these commands in the project root:

  npx expo install react-native-vision-camera
  npx expo install @tensorflow/tfjs-react-native
  npx expo install @tensorflow/tfjs
  npx expo install expo-file-system
  npx expo install expo-asset
  npx expo install @react-native-community/netinfo
  npm install react-native-mediapipe

TASK 2 — Open my app.json file and add the following inside the "expo" object. If a "plugins" array already exists, add to it. If it does not exist, create it:

  "plugins": [
    [
      "react-native-vision-camera",
      {
        "cameraPermissionText": "We need camera access to detect hand gestures"
      }
    ]
  ]

Also add this inside the "expo" object if "assetBundlePatterns" does not already exist:

  "assetBundlePatterns": [
    "**/*",
    "assets/model/*"
  ]

TASK 3 — Create these empty folders in my project (do not put any files in them yet):
  - assets/model/
  - hooks/
  - components/

TASK 4 — After all installations are done, run this command and show me the output so I can confirm everything installed correctly:
  npx expo doctor

Tell me if there are any version conflicts and how to fix them before I move to the next step. Do not proceed to any other code changes until I confirm the install is clean.


================================================================================
PROMPT 2 OF 7 — TRAIN THE CUSTOM GESTURE MODEL (PYTHON, RUNS ON YOUR COMPUTER)
================================================================================

I have an Expo React Native app with a FastAPI backend. I need to train a custom gesture detection model on my computer (not the phone). This is a one-time step. The output will be two files: custom_gestures.tflite and labels.json which I will copy into my app later.

Here is exactly what I need you to do:

TASK 1 — Create a folder called "train" in my project root. Inside it, create a file called collect_landmarks.py with this exact content:

---FILE: train/collect_landmarks.py---

import mediapipe as mp
import cv2
import csv
import os

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils

# EDIT THIS LIST — replace with your own gesture names
GESTURES = ["thumbs_up", "peace", "fist", "open_hand"]

def collect(label, output_csv="dataset.csv"):
    cap = cv2.VideoCapture(0)
    with mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.7) as hands:
        print(f"\nCollecting '{label}' — press SPACE to capture a sample, Q to finish\n")
        with open(output_csv, "a", newline="") as f:
            writer = csv.writer(f)
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                result = hands.process(rgb)
                if result.multi_hand_landmarks:
                    lm = result.multi_hand_landmarks[0].landmark
                    mp_draw.draw_landmarks(
                        frame,
                        result.multi_hand_landmarks[0],
                        mp_hands.HAND_CONNECTIONS
                    )
                    key = cv2.waitKey(1)
                    if key == ord(' '):
                        row = [label] + [v for p in lm for v in (p.x, p.y, p.z)]
                        writer.writerow(row)
                        print(f"  Captured sample for '{label}'")
                    elif key == ord('q'):
                        break
                else:
                    cv2.waitKey(1)
                cv2.imshow(f"Collecting: {label}", frame)
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    for gesture in GESTURES:
        print(f"\n--- Now collecting: {gesture} ---")
        print("Aim for at least 50 samples per gesture.")
        collect(gesture)
    print("\nDone! dataset.csv is ready for training.")

---END FILE---

TASK 2 — Create a file called train_model.py inside the same "train" folder with this exact content:

---FILE: train/train_model.py---

import pandas as pd
import numpy as np
import tensorflow as tf
import json
import os
from sklearn.model_selection import train_test_split

df = pd.read_csv("dataset.csv", header=None)
X = df.iloc[:, 1:].values.astype(np.float32)
labels_raw = df.iloc[:, 0]
label_categories = pd.Categorical(labels_raw)
y = label_categories.codes.astype(np.int32)
label_names = list(label_categories.categories)

print(f"Labels found: {label_names}")
print(f"Total samples: {len(X)}")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = tf.keras.Sequential([
    tf.keras.layers.Dense(128, activation="relu", input_shape=(63,)),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(64, activation="relu"),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(len(label_names), activation="softmax"),
])

model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.fit(
    X_train, y_train,
    epochs=50,
    validation_data=(X_test, y_test)
)

output_dir = os.path.join("..", "assets", "model")
os.makedirs(output_dir, exist_ok=True)

converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

tflite_path = os.path.join(output_dir, "custom_gestures.tflite")
labels_path = os.path.join(output_dir, "labels.json")

with open(tflite_path, "wb") as f:
    f.write(tflite_model)

with open(labels_path, "w") as f:
    json.dump(label_names, f)

print(f"\nDone! Model saved to: {tflite_path}")
print(f"Labels saved to: {labels_path}")

---END FILE---

TASK 3 — Tell me exactly what pip packages I need to install on my computer to run these scripts, and give me the single pip install command to run.

TASK 4 — Give me clear step-by-step instructions for:
  a) How to run collect_landmarks.py (what to do with the webcam, how many samples to collect)
  b) How to run train_model.py after collecting data
  c) How to confirm that assets/model/custom_gestures.tflite and assets/model/labels.json were created successfully

Do not touch any React Native files in this step. Only create the train/ folder and its two Python files.


================================================================================
PROMPT 3 OF 7 — CREATE THE GESTURE DETECTION HOOK (JavaScript)
================================================================================

I have an Expo managed workflow React Native app using JavaScript (not TypeScript). The camera already works. I have already installed all dependencies from Step 1 and I have the model files at assets/model/custom_gestures.tflite and assets/model/labels.json from Step 2.

Now I need you to create the core gesture detection logic as a custom React hook.

Here is exactly what I need you to do:

TASK 1 — Create a new file at hooks/useGestureDetector.js with this exact content. Read every comment carefully because some values need to match my setup:

---FILE: hooks/useGestureDetector.js---

import { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import NetInfo from '@react-native-community/netinfo';

// EDIT THIS — replace with your actual backend URL
const BACKEND_URL = 'http://YOUR_BACKEND_IP:8000/detect';

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

---END FILE---

TASK 2 — After creating the file, check it for any JavaScript syntax errors and fix them if found.

TASK 3 — Tell me: where in this file do I put my actual backend URL? Give me one clear sentence.

TASK 4 — Explain in plain English what this hook does in 3 bullet points so I can confirm you understood it correctly before I move on.

Do not create any other files yet. Do not modify any existing files.


================================================================================
PROMPT 4 OF 7 — CREATE THE GESTURE CAMERA COMPONENT (JavaScript)
================================================================================

I have an Expo managed workflow React Native JavaScript app. I already have:
- hooks/useGestureDetector.js (created in the previous step)
- assets/model/custom_gestures.tflite
- assets/model/labels.json
- A working camera somewhere in my existing app

Now I need you to create a self-contained GestureCamera component that I can drop into any screen.

Here is exactly what I need you to do:

TASK 1 — Create a new file at components/GestureCamera.js with this exact content:

---FILE: components/GestureCamera.js---

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
        frameProcessorFps={15}
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

---END FILE---

TASK 2 — After creating the file, confirm the import path for useGestureDetector is correct relative to the components/ folder. It should be '../hooks/useGestureDetector'. Fix it if it is wrong.

TASK 3 — Do NOT modify any existing screen or navigation file yet. Just confirm the component file was created with no syntax errors.

TASK 4 — Show me the folder structure of my project now so I can confirm all files are in the right place before the next step.


================================================================================
PROMPT 5 OF 7 — WIRE THE COMPONENT INTO YOUR EXISTING SCREEN
================================================================================

I have an Expo managed workflow React Native JavaScript app. I now have:
- hooks/useGestureDetector.js
- components/GestureCamera.js

My existing app already has a working camera. I need you to find the right screen file and add the GestureCamera component to it WITHOUT removing any existing code that is already working.

Here is exactly what I need you to do:

TASK 1 — Look at my existing project file structure. Find the screen or component file where the camera is currently being used. It is probably one of these:
  - App.js
  - screens/CameraScreen.js
  - app/(tabs)/index.js
  - app/index.js
  - Or something similar

Show me the full path of the file you found and show me its current contents before making any changes.

TASK 2 — Add the GestureCamera component to that screen. Follow these rules strictly:
  a) Import GestureCamera at the top of the file:
       import { GestureCamera } from '../components/GestureCamera';
     (adjust the relative path based on where the screen file is located)
  b) Replace only the camera-related JSX with <GestureCamera />
  c) Keep ALL other existing code: navigation, buttons, headers, state variables, styles
  d) If the screen has a full-screen camera layout, GestureCamera should fill that space
  e) Do not remove any imports that are still used elsewhere in the file

TASK 3 — If my existing screen already handles camera permissions itself, check whether it conflicts with the permission request inside GestureCamera.js. If there is a conflict (both requesting permission), remove the duplicate from the screen file only — the one inside GestureCamera.js should remain because that is the correct place for it.

TASK 4 — Show me a diff (before vs after) of exactly what changed in the screen file so I can review it before running the app.

TASK 5 — Do not touch any other files. Do not change navigation files, tab files, or any other screen.


================================================================================
PROMPT 6 OF 7 — ADD THE BACKEND ENDPOINT TO FASTAPI
================================================================================

I have a Python FastAPI backend that is already running and has existing endpoints. I need to add ONE new endpoint called /detect that accepts hand landmarks and returns a gesture prediction. Do NOT change any existing endpoints or files — only add new code.

Here is exactly what I need you to do:

TASK 1 — Show me the current contents of my main FastAPI file (usually main.py or app/main.py). I need to confirm where the FastAPI app instance is defined before you add anything.

TASK 2 — Add these imports to the top of my main FastAPI file IF they are not already there. Add only the ones that are missing — do not duplicate any existing imports:

  from pydantic import BaseModel
  import numpy as np
  import tensorflow as tf
  import json
  import os

TASK 3 — Add this model loading code OUTSIDE of any function, at the module level (near the top, after imports). This makes the model load once at startup instead of on every request:

  _MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
  _gesture_model = tf.keras.models.load_model(
      os.path.join(_MODEL_DIR, "saved_gesture_model")
  )
  with open(os.path.join(_MODEL_DIR, "labels.json")) as f:
      _gesture_labels = json.load(f)

TASK 4 — Add this request schema class and endpoint function to the file. Place it AFTER the model loading code and BEFORE the last line of the file (usually where uvicorn.run is called, if it exists):

  class LandmarkPayload(BaseModel):
      landmarks: list

  @app.post("/detect")
  def detect_gesture(payload: LandmarkPayload):
      if len(payload.landmarks) != 63:
          return {
              "error": "Expected exactly 63 landmark values (21 points x 3)",
              "label": "unknown",
              "confidence": 0.0
          }

      x = np.array(payload.landmarks, dtype=np.float32).reshape(1, -1)
      scores = _gesture_model.predict(x, verbose=0)[0]
      best_index = int(np.argmax(scores))

      return {
          "label": _gesture_labels[best_index],
          "confidence": float(scores[best_index]),
          "source": "backend"
      }

TASK 5 — Create a folder called "model" inside my backend project folder. Then tell me exactly what two files I need to copy into it and from where:
  - The trained model folder (from assets/model/ in the React Native project)
  - The labels.json file (from assets/model/ in the React Native project)
  Give me the exact copy commands to run.

TASK 6 — Check my requirements.txt (or pyproject.toml if that is what I use). Add these lines if they are missing:
  tensorflow
  numpy

TASK 7 — Tell me how to test the /detect endpoint using curl before I run the mobile app. Give me a ready-to-run curl command with 63 placeholder numbers so I can confirm the endpoint responds correctly.


================================================================================
PROMPT 7 OF 7 — EXPO DEV BUILD & FINAL TEST
================================================================================

I have an Expo managed workflow React Native JavaScript app. I have completed all previous steps:
- Dependencies installed
- Model trained and placed in assets/model/
- hooks/useGestureDetector.js created
- components/GestureCamera.js created
- GestureCamera wired into my existing screen
- FastAPI backend has the /detect endpoint

Now I need to build and test everything. This step is important: because my app uses react-native-mediapipe and react-native-vision-camera which are NATIVE modules, the standard "npx expo start" with Expo Go will NOT work. I need a development build.

Here is exactly what I need you to do:

TASK 1 — Run the Expo prebuild command to generate native iOS and Android folders:

  npx expo prebuild --clean

  After it finishes, confirm that the "android" and "ios" folders were created in my project root.

TASK 2 — To run on a real Android device:
  a) Connect my Android phone via USB
  b) Enable USB Debugging on the phone (Settings > Developer Options > USB Debugging)
  c) Run: npx expo run:android
  d) Wait for the build to complete and the app to launch on the device

  To run on a real iOS device:
  a) Make sure I have Xcode installed
  b) Run: npx expo run:ios
  c) I may need to set a development team in ios/[AppName].xcworkspace

  Tell me which one to do based on what device I have available.

TASK 3 — Once the app is running on the device, walk me through this test checklist one item at a time. Wait for me to confirm each one before moving to the next:

  TEST 1: Does the app open without crashing?
  TEST 2: Does the camera view appear on screen?
  TEST 3: Does the loading spinner appear briefly then disappear (model loaded)?
  TEST 4: When I hold my hand in front of the camera, does a gesture label appear?
  TEST 5: Does the label update when I change gestures?
  TEST 6: Turn off wifi and mobile data — does the app still detect gestures? (on-device path working)
  TEST 7: Turn wifi back on — check FastAPI logs — do any requests appear for low-confidence frames? (backend fallback working)

TASK 4 — If any test fails, here are the common fixes. Check each one for me:

  CRASH ON LAUNCH:
  - Check that assets/model/custom_gestures.tflite exists
  - Check that assetBundlePatterns includes "assets/model/*" in app.json
  - Run: npx expo prebuild --clean again and rebuild

  CAMERA NOT SHOWING:
  - Check that camera permission is in app.json plugins
  - On Android: check AndroidManifest.xml has CAMERA permission
  - On iOS: check Info.plist has NSCameraUsageDescription

  MODEL NOT LOADING (spinner never disappears):
  - Log the loadError value from useGestureDetector
  - Confirm the file path in require('../assets/model/custom_gestures.tflite') is correct

  NO GESTURE DETECTED:
  - Confirm react-native-mediapipe is installed and linked
  - Add a console.log inside handleLandmarks to check if landmarks are arriving
  - Make sure you trained with at least 50 samples per gesture

  BACKEND NOT RECEIVING REQUESTS:
  - Check BACKEND_URL in hooks/useGestureDetector.js — it must be your computer's local IP not "localhost"
  - Your phone and computer must be on the same wifi network
  - Check FastAPI is running: curl http://YOUR_IP:8000/detect

TASK 5 — Once all 7 tests pass, show me the final folder structure of the entire project so I can save it as a reference.
