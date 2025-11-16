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
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Load gesture data
    loadGestureData();
  }, []);

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
        {/* Beautiful Header with Gradient */}
        <LinearGradient
          colors={[colors.primary, colors.primary + 'E6', colors.primary + 'CC']}
          style={styles.header}
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
            <Text style={styles.headerTitle}>👋 Gesture Training</Text>
            <Text style={styles.headerSubtitle}>Master hand gestures with AI precision</Text>

            {/* Compact Stats Row */}
            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{getTrainingStats().masteredGestures}</Text>
                <Text style={styles.statText}>Mastered</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{progress}%</Text>
                <Text style={styles.statText}>Progress</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{getTrainingStats().averageAccuracy}%</Text>
                <Text style={styles.statText}>Accuracy</Text>
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

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Mode Selector */}
          <View style={[styles.modeContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.modeSelector}>
              <ModeButton mode="learn" label="Learn" isActive={trainingMode === 'learn'} />
              <ModeButton mode="practice" label="Practice" isActive={trainingMode === 'practice'} />
              <ModeButton mode="test" label="Test" isActive={trainingMode === 'test'} />
            </View>
          </View>

          {/* Detection Area */}
          <View style={[styles.detectionArea, { backgroundColor: colors.surface }]}>
            <View style={styles.detectionHeader}>
              <Text style={[styles.detectionTitle, { color: colors.text }]}>Detection Zone</Text>
              <View style={[styles.statusBadge, { 
                backgroundColor: isDetecting ? colors.warning + '20' : colors.success + '20',
                borderColor: isDetecting ? colors.warning : colors.success
              }]}>
                <Text style={[styles.statusBadgeText, { 
                  color: isDetecting ? colors.warning : colors.success 
                }]}>
                  {isDetecting ? 'Detecting...' : 'Ready'}
                </Text>
              </View>
            </View>
            
            <View style={[styles.detectionZone, { borderColor: colors.border }]}>
              {lastDetectedGesture ? (
                <View style={styles.detectedGesture}>
                  <Text style={styles.gestureEmoji}>{lastDetectedGesture.emoji}</Text>
                  <Text style={[styles.gestureName, { color: colors.text }]}>{lastDetectedGesture.name}</Text>
                  <View style={[styles.confidenceBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.confidenceText, { color: colors.primary }]}>
                      {lastDetectedGesture.confidence}% confidence
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyDetection}>
                  <Text style={styles.handIcon}>👋</Text>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Show your hand gesture</Text>
                  <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Position your hand in front of the camera</Text>
                </View>
              )}
            </View>
            
            {/* Feedback */}
            {feedback && (
              <View style={[styles.feedbackContainer, {
                backgroundColor: feedback.type === 'correct' ? colors.success + '15' : 
                                feedback.type === 'warning' ? colors.warning + '15' : colors.error + '15',
                borderColor: feedback.type === 'correct' ? colors.success : 
                            feedback.type === 'warning' ? colors.warning : colors.error
              }]}>
                <Text style={styles.feedbackEmoji}>
                  {feedback.type === 'correct' ? '✅' : feedback.type === 'warning' ? '⚠️' : '❌'}
                </Text>
                <Text style={[styles.feedbackText, {
                  color: feedback.type === 'correct' ? colors.success : 
                         feedback.type === 'warning' ? colors.warning : colors.error
                }]}>
                  {feedback.message}
                </Text>
              </View>
            )}
          </View>

          {/* Quick Practice */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Practice</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.practiceScrollContent}>
              {gestureList.slice(0, 4).map((gesture, index) => (
                <TouchableOpacity key={gesture.id || index} style={[styles.practiceCard, { backgroundColor: colors.surface }]}>
                  <Text style={styles.practiceEmoji}>{gesture.emoji}</Text>
                  <Text style={[styles.practiceName, { color: colors.text }]}>{gesture.name}</Text>
                  <View style={[styles.practiceProgress, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.practiceProgressText, { color: colors.primary }]}>
                      {getGestureStats(gesture.id).attempts > 0 ? 
                        `${Math.round((getGestureStats(gesture.id).successes / getGestureStats(gesture.id).attempts) * 100)}%` : 
                        'New'
                      }
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Gesture Library */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Gesture Library</Text>
            <View style={styles.gestureGrid}>
              {gestureList.map((gesture, index) => {
                const stats = getGestureStats(gesture.id);
                const successRate = stats.attempts > 0 ? Math.round((stats.successes / stats.attempts) * 100) : 0;
                const isMastered = stats.successes >= 5 && stats.averageConfidence >= 80;
                
                return (
                  <TouchableOpacity key={gesture.id || index} style={[styles.gestureCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.gestureCardHeader}>
                      <View style={[styles.gestureAvatar, { backgroundColor: colors.primary + '15' }]}>
                        <Text style={styles.gestureCardEmoji}>{gesture.emoji}</Text>
                      </View>
                      {isMastered && (
                        <View style={[styles.masteredBadge, { backgroundColor: colors.success }]}>
                          <Text style={styles.masteredText}>✓</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.gestureCardName, { color: colors.text }]}>{gesture.name}</Text>
                    <Text style={[styles.gestureCardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                      {gesture.description}
                    </Text>
                    <View style={styles.gestureCardFooter}>
                      <View style={[styles.difficultyChip, {
                        backgroundColor: gesture.difficulty === 'Easy' ? colors.success + '20' :
                                        gesture.difficulty === 'Medium' ? colors.warning + '20' : colors.error + '20'
                      }]}>
                        <Text style={[styles.difficultyChipText, {
                          color: gesture.difficulty === 'Easy' ? colors.success :
                                gesture.difficulty === 'Medium' ? colors.warning : colors.error
                        }]}>
                          {gesture.difficulty}
                        </Text>
                      </View>
                      {stats.attempts > 0 && (
                        <Text style={[styles.gestureStats, { color: colors.textSecondary }]}>
                          {successRate}%
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Progress Overview */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Progress</Text>
            <View style={styles.progressOverview}>
              <View style={[styles.progressCard, { backgroundColor: colors.surface }]}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Overall Progress</Text>
                  <Text style={[styles.progressValue, { color: colors.primary }]}>{progress}%</Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <LinearGradient
                    colors={[colors.primary, colors.primary + 'CC']}
                    style={[styles.progressFill, { width: `${progress}%` }]}
                  />
                </View>
              </View>
              
              <View style={styles.statsRow}>
                <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.statBoxNumber, { color: colors.text }]}>{getTrainingStats().totalAttempts}</Text>
                  <Text style={[styles.statBoxLabel, { color: colors.textSecondary }]}>Attempts</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.statBoxNumber, { color: colors.text }]}>{getTrainingStats().successRate}%</Text>
                  <Text style={[styles.statBoxLabel, { color: colors.textSecondary }]}>Success Rate</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.statBoxNumber, { color: colors.text }]}>{getTrainingStats().masteredGestures}</Text>
                  <Text style={[styles.statBoxLabel, { color: colors.textSecondary }]}>Mastered</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Modern Action Bar */}
        <View style={[styles.actionBar, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.actionBtnText, { color: colors.text }]}>← Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.primaryActionBtn, { opacity: isDetecting ? 0.7 : 1 }]}
            onPress={startGestureDetection}
            disabled={isDetecting}
          >
            <LinearGradient
              colors={[colors.primary, colors.primary + 'E6']}
              style={styles.primaryActionGradient}
            >
              {isDetecting ? (
                <>
                  <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryActionText}>Detecting...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.primaryActionText}>👋 Start Detection</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header Styles
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 16,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  statText: {
    fontSize: 9,
    color: 'white',
    opacity: 0.8,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 10,
  },
  errorBanner: {
    margin: 12,
    padding: 10,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  // Content Styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  section: {
    marginVertical: 12,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  // Mode Selector
  modeContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 6,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Detection Area
  detectionArea: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  detectionZone: {
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  detectedGesture: {
    alignItems: 'center',
  },
  gestureEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  gestureName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyDetection: {
    alignItems: 'center',
  },
  handIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 11,
    textAlign: 'center',
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  feedbackEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  feedbackText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  // Practice Cards
  practiceScrollContent: {
    paddingRight: 16,
  },
  practiceCard: {
    width: 100,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  practiceEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  practiceName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  practiceProgress: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  practiceProgressText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  // Gesture Grid
  gestureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gestureCard: {
    width: (width - 56) / 2,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gestureCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  gestureAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gestureCardEmoji: {
    fontSize: 18,
  },
  masteredBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  masteredText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  gestureCardName: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gestureCardDesc: {
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 8,
  },
  gestureCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyChipText: {
    fontSize: 9,
    fontWeight: '600',
  },
  gestureStats: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Progress Overview
  progressOverview: {
    gap: 12,
  },
  progressCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statBoxNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statBoxLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Action Bar
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  primaryActionBtn: {
    flex: 2,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  primaryActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default GestureTrainingScreen;