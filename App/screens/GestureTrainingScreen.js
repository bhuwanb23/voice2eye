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
import AccessibleButton from '../components/AccessibleButton';
import StatusIndicator from '../components/StatusIndicator';
import * as Speech from 'expo-speech';

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
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const gestures = [
    {
      id: 'open_hand',
      name: 'Open Hand',
      description: 'Start listening for voice commands',
      emoji: '✋',
      instruction: 'Hold your hand open with all fingers extended',
      practiceCount: 0,
    },
    {
      id: 'fist',
      name: 'Fist',
      description: 'Stop voice recognition',
      emoji: '✊',
      instruction: 'Make a fist with all fingers closed',
      practiceCount: 0,
    },
    {
      id: 'two_fingers',
      name: 'Two Fingers',
      description: 'Emergency trigger',
      emoji: '✌️',
      instruction: 'Extend your index and middle finger',
      practiceCount: 0,
    },
    {
      id: 'thumbs_up',
      name: 'Thumbs Up',
      description: 'Yes/Confirm',
      emoji: '👍',
      instruction: 'Extend your thumb upward',
      practiceCount: 0,
    },
    {
      id: 'thumbs_down',
      name: 'Thumbs Down',
      description: 'No/Cancel',
      emoji: '👎',
      instruction: 'Extend your thumb downward',
      practiceCount: 0,
    },
    {
      id: 'pointing',
      name: 'Pointing',
      description: 'Direction/Selection',
      emoji: '👆',
      instruction: 'Point with your index finger',
      practiceCount: 0,
    },
    {
      id: 'wave',
      name: 'Wave',
      description: 'Hello/Goodbye',
      emoji: '👋',
      instruction: 'Wave your hand from side to side',
      practiceCount: 0,
    },
    {
      id: 'stop_gesture',
      name: 'Stop Gesture',
      description: 'Halt current action',
      emoji: '🛑',
      instruction: 'Hold your hand up with palm facing forward',
      practiceCount: 0,
    },
  ];

  useEffect(() => {
    if (settings.voiceNavigation) {
      announceScreenEntry();
    }
  }, []);

  const announceScreenEntry = () => {
    const message = `Gesture training screen. ${gestures.length} gestures available. Choose a gesture to learn or practice.`;
    Speech.speak(message, {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
    });
  };

  const startGestureDetection = () => {
    setIsDetecting(true);
    setCurrentStatus('listening');
    setStatusMessage('Detecting gestures...');
    
    // Simulate gesture detection
    setTimeout(() => {
      const randomGesture = gestures[Math.floor(Math.random() * gestures.length)];
      setLastDetectedGesture(randomGesture);
      setIsDetecting(false);
      setCurrentStatus('idle');
      setStatusMessage(`Detected: ${randomGesture.name}`);
      
      // Update practice count
      setGestureProgress(prev => ({
        ...prev,
        [randomGesture.id]: (prev[randomGesture.id] || 0) + 1,
      }));
      
      // Provide feedback
      if (settings.voiceNavigation) {
        Speech.speak(`Detected ${randomGesture.name} gesture`, {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
      }
      
      if (settings.hapticFeedback) {
        Vibration.vibrate(100);
      }
    }, 2000);
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

  const getGestureCardStyle = (gesture) => {
    const isSelected = currentGesture?.id === gesture.id;
    const practiceCount = gestureProgress[gesture.id] || 0;
    
    return [
      styles.gestureCard,
      {
        backgroundColor: isSelected ? colors.primary : colors.surface,
        borderColor: isSelected ? colors.secondary : colors.border,
        borderWidth: isSelected ? 2 : 1,
      },
    ];
  };

  const getGestureTextStyle = (gesture) => {
    const isSelected = currentGesture?.id === gesture.id;
    return [
      styles.gestureName,
      {
        color: isSelected ? 'white' : colors.text,
      },
    ];
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={[styles.title, { color: 'white' }]}>
          Gesture Training
        </Text>
        <Text style={[styles.subtitle, { color: 'white' }]}>
          Learn and practice hand gestures
        </Text>
      </View>

      {/* Status Indicator */}
      <StatusIndicator
        status={isDetecting ? 'listening' : 'idle'}
        message={isDetecting ? 'Detecting gestures...' : 'Ready for training'}
        announceVoice={false}
      />

      {/* Training Mode Selector */}
      <View style={styles.modeSelector}>
        <AccessibleButton
          title="Learn"
          onPress={() => setTrainingMode('learn')}
          variant={trainingMode === 'learn' ? 'primary' : 'outline'}
          size="medium"
          accessibilityLabel="Switch to learn mode"
        />
        <AccessibleButton
          title="Practice"
          onPress={() => setTrainingMode('practice')}
          variant={trainingMode === 'practice' ? 'primary' : 'outline'}
          size="medium"
          accessibilityLabel="Switch to practice mode"
        />
        <AccessibleButton
          title="Test"
          onPress={() => setTrainingMode('test')}
          variant={trainingMode === 'test' ? 'primary' : 'outline'}
          size="medium"
          accessibilityLabel="Switch to test mode"
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Selected Gesture Details */}
        {currentGesture && (
          <View style={[styles.gestureDetails, { backgroundColor: colors.surface }]}>
            <Text style={[styles.gestureEmoji, { fontSize: 64 }]}>
              {currentGesture.emoji}
            </Text>
            <Text style={[styles.gestureTitle, { color: colors.text }]}>
              {currentGesture.name}
            </Text>
            <Text style={[styles.gestureDescription, { color: colors.textSecondary }]}>
              {currentGesture.description}
            </Text>
            <Text style={[styles.gestureInstruction, { color: colors.text }]}>
              {currentGesture.instruction}
            </Text>
            
            {trainingMode === 'practice' && (
              <AccessibleButton
                title="Start Practice"
                onPress={startPractice}
                variant="primary"
                size="large"
                accessibilityLabel="Start practicing this gesture"
                style={styles.practiceButton}
              />
            )}
            
            {trainingMode === 'test' && (
              <AccessibleButton
                title="Start Test"
                onPress={startTest}
                variant="accent"
                size="large"
                accessibilityLabel="Start testing this gesture"
                style={styles.testButton}
              />
            )}
          </View>
        )}

        {/* Gesture List */}
        <View style={styles.gestureList}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Available Gestures
          </Text>
          
          {gestures.map((gesture) => (
            <AccessibleButton
              key={gesture.id}
              title={`${gesture.emoji} ${gesture.name}`}
              onPress={() => selectGesture(gesture)}
              variant="outline"
              size="medium"
              accessibilityLabel={`${gesture.name} gesture. ${gesture.description}`}
              accessibilityHint="Tap to select this gesture for learning"
              style={getGestureCardStyle(gesture)}
              textStyle={getGestureTextStyle(gesture)}
            />
          ))}
        </View>

        {/* Practice Statistics */}
        {Object.keys(gestureProgress).length > 0 && (
          <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statsTitle, { color: colors.text }]}>
              Practice Statistics
            </Text>
            {Object.entries(gestureProgress).map(([gestureId, count]) => {
              const gesture = gestures.find(g => g.id === gestureId);
              return (
                <View key={gestureId} style={styles.statItem}>
                  <Text style={[styles.statGesture, { color: colors.text }]}>
                    {gesture?.emoji} {gesture?.name}
                  </Text>
                  <Text style={[styles.statCount, { color: colors.primary }]}>
                    {count} times
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Last Detected Gesture */}
        {lastDetectedGesture && (
          <View style={[styles.lastDetected, { backgroundColor: colors.success }]}>
            <Text style={styles.lastDetectedTitle}>
              Last Detected Gesture
            </Text>
            <Text style={styles.lastDetectedGesture}>
              {lastDetectedGesture.emoji} {lastDetectedGesture.name}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <AccessibleButton
            title="Start Detection"
            onPress={startGestureDetection}
            variant="primary"
            size="large"
            disabled={isDetecting}
            accessibilityLabel="Start gesture detection"
            style={styles.actionButton}
          />
          
          <AccessibleButton
            title="Back to Dashboard"
            onPress={() => navigation.navigate('Dashboard')}
            variant="outline"
            size="large"
            accessibilityLabel="Return to main dashboard"
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.9,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  gestureDetails: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  gestureEmoji: {
    marginBottom: 16,
  },
  gestureTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  gestureDescription: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  gestureInstruction: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  practiceButton: {
    marginTop: 10,
  },
  testButton: {
    marginTop: 10,
  },
  gestureList: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  gestureCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  gestureName: {
    fontSize: 18,
    fontWeight: '600',
  },
  statsContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statGesture: {
    fontSize: 16,
  },
  statCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastDetected: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  lastDetectedTitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
  },
  lastDetectedGesture: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  actionsContainer: {
    padding: 16,
    marginBottom: 20,
  },
  actionButton: {
    marginBottom: 12,
  },
});

export default GestureTrainingScreen;
