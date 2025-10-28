/**
 * Gesture Training Screen - Redesigned
 * Interactive gesture learning and practice interface with modern UI
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAccessibility } from '../components/AccessibilityProvider';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import apiService from '../api/services/apiService';

const { width, height } = Dimensions.get('window');

// Gesture data structure
const gestureData = [
  {
    id: 'open_hand',
    name: 'Open Hand',
    description: 'Start listening for voice commands',
    emoji: '✋',
    category: 'basic',
    difficulty: 'Easy',
    accuracy: 95,
  },
  {
    id: 'fist',
    name: 'Fist',
    description: 'Stop voice recognition',
    emoji: '✊',
    category: 'basic',
    difficulty: 'Easy',
    accuracy: 88,
  },
  {
    id: 'two_fingers',
    name: 'Two Fingers',
    description: 'Emergency trigger',
    emoji: '✌️',
    category: 'emergency',
    difficulty: 'Medium',
    accuracy: 92,
  },
  {
    id: 'thumbs_up',
    name: 'Thumbs Up',
    description: 'Yes/Confirm',
    emoji: '👍',
    category: 'basic',
    difficulty: 'Easy',
    accuracy: 90,
  },
  {
    id: 'thumbs_down',
    name: 'Thumbs Down',
    description: 'No/Cancel',
    emoji: '👎',
    category: 'basic',
    difficulty: 'Easy',
    accuracy: 85,
  },
  {
    id: 'pointing',
    name: 'Pointing',
    description: 'Direction/Selection',
    emoji: '👆',
    category: 'navigation',
    difficulty: 'Medium',
    accuracy: 87,
  },
  {
    id: 'wave',
    name: 'Wave',
    description: 'Hello/Goodbye',
    emoji: '👋',
    category: 'social',
    difficulty: 'Easy',
    accuracy: 98,
  },
  {
    id: 'stop_gesture',
    name: 'Stop Gesture',
    description: 'Halt current action',
    emoji: '🛑',
    category: 'control',
    difficulty: 'Hard',
    accuracy: 78,
  },
];

// Gesture sequences for advanced training
const gestureSequences = [
  {
    id: 'greeting_sequence',
    name: 'Greeting Sequence',
    description: 'Wave followed by thumbs up',
    sequence: ['wave', 'thumbs_up'],
    difficulty: 'Easy',
  },
  {
    id: 'emergency_sequence',
    name: 'Emergency Sequence',
    description: 'Open hand followed by two fingers',
    sequence: ['open_hand', 'two_fingers'],
    difficulty: 'Medium',
  },
  {
    id: 'navigation_sequence',
    name: 'Navigation Sequence',
    description: 'Pointing followed by open hand',
    sequence: ['pointing', 'open_hand'],
    difficulty: 'Medium',
  },
  {
    id: 'control_sequence',
    name: 'Control Sequence',
    description: 'Stop gesture followed by fist',
    sequence: ['stop_gesture', 'fist'],
    difficulty: 'Hard',
  },
];

const GestureTrainingScreen = ({ navigation }) => {
  const { settings, getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  
  const [trainingMode, setTrainingMode] = useState('learn'); // learn, practice, test
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastDetectedGesture, setLastDetectedGesture] = useState(null);
  const [progress, setProgress] = useState(75); // Sample progress
  const [feedback, setFeedback] = useState(null); // { type: 'correct' | 'incorrect', message: string }
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [gestureVocabulary, setGestureVocabulary] = useState({});
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Load gesture vocabulary and status from API
  useEffect(() => {
    loadGestureData();
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadGestureData = async () => {
    setIsLoading(true);
    try {
      // Load gesture vocabulary
      const vocabularyData = await apiService.getGestureVocabulary();
      setGestureVocabulary(vocabularyData.gestures || {});
      setApiError(null);
    } catch (error) {
      console.warn('Failed to load gesture data:', error.message);
      setApiError('Backend not available - using mock data');
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate gesture detection
  const startGestureDetection = async () => {
    setIsDetecting(true);
    setFeedback(null);
    
    // Simulate API call to backend
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Randomly select a gesture for demo
      const randomGesture = gestureData[Math.floor(Math.random() * gestureData.length)];
      const isCorrect = Math.random() > 0.3; // 70% chance of correct detection
      
      setLastDetectedGesture({
        ...randomGesture,
        confidence: Math.floor(Math.random() * 40) + 60, // 60-99%
        timestamp: new Date().toISOString(),
      });
      
      // Set feedback
      if (isCorrect) {
        setFeedback({
          type: 'correct',
          message: `You performed '${randomGesture.name}' perfectly.`,
        });
      } else {
        setFeedback({
          type: 'incorrect',
          message: `Let's give '${randomGesture.name}' another shot.`,
        });
      }
      
    } catch (error) {
      console.error('Detection failed:', error);
      setFeedback({
        type: 'incorrect',
        message: 'Detection failed. Please try again.',
      });
    } finally {
      setIsDetecting(false);
    }
  };

  // Training mode selector buttons
  const ModeButton = ({ mode, label, isActive }) => (
    <TouchableOpacity
      style={[
        styles.modeButton,
        isActive && styles.activeModeButton,
        { backgroundColor: isActive ? colors.primary : colors.surface }
      ]}
      onPress={() => setTrainingMode(mode)}
    >
      <Text style={[
        styles.modeButtonText,
        { color: isActive ? '#FFFFFF' : colors.text }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Feedback card component
  const FeedbackCard = ({ type, message }) => {
    if (!type) return null;
    
    const isCorrect = type === 'correct';
    const backgroundColor = isCorrect ? '#D1FAE5' : '#FEE2E2';
    const borderColor = isCorrect ? '#10B981' : '#EF4444';
    const emoji = isCorrect ? '✅' : '❌';
    const title = isCorrect ? 'Correct!' : 'Try Again!';
    const textColor = isCorrect ? '#065F46' : '#991B1B';
    
    return (
      <View style={[styles.feedbackCard, { backgroundColor, borderColor }]}>
        <Text style={styles.feedbackEmoji}>{emoji}</Text>
        <View style={styles.feedbackContent}>
          <Text style={[styles.feedbackTitle, { color: textColor }]}>{title}</Text>
          <Text style={[styles.feedbackMessage, { color: textColor }]}>{message}</Text>
        </View>
      </View>
    );
  };

  // Progress bar component
  const ProgressBar = ({ progress }) => (
    <View style={styles.progressBarContainer}>
      <View 
        style={[styles.progressBarInner, { width: `${progress}%`, backgroundColor: colors.primary }]} 
      />
    </View>
  );

  // Gesture library item
  const GestureItem = ({ gesture }) => (
    <View style={[styles.gestureItem, { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }]}>
      <View style={[styles.gestureIcon, { backgroundColor: colors.surface }]}>
        <Text style={[styles.gestureEmoji, { color: colors.primary }]}>{gesture.emoji}</Text>
      </View>
      <View style={styles.gestureInfo}>
        <Text style={styles.gestureName}>{gesture.name}</Text>
        <Text style={styles.gestureDescription}>{gesture.description}</Text>
      </View>
      <View style={[styles.difficultyBadge, { 
        backgroundColor: gesture.difficulty === 'Easy' ? '#D1FAE5' : 
                       gesture.difficulty === 'Medium' ? '#FFEED2' : '#FEE2E2'
      }]}>
        <Text style={[styles.difficultyText, {
          color: gesture.difficulty === 'Easy' ? '#065F46' : 
                 gesture.difficulty === 'Medium' ? '#92400E' : '#991B1B'
        }]}>
          {gesture.difficulty}
        </Text>
      </View>
    </View>
  );

  // Recommendation item
  const RecommendationItem = ({ gesture }) => (
    <View style={[styles.recommendationItem, { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }]}>
      <Text style={styles.recommendationEmoji}>{gesture.emoji}</Text>
      <Text style={styles.recommendationName}>{gesture.name}</Text>
      <Text style={styles.recommendationCategory}>{gesture.category}</Text>
    </View>
  );

  // Stats card
  const StatsCard = ({ title, value, total, label }) => (
    <View style={[styles.statsCard, { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }]}>
      <Text style={styles.statsLabel}>{label}</Text>
      <Text style={styles.statsValue}>{value} <Text style={styles.statsTotal}>/ {total}</Text></Text>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Modern Compact Header */}
        <LinearGradient
          colors={[colors.primary, colors.primary + 'DD', colors.primary + '99']}
          style={styles.compactHeader}
        >
          <Animated.View 
            style={[
              styles.headerContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.headerTitle}>✋ Gesture Training</Text>
            <Text style={styles.headerSubtitle}>Master your moves with precision</Text>
            
            {/* Quick Stats */}
            <View style={styles.quickStats}>
              <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Mastered</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.statNumber}>{progress}%</Text>
                <Text style={styles.statLabel}>Progress</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.statNumber}>92%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Error Banner */}
        {apiError && (
          <View style={[styles.errorBanner, { backgroundColor: colors.warning }]}>
            <Text style={[styles.errorText, { color: 'white' }]}>⚠️ {apiError}</Text>
          </View>
        )}

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Mode & Status Section */}
          <View style={styles.section}>
            <View style={[styles.modeSelector, { backgroundColor: colors.surface }]}>
              <ModeButton mode="learn" label="Learn" isActive={trainingMode === 'learn'} />
              <ModeButton mode="practice" label="Practice" isActive={trainingMode === 'practice'} />
              <ModeButton mode="test" label="Test" isActive={trainingMode === 'test'} />
            </View>

            <View style={[styles.statusIndicator, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statusText, { color: colors.primary }]}>
                {trainingMode.toUpperCase()} MODE
              </Text>
            </View>
          </View>

        {/* Detection & Feedback Section */}
        <View style={styles.section}>
          {/* Last Detected Gesture */}
          <View style={[styles.lastDetectedCard, { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }]}>
            <Text style={styles.lastDetectedLabel}>Last Detected Gesture</Text>
            {lastDetectedGesture ? (
              <>
                <Text style={styles.lastDetectedName}>{lastDetectedGesture.name}</Text>
                <View style={[styles.accuracyBadge, { backgroundColor: '#D1FAE5' }]}>
                  <Text style={styles.accuracyText}>Accuracy: {lastDetectedGesture.confidence}%</Text>
                </View>
              </>
            ) : (
              <Text style={styles.noGestureText}>No gesture detected yet</Text>
            )}
          </View>

          {/* Feedback Cards */}
          <FeedbackCard type={feedback?.type} message={feedback?.message} />

          {/* Progress Bar */}
          <ProgressBar progress={progress} />
        </View>

        {/* Recommendations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>For You to Practice</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendationsContainer}>
            {gestureData.slice(0, 3).map((gesture, index) => (
              <RecommendationItem key={index} gesture={gesture} />
            ))}
          </ScrollView>
        </View>

        {/* Gesture Library Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gesture Library</Text>
          <View style={styles.gestureLibrary}>
            {gestureData.map((gesture, index) => (
              <GestureItem key={index} gesture={gesture} />
            ))}
          </View>
        </View>

        {/* Progress Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsContainer}>
            <StatsCard label="Gestures Mastered" value="12" total="50" />
            <StatsCard label="Avg. Accuracy" value="92" total="%" />
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons Footer */}
      <View style={[styles.footer, { backgroundColor: 'rgba(255, 255, 255, 0.8)' }]}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.backButton, { backgroundColor: '#E5E7EB', paddingVertical: 10, paddingHorizontal: 14 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.buttonText, { color: '#4B5563', fontSize: 13, fontWeight: '600' }]}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.startButton, { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 14 }]}
            onPress={startGestureDetection}
            disabled={isDetecting}
          >
            {isDetecting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={[styles.buttonText, { color: '#FFFFFF', fontSize: 13, fontWeight: '600' }]}>Start Detection →</Text>
         
          )}
        </TouchableOpacity>
      </View>
    </View>
  </SafeAreaView>
