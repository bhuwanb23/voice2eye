/**
 * Gesture Training Screen
 * Interactive gesture learning and practice interface
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccessibility } from '../components/AccessibilityProvider';
import StatusIndicator from '../components/StatusIndicator';
import * as Speech from 'expo-speech';

// Import new gesture components
import GestureHeader from '../components/gesture/GestureHeader';
import TrainingModeSelector from '../components/gesture/TrainingModeSelector';
import GestureFeedback from '../components/gesture/GestureFeedback';
import GestureDetails from '../components/gesture/GestureDetails';
import GestureList from '../components/gesture/GestureList';
import SequenceTraining from '../components/gesture/SequenceTraining';
import Recommendations from '../components/gesture/Recommendations';
import ProgressStats from '../components/gesture/ProgressStats';
import LastDetected from '../components/gesture/LastDetected';
import DetectionControls from '../components/gesture/DetectionControls';
import GestureProgressBar from '../components/gesture/GestureProgressBar';

const { width, height } = Dimensions.get('window');

const GestureTrainingScreen = ({ navigation }) => {
  const { settings, getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  
  const [currentGesture, setCurrentGesture] = useState(null);
  const [trainingMode, setTrainingMode] = useState('learn'); // learn, practice, test
  const [gestureProgress, setGestureProgress] = useState({});
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastDetectedGesture, setLastDetectedGesture] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('Ready for training');
  const [accuracyMetrics, setAccuracyMetrics] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [currentSequence, setCurrentSequence] = useState(null);
  const [feedbackVisualization, setFeedbackVisualization] = useState(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Enhanced gesture data with more details for training
  const gestures = [
    {
      id: 'open_hand',
      name: 'Open Hand',
      description: 'Start listening for voice commands',
      emoji: '✋',
      instruction: 'Hold your hand open with all fingers extended',
      practiceCount: 0,
      confidenceThreshold: 0.7,
      fingerCount: 5,
      holdTime: 0.5,
      category: 'basic',
    },
    {
      id: 'fist',
      name: 'Fist',
      description: 'Stop voice recognition',
      emoji: '✊',
      instruction: 'Make a fist with all fingers closed',
      practiceCount: 0,
      confidenceThreshold: 0.7,
      fingerCount: 0,
      holdTime: 0.5,
      category: 'basic',
    },
    {
      id: 'two_fingers',
      name: 'Two Fingers',
      description: 'Emergency trigger',
      emoji: '✌️',
      instruction: 'Extend your index and middle finger',
      practiceCount: 0,
      confidenceThreshold: 0.8,
      fingerCount: 2,
      holdTime: 1.0,
      category: 'emergency',
    },
    {
      id: 'thumbs_up',
      name: 'Thumbs Up',
      description: 'Yes/Confirm',
      emoji: '👍',
      instruction: 'Extend your thumb upward',
      practiceCount: 0,
      confidenceThreshold: 0.6,
      fingerCount: 1,
      holdTime: 0.3,
      category: 'basic',
    },
    {
      id: 'thumbs_down',
      name: 'Thumbs Down',
      description: 'No/Cancel',
      emoji: '👎',
      instruction: 'Extend your thumb downward',
      practiceCount: 0,
      confidenceThreshold: 0.6,
      fingerCount: 1,
      holdTime: 0.3,
      category: 'basic',
    },
    {
      id: 'pointing',
      name: 'Pointing',
      description: 'Direction/Selection',
      emoji: '👆',
      instruction: 'Point with your index finger',
      practiceCount: 0,
      confidenceThreshold: 0.7,
      fingerCount: 1,
      holdTime: 0.8,
      category: 'navigation',
    },
    {
      id: 'wave',
      name: 'Wave',
      description: 'Hello/Goodbye',
      emoji: '👋',
      instruction: 'Wave your hand from side to side',
      practiceCount: 0,
      confidenceThreshold: 0.6,
      fingerCount: 5,
      holdTime: 1.5,
      category: 'social',
    },
    {
      id: 'stop_gesture',
      name: 'Stop Gesture',
      description: 'Halt current action',
      emoji: '🛑',
      instruction: 'Hold your hand up with palm facing forward',
      practiceCount: 0,
      confidenceThreshold: 0.7,
      fingerCount: 3,
      holdTime: 0.5,
      category: 'control',
    },
  ];

  // Gesture sequences for advanced training
  const gestureSequences = [
    {
      id: 'greeting_sequence',
      name: 'Greeting Sequence',
      description: 'Wave followed by thumbs up',
      sequence: ['wave', 'thumbs_up'],
      difficulty: 'easy',
    },
    {
      id: 'emergency_sequence',
      name: 'Emergency Sequence',
      description: 'Open hand followed by two fingers',
      sequence: ['open_hand', 'two_fingers'],
      difficulty: 'medium',
    },
    {
      id: 'navigation_sequence',
      name: 'Navigation Sequence',
      description: 'Pointing followed by open hand',
      sequence: ['pointing', 'open_hand'],
      difficulty: 'medium',
    },
    {
      id: 'control_sequence',
      name: 'Control Sequence',
      description: 'Stop gesture followed by fist',
      sequence: ['stop_gesture', 'fist'],
      difficulty: 'hard',
    },
  ];

  useEffect(() => {
    if (settings.voiceNavigation) {
      announceScreenEntry();
    }
    
    // Initialize with some sample data for demonstration
    initializeSampleData();
  }, []);

  const initializeSampleData = () => {
    // Sample accuracy metrics
    const sampleMetrics = {};
    gestures.forEach(gesture => {
      sampleMetrics[gesture.id] = {
        accuracy: Math.floor(Math.random() * 40) + 60, // 60-99%
        attempts: Math.floor(Math.random() * 20) + 5,
        success: Math.floor(Math.random() * 15) + 3,
      };
    });
    setAccuracyMetrics(sampleMetrics);
    
    // Sample recommendations
    setRecommendations([
      "Practice the 'Two Fingers' gesture for better emergency recognition",
      "Your 'Wave' gesture accuracy is excellent!",
      "Try holding gestures longer for better detection",
    ]);
  };

  const announceScreenEntry = () => {
    const message = `Gesture training screen. ${gestures.length} gestures available. Choose a gesture to learn or practice.`;
    Speech.speak(message, {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
    });
  };

  // Simulate real gesture detection integration
  const startGestureDetection = async () => {
    setIsDetecting(true);
    setCurrentStatus('listening');
    setStatusMessage('Detecting gestures...');
    
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();
    
    // Simulate API call to backend
    try {
      // In a real implementation, this would connect to:
      // POST /api/gestures/analyze or WebSocket /api/gestures/analyze/stream
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const randomGesture = gestures[Math.floor(Math.random() * gestures.length)];
      const confidence = Math.random() * 0.4 + 0.6; // 60-100%
      
      setLastDetectedGesture({
        ...randomGesture,
        confidence: parseFloat(confidence.toFixed(2)),
        timestamp: new Date().toISOString(),
      });
      
      setIsDetecting(false);
      setCurrentStatus('idle');
      setStatusMessage(`Detected: ${randomGesture.name} (${(confidence * 100).toFixed(1)}% confidence)`);
      progressAnim.setValue(0);
      
      // Update practice count
      setGestureProgress(prev => ({
        ...prev,
        [randomGesture.id]: (prev[randomGesture.id] || 0) + 1,
      }));
      
      // Update accuracy metrics
      setAccuracyMetrics(prev => ({
        ...prev,
        [randomGesture.id]: {
          ...prev[randomGesture.id],
          attempts: (prev[randomGesture.id]?.attempts || 0) + 1,
          success: (prev[randomGesture.id]?.success || 0) + (confidence > randomGesture.confidenceThreshold ? 1 : 0),
          accuracy: Math.floor(((prev[randomGesture.id]?.success || 0) + (confidence > randomGesture.confidenceThreshold ? 1 : 0)) / 
                     ((prev[randomGesture.id]?.attempts || 0) + 1) * 100),
        }
      }));
      
      // Provide feedback
      if (settings.voiceNavigation) {
        Speech.speak(`Detected ${randomGesture.name} gesture with ${(confidence * 100).toFixed(1)}% confidence`, {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
      }
      
      if (settings.hapticFeedback) {
        Vibration.vibrate(100);
      }
      
      // Set feedback visualization
      setFeedbackVisualization({
        gesture: randomGesture,
        confidence,
        isAccurate: confidence > randomGesture.confidenceThreshold,
      });
      
      // Clear feedback after delay
      setTimeout(() => {
        setFeedbackVisualization(null);
      }, 3000);
      
    } catch (error) {
      setIsDetecting(false);
      setCurrentStatus('error');
      setStatusMessage('Detection failed. Please try again.');
      progressAnim.setValue(0);
      
      if (settings.voiceNavigation) {
        Speech.speak('Gesture detection failed. Please try again.', {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
      }
    }
  };

  const selectGesture = (gesture) => {
    setCurrentGesture(gesture);
    
    if (settings.voiceNavigation) {
      Speech.speak(`${gesture.name} gesture. ${gesture.description}. ${gesture.instruction}`, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
      });
    }
  };

  const startPractice = () => {
    setTrainingMode('practice');
    setCurrentStatus('listening');
    setStatusMessage('Practice mode - try the gesture');
    
    if (settings.voiceNavigation) {
      Speech.speak(`Practice mode. Try making the ${currentGesture.name} gesture`, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
      });
    }
  };

  const startTest = () => {
    setTrainingMode('test');
    setCurrentStatus('listening');
    setStatusMessage('Test mode - random gestures will appear');
    
    if (settings.voiceNavigation) {
      Speech.speak('Test mode. Random gestures will appear. Try to recognize them', {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
      });
    }
  };

  // Start sequence training
  const startSequenceTraining = (sequence) => {
    setCurrentSequence(sequence);
    setTrainingMode('sequence');
    setCurrentStatus('listening');
    setStatusMessage(`Sequence training: ${sequence.name}`);
    
    if (settings.voiceNavigation) {
      Speech.speak(`Sequence training mode. ${sequence.description}`, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
      });
    }
  };

  // Get accuracy color based on percentage
  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return colors.success;
    if (accuracy >= 70) return colors.warning;
    return colors.error;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Beautiful Header */}
      <GestureHeader />
      
      {/* Status Indicator */}
      <StatusIndicator
        status={isDetecting ? 'listening' : currentStatus}
        message={statusMessage}
        announceVoice={false}
      />
      
      {/* Progress Bar */}
      <GestureProgressBar progressAnim={progressAnim} isDetecting={isDetecting} />

      {/* Training Mode Selector */}
      <TrainingModeSelector 
        trainingMode={trainingMode} 
        setTrainingMode={setTrainingMode} 
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Feedback Visualization */}
        <GestureFeedback feedbackVisualization={feedbackVisualization} />
        
        {/* Selected Gesture Details */}
        <GestureDetails 
          currentGesture={currentGesture}
          accuracyMetrics={accuracyMetrics}
          trainingMode={trainingMode}
          onStartPractice={startPractice}
          onStartTest={startTest}
          getAccuracyColor={getAccuracyColor}
        />
        
        {/* Gesture List */}
        <GestureList 
          gestures={gestures}
          onSelectGesture={selectGesture}
          gestureProgress={gestureProgress}
          currentGesture={currentGesture}
        />
        
        {/* Gesture Sequence Training */}
        <SequenceTraining 
          sequences={gestureSequences}
          onStartSequence={startSequenceTraining}
          currentSequence={currentSequence}
        />
        
        {/* Personalized Recommendations */}
        <Recommendations recommendations={recommendations} />
        
        {/* Practice Statistics */}
        <ProgressStats 
          gestureProgress={gestureProgress}
          accuracyMetrics={accuracyMetrics}
          gestures={gestures}
          getAccuracyColor={getAccuracyColor}
        />
        
        {/* Last Detected Gesture */}
        <LastDetected lastDetectedGesture={lastDetectedGesture} />
        
        {/* Action Buttons */}
        <DetectionControls 
          isDetecting={isDetecting}
          onStartDetection={startGestureDetection}
          onNavigateBack={() => navigation.navigate('Dashboard')}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});

export default GestureTrainingScreen;