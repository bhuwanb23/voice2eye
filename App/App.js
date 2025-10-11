import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Speech from 'expo-speech';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      // For now, we'll assume audio permission is granted
      // In a real app, you'd use a proper audio recording library
      setHasPermission(true);
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setHasPermission(false);
    }
  };

  const startVoiceRecognition = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Microphone permission is required for voice recognition.');
      return;
    }

    try {
      setIsListening(true);
      setTranscript('');
      
      // Simulate voice recognition (in a real app, you'd use a speech recognition service)
      setTimeout(() => {
        const mockTranscript = "I can see a person, a chair, and a table";
        setTranscript(mockTranscript);
        setIsListening(false);
        
        // Simulate object detection based on voice input
        simulateObjectDetection(mockTranscript);
      }, 2000);
      
    } catch (error) {
      console.error('Voice recognition error:', error);
      setIsListening(false);
      Alert.alert('Error', 'Failed to start voice recognition');
    }
  };

  const simulateObjectDetection = (voiceInput) => {
    // Simulate AI object detection based on voice input
    const objects = [];
    if (voiceInput.toLowerCase().includes('person')) {
      objects.push({ name: 'Person', confidence: 0.95, position: { x: 100, y: 150 } });
    }
    if (voiceInput.toLowerCase().includes('chair')) {
      objects.push({ name: 'Chair', confidence: 0.88, position: { x: 200, y: 300 } });
    }
    if (voiceInput.toLowerCase().includes('table')) {
      objects.push({ name: 'Table', confidence: 0.92, position: { x: 150, y: 400 } });
    }
    
    setDetectedObjects(objects);
    
    // Speak the detected objects
    const objectNames = objects.map(obj => obj.name).join(', ');
    if (objectNames) {
      Speech.speak(`I can see: ${objectNames}`, {
        language: 'en',
        pitch: 1.0,
        rate: 0.8
      });
    }
  };

  const toggleCamera = async () => {
    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required.');
        return;
      }
    }
    setIsCameraActive(!isCameraActive);
  };

  const speakText = (text) => {
    Speech.speak(text, {
      language: 'en',
      pitch: 1.0,
      rate: 0.8
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Voice2Eye</Text>
        <Text style={styles.subtitle}>AI-Powered Voice & Vision Assistant</Text>
      </View>

      {/* Camera View */}
      {isCameraActive && (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onCameraReady={() => console.log('Camera ready')}
          >
            {/* Overlay detected objects */}
            {detectedObjects.map((obj, index) => (
              <View
                key={index}
                style={[
                  styles.objectMarker,
                  {
                    left: obj.position.x,
                    top: obj.position.y,
                  }
                ]}
              >
                <Text style={styles.objectLabel}>{obj.name}</Text>
                <Text style={styles.confidenceLabel}>
                  {Math.round(obj.confidence * 100)}%
                </Text>
              </View>
            ))}
          </CameraView>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {/* Voice Recognition Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Recognition</Text>
          <TouchableOpacity
            style={[styles.button, isListening && styles.buttonActive]}
            onPress={startVoiceRecognition}
            disabled={isListening}
          >
            <Text style={styles.buttonText}>
              {isListening ? 'Listening...' : 'Start Voice Recognition'}
            </Text>
          </TouchableOpacity>
          
          {transcript && (
            <View style={styles.transcriptContainer}>
              <Text style={styles.transcriptLabel}>You said:</Text>
              <Text style={styles.transcriptText}>{transcript}</Text>
            </View>
          )}
        </View>

        {/* Camera Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Camera Controls</Text>
          <TouchableOpacity
            style={[styles.button, isCameraActive && styles.buttonActive]}
            onPress={toggleCamera}
          >
            <Text style={styles.buttonText}>
              {isCameraActive ? 'Stop Camera' : 'Start Camera'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Detected Objects */}
        {detectedObjects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detected Objects</Text>
            {detectedObjects.map((obj, index) => (
              <View key={index} style={styles.objectItem}>
                <Text style={styles.objectName}>{obj.name}</Text>
                <Text style={styles.objectConfidence}>
                  Confidence: {Math.round(obj.confidence * 100)}%
                </Text>
                <TouchableOpacity
                  style={styles.speakButton}
                  onPress={() => speakText(`This is a ${obj.name}`)}
                >
                  <Text style={styles.speakButtonText}>🔊 Speak</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How to use:</Text>
          <Text style={styles.instructionText}>
            1. Tap "Start Voice Recognition" and describe what you see
          </Text>
          <Text style={styles.instructionText}>
            2. Enable camera to see visual overlays
          </Text>
          <Text style={styles.instructionText}>
            3. Tap "Speak" next to detected objects for audio feedback
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  cameraContainer: {
    height: height * 0.4,
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  objectMarker: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    padding: 5,
    borderRadius: 5,
    minWidth: 60,
    alignItems: 'center',
  },
  objectLabel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  confidenceLabel: {
    color: 'white',
    fontSize: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonActive: {
    backgroundColor: '#2E7D32',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  transcriptContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  transcriptLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  transcriptText: {
    fontSize: 16,
    color: '#333',
  },
  objectItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  objectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  objectConfidence: {
    fontSize: 12,
    color: '#666',
    marginRight: 10,
  },
  speakButton: {
    backgroundColor: '#FF6B6B',
    padding: 8,
    borderRadius: 5,
  },
  speakButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructions: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
});