</>

);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  compactHeader: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  headerContent: {
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 16,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
  },
  statCard: {
    padding: 12,
    borderRadius: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
    color: 'white',
    opacity: 0.8,
  },
  errorBanner: {
    margin: 12,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 8,
    padding: 4,
    borderRadius: 12,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeModeButton: {
    // backgroundColor will be set dynamically
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusIndicator: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lastDetectedCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  lastDetectedLabel: {
    color: '#4B5563',
    fontSize: 14,
  },
  lastDetectedName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  noGestureText: {
    color: '#6B7280',
    fontStyle: 'italic',
  },
  accuracyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: '#D1FAE5',
  },
  accuracyText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '500',
  },
  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  feedbackEmoji: {
    fontSize: 24,
  },
  feedbackContent: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackMessage: {
    fontSize: 14,
    marginTop: 2,
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 9999,
  },
  progressBarInner: {
    height: '100%',
    borderRadius: 9999,
  },
  recommendationsContainer: {
    flexDirection: 'row',
  },
  recommendationItem: {
    flexShrink: 0,
    width: 160,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
  },
  recommendationEmoji: {
    fontSize: 24,
  },
  recommendationName: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    color: '#111827',
  },
  recommendationCategory: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 4,
  },
  gestureLibrary: {
    gap: 12,
  },
  gestureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  gestureIcon: {
    padding: 12,
    borderRadius: 8,
  },
  gestureEmoji: {
    fontSize: 20,
  },
  gestureInfo: {
    flex: 1,
    marginLeft: 12,
  },
  gestureName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  gestureDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 2,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
  },
  statsLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  statsTotal: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButton: {
    // backgroundColor will be set dynamically
  },
  startButton: {
    // backgroundColor will be set dynamically
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default GestureTrainingScreen;