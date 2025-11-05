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

// Gesture data structure - will be populated from backend
const gestureData = [];

// Gesture sequences for advanced training - will be populated from backend
const gestureSequences = [];

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
  const [gestureList, setGestureList] = useState([]);
  const [gestureProgress, setGestureProgress] = useState({}); // Track progress for each gesture
  const [trainingHistory, setTrainingHistory] = useState([]); // Track training history

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Load gesture data and progress
  const loadGestureData = async () => {
    setIsLoading(true);
    try {
      // Load gesture vocabulary
      const vocabularyData = await apiService.getGestureVocabulary();

      if (vocabularyData && vocabularyData.gestures) {
        setGestureVocabulary(vocabularyData.gestures);

        // Convert vocabulary to gesture list format
        const gestures = Object.keys(vocabularyData.gestures).map(key => {
          const gesture = vocabularyData.gestures[key];
          return {
            id: key,
            name: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: gesture.description,
            emoji: getGestureEmoji(key),
            category: gesture.emergency ? 'emergency' : 'basic',
            difficulty: getDifficultyFromThreshold(gesture.confidence_threshold),
            accuracy: Math.round(gesture.confidence_threshold * 100),
            confidence_threshold: gesture.confidence_threshold,
            finger_count: gesture.finger_count,
            hold_time: gesture.hold_time
          };
        });

        setGestureList(gestures);
        setApiError(null);
      } else {
        // Fallback to mock data
        setGestureList(getMockGestureData());
        setApiError('No gesture data received from backend');
      }

      // Load progress data from AsyncStorage
      await loadProgressData();
    } catch (error) {
      console.warn('Failed to load gesture data:', error.message);
      setGestureList(getMockGestureData());
      setApiError('Backend not available - using mock data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load progress data from AsyncStorage
  const loadProgressData = async () => {
    try {
      const progressData = await AsyncStorage.getItem('gesture_training_progress');
      if (progressData) {
        const parsedData = JSON.parse(progressData);
        setGestureProgress(parsedData);
      }

      const historyData = await AsyncStorage.getItem('gesture_training_history');
      if (historyData) {
        const parsedHistory = JSON.parse(historyData);
        setTrainingHistory(parsedHistory);
      }
    } catch (error) {
      console.warn('Failed to load progress data:', error.message);
    }
  };

  // Save progress data to AsyncStorage
  const saveProgressData = async (progress, history) => {
    try {
      await AsyncStorage.setItem('gesture_training_progress', JSON.stringify(progress));
      await AsyncStorage.setItem('gesture_training_history', JSON.stringify(history));
    } catch (error) {
      console.warn('Failed to save progress data:', error.message);
    }
  };

  // Update gesture progress
  const updateGestureProgress = async (gestureId, success, confidence) => {
    const newProgress = {
      ...gestureProgress,
      [gestureId]: {
        attempts: (gestureProgress[gestureId]?.attempts || 0) + 1,
        successes: (gestureProgress[gestureId]?.successes || 0) + (success ? 1 : 0),
        lastAttempt: new Date().toISOString(),
        bestConfidence: Math.max(gestureProgress[gestureId]?.bestConfidence || 0, confidence || 0),
        averageConfidence: calculateAverageConfidence(gestureId, confidence)
      }
    };

    const newHistoryItem = {
      id: Date.now(),
      gestureId,
      success,
      confidence,
      timestamp: new Date().toISOString()
    };

    const newHistory = [newHistoryItem, ...trainingHistory.slice(0, 49)]; // Keep last 50 entries

    setGestureProgress(newProgress);
    setTrainingHistory(newHistory);

    // Save to AsyncStorage
    await saveProgressData(newProgress, newHistory);

    // Update overall progress
    updateOverallProgress(newProgress);
  };

  // Calculate average confidence for a gesture
  const calculateAverageConfidence = (gestureId, newConfidence) => {
    const progress = gestureProgress[gestureId];
    if (!progress) return newConfidence;

    const totalConfidence = (progress.averageConfidence * progress.attempts) + newConfidence;
    return totalConfidence / (progress.attempts + 1);
  };

  // Update overall progress percentage
  const updateOverallProgress = (progressData) => {
    if (!progressData) return;

    const gestureCount = Object.keys(progressData).length;
    if (gestureCount === 0) return;

    const masteredCount = Object.values(progressData).filter(
      p => p.successes >= 5 && p.averageConfidence >= 80
    ).length;

    const newProgress = Math.round((masteredCount / gestureCount) * 100);
    setProgress(newProgress);
  };

  // Get progress stats for a specific gesture
  const getGestureStats = (gestureId) => {
    return gestureProgress[gestureId] || {
      attempts: 0,
      successes: 0,
      lastAttempt: null,
      bestConfidence: 0,
      averageConfidence: 0
    };
  };

  // Get overall training stats
  const getTrainingStats = () => {
    const totalAttempts = Object.values(gestureProgress).reduce((sum, p) => sum + p.attempts, 0);
    const totalSuccesses = Object.values(gestureProgress).reduce((sum, p) => sum + p.successes, 0);
    const averageAccuracy = trainingHistory.length > 0
      ? trainingHistory.reduce((sum, h) => sum + h.confidence, 0) / trainingHistory.length
      : 0;

    return {
      totalAttempts,
      totalSuccesses,
      successRate: totalAttempts > 0 ? Math.round((totalSuccesses / totalAttempts) * 100) : 0,
      averageAccuracy: Math.round(averageAccuracy),
      masteredGestures: Object.values(gestureProgress).filter(
        p => p.successes >= 5 && p.averageConfidence >= 80
      ).length
    };
  };

  // Helper function to get emoji for gesture
  const getGestureEmoji = (gestureId) => {
    const emojiMap = {
      'open_hand': '✋',
      'fist': '✊',
      'two_fingers': '✌️',
      'thumbs_up': '👍',
      'thumbs_down': '👎',
      'pointing': '👆',
      'wave': '👋',
      'stop_gesture': '🛑'
    };
    return emojiMap[gestureId] || '✋';
  };

  // Helper function to get difficulty from threshold
  const getDifficultyFromThreshold = (threshold) => {
    if (threshold >= 0.8) return 'Hard';
    if (threshold >= 0.6) return 'Medium';
    return 'Easy';
  };

  // Mock data for fallback
  const getMockGestureData = () => [
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

  // Simulate gesture detection with real API integration
  const startGestureDetection = async () => {
    setIsDetecting(true);
    setFeedback(null);

    try {
      // In a real implementation, this would connect to the camera
      // For now, we'll simulate with a mock result
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate API response
      const mockGestures = Object.keys(gestureVocabulary);
      if (mockGestures.length > 0) {
        const randomGestureId = mockGestures[Math.floor(Math.random() * mockGestures.length)];
        const gestureInfo = gestureVocabulary[randomGestureId];

        const result = {
          gesture_type: randomGestureId,
          confidence: Math.random() * 0.5 + 0.5, // 50-100% confidence
          is_emergency: gestureInfo?.emergency || false
        };

        const newGesture = {
          id: randomGestureId,
          name: randomGestureId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: gestureInfo?.description || '',
          emoji: getGestureEmoji(randomGestureId),
          category: result.is_emergency ? 'emergency' : 'basic',
          difficulty: getDifficultyFromThreshold(gestureInfo?.confidence_threshold || 0.7),
          confidence: Math.round(result.confidence * 100)
        };

        setLastDetectedGesture({
          ...newGesture,
          timestamp: new Date().toISOString(),
        });

        // Update progress
        await updateGestureProgress(randomGestureId, true, newGesture.confidence);

        // Set feedback based on confidence
        let feedbackType = 'incorrect';
        let feedbackMessage = '';

        if (newGesture.confidence >= 90) {
          feedbackType = 'correct';
          feedbackMessage = `Excellent! You performed '${newGesture.name}' perfectly.`;
        } else if (newGesture.confidence >= 70) {
          feedbackType = 'correct';
          feedbackMessage = `Good job! '${newGesture.name}' was detected with high confidence.`;
        } else if (newGesture.confidence >= 50) {
          feedbackType = 'warning';
          feedbackMessage = `Fair attempt at '${newGesture.name}'. Try to be more precise.`;
        } else {
          feedbackType = 'incorrect';
          feedbackMessage = `Let's give '${newGesture.name}' another shot. Focus on clear hand positioning.`;
        }

        setFeedback({
          type: feedbackType,
          message: feedbackMessage,
        });

        // Provide audio feedback
        if (settings.voiceNavigation) {
          Speech.speak(feedbackMessage, {
            rate: settings.speechRate,
            pitch: settings.speechPitch,
          });
        }

        // Provide haptic feedback
        if (settings.hapticFeedback) {
          if (feedbackType === 'correct') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else if (feedbackType === 'warning') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        }
      } else {
        throw new Error('No gesture vocabulary available');
      }
    } catch (error) {
      console.error('Detection failed:', error);
      setFeedback({
        type: 'incorrect',
        message: 'Detection failed. Please try again.',
      });

      // Provide error feedback
      if (settings.voiceNavigation) {
        Speech.speak('Gesture detection failed. Please try again.', {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
      }

      if (settings.hapticFeedback) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
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

  // Feedback card component with enhanced styling
  const FeedbackCard = ({ type, message }) => {
    if (!type) return null;

    const getFeedbackStyle = () => {
      switch (type) {
        case 'correct':
          return {
            backgroundColor: '#D1FAE5',
            borderColor: '#10B981',
            emoji: '✅',
            title: 'Correct!',
            textColor: '#065F46'
          };
        case 'warning':
          return {
            backgroundColor: '#FEF3C7',
            borderColor: '#D97706',
            emoji: '⚠️',
            title: 'Good Attempt!',
            textColor: '#92400E'
          };
        case 'incorrect':
        default:
          return {
            backgroundColor: '#FEE2E2',
            borderColor: '#EF4444',
            emoji: '❌',
            title: 'Try Again!',
            textColor: '#991B1B'
          };
      }
    };

    const style = getFeedbackStyle();

    return (
      <View style={[styles.feedbackCard, { backgroundColor: style.backgroundColor, borderColor: style.borderColor }]}>
        <Text style={styles.feedbackEmoji}>{style.emoji}</Text>
        <View style={styles.feedbackContent}>
          <Text style={[styles.feedbackTitle, { color: style.textColor }]}>{style.title}</Text>
          <Text style={[styles.feedbackMessage, { color: style.textColor }]}>{message}</Text>
        </View>
      </View>
    );
  };

  // Progress bar component with gradient
  const ProgressBar = ({ progress }) => (
    <View style={styles.progressBarContainer}>
      <View
        style={[styles.progressBarInner, { width: `${progress}%` }]}
      />
      <LinearGradient
        colors={['#4A90E2', '#50C878']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.progressBarInner, { width: `${progress}%` }]}
      />
    </View>
  );

  // Gesture item with progress indicator
  const GestureItem = ({ gesture }) => {
    const stats = getGestureStats(gesture.id);
    const successRate = stats.attempts > 0 ? Math.round((stats.successes / stats.attempts) * 100) : 0;

    return (
      <View style={[styles.gestureItem, { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }]}>
        <View style={[styles.gestureIcon, { backgroundColor: colors.surface }]}>
          <Text style={[styles.gestureEmoji, { color: colors.primary }]}>{gesture.emoji}</Text>
        </View>
        <View style={styles.gestureInfo}>
          <Text style={styles.gestureName}>{gesture.name}</Text>
          <Text style={styles.gestureDescription}>{gesture.description}</Text>
          {stats.attempts > 0 && (
            <Text style={styles.gestureProgress}>
              {stats.successes}/{stats.attempts} ({successRate}%)
            </Text>
          )}
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
  };

  // Recommendation item
  const RecommendationItem = ({ gesture }) => (
    <View style={[styles.recommendationItem, { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }]}>
      <Text style={styles.recommendationEmoji}>{gesture.emoji}</Text>
      <Text style={styles.recommendationName}>{gesture.name}</Text>
      <Text style={styles.recommendationCategory}>{gesture.category}</Text>
    </View>
  );

  // Stats card with enhanced styling
  const StatsCard = ({ label, value, total }) => {
    const trainingStats = getTrainingStats();
    let displayValue = value;
    let displayTotal = total;

    // Use actual stats if this is the stats card
    if (label === "Gestures Mastered") {
      displayValue = trainingStats.masteredGestures;
      displayTotal = Object.keys(gestureVocabulary).length || 50;
    } else if (label === "Avg. Accuracy") {
      displayValue = trainingStats.averageAccuracy;
      displayTotal = "%";
    }

    return (
      <View style={[styles.statsCard, { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }]}>
        <Text style={styles.statsLabel}>{label}</Text>
        <Text style={styles.statsValue}>
          {displayValue}
          {displayTotal !== "%" && <Text style={styles.statsTotal}>/ {displayTotal}</Text>}
          {displayTotal === "%" && <Text style={styles.statsTotal}>%</Text>}
        </Text>
      </View>
    );
  };

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
              {gestureList.slice(0, 3).map((gesture, index) => (
                <RecommendationItem key={gesture.id || index} gesture={gesture} />
              ))}
            </ScrollView>
          </View>

          {/* Gesture Library Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gesture Library</Text>
            <View style={styles.gestureLibrary}>
              {gestureList.map((gesture, index) => (
                <GestureItem key={gesture.id || index} gesture={gesture} />
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
  gestureProgress: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 4,
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