/**
 * Help & Tutorial Screen
 * Comprehensive guide for using VOICE2EYE features
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccessibility } from '../components/AccessibilityProvider';
import AccessibleButton from '../components/AccessibleButton';
import StatusIndicator from '../components/StatusIndicator';
import * as Speech from 'expo-speech';

const HelpScreen = ({ navigation }) => {
  const { settings, getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
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

    if (settings.voiceNavigation) {
      Speech.speak('Help and tutorial screen. Learn how to use VOICE2EYE features.', {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
      });
    }
  }, []);

  const helpSections = [
    { id: 'overview', title: 'Overview', icon: '🏠' },
    { id: 'gestures', title: 'Gestures', icon: '✋' },
    { id: 'voice', title: 'Voice Commands', icon: '🎤' },
    { id: 'emergency', title: 'Emergency', icon: '🚨' },
    { id: 'faq', title: 'FAQ', icon: '❓' },
  ];

  const gestureTutorials = [
    {
      id: 'open_hand',
      name: 'Open Hand',
      description: 'Start listening for voice commands',
      emoji: '✋',
      instruction: 'Hold your hand open with all fingers extended',
      usage: 'Use this gesture to activate voice recognition mode',
    },
    {
      id: 'fist',
      name: 'Fist',
      description: 'Stop voice recognition',
      emoji: '✊',
      instruction: 'Make a fist with all fingers closed',
      usage: 'Use this gesture to stop voice recognition',
    },
    {
      id: 'two_fingers',
      name: 'Two Fingers',
      description: 'Emergency trigger',
      emoji: '✌️',
      instruction: 'Extend your index and middle finger',
      usage: 'Use this gesture to trigger emergency mode',
    },
    {
      id: 'thumbs_up',
      name: 'Thumbs Up',
      description: 'Yes/Confirm',
      emoji: '👍',
      instruction: 'Extend your thumb upward',
      usage: 'Use this gesture to confirm actions or answer yes',
    },
    {
      id: 'thumbs_down',
      name: 'Thumbs Down',
      description: 'No/Cancel',
      emoji: '👎',
      instruction: 'Extend your thumb downward',
      usage: 'Use this gesture to cancel actions or answer no',
    },
    {
      id: 'pointing',
      name: 'Pointing',
      description: 'Direction/Selection',
      emoji: '👆',
      instruction: 'Point with your index finger',
      usage: 'Use this gesture to select items or indicate direction',
    },
    {
      id: 'wave',
      name: 'Wave',
      description: 'Hello/Goodbye',
      emoji: '👋',
      instruction: 'Wave your hand from side to side',
      usage: 'Use this gesture to greet or say goodbye',
    },
    {
      id: 'stop_gesture',
      name: 'Stop Gesture',
      description: 'Halt current action',
      emoji: '🛑',
      instruction: 'Hold your hand up with palm facing forward',
      usage: 'Use this gesture to stop current actions',
    },
  ];

  const voiceCommands = [
    {
      command: 'Help / Emergency',
      description: 'Trigger emergency mode',
      example: 'Say "Help" or "Emergency"',
    },
    {
      command: 'Settings',
      description: 'Open settings screen',
      example: 'Say "Open settings"',
    },
    {
      command: 'Contacts',
      description: 'Open contacts screen',
      example: 'Say "Show contacts"',
    },
    {
      command: 'Gestures',
      description: 'Open gesture training',
      example: 'Say "Start gesture training"',
    },
    {
      command: 'Camera',
      description: 'Open camera view',
      example: 'Say "Open camera"',
    },
    {
      command: 'Cancel',
      description: 'Cancel current action',
      example: 'Say "Cancel" during emergency countdown',
    },
    {
      command: 'Location',
      description: 'Hear current location',
      example: 'Say "Where am I?" or "Location"',
    },
    {
      command: 'Repeat',
      description: 'Repeat last message',
      example: 'Say "Repeat" or "Say that again"',
    },
  ];

  const emergencyProcedure = [
    {
      step: 1,
      title: 'Trigger Emergency',
      description: 'Say "Help" or "Emergency" or show two fingers gesture',
      icon: '🚨',
    },
    {
      step: 2,
      title: 'Confirmation',
      description: 'System will ask for confirmation. Say "Confirm" or stay silent',
      icon: '⏱️',
    },
    {
      step: 3,
      title: 'Contact Notification',
      description: 'Emergency contacts will be notified with your location',
      icon: '👥',
    },
    {
      step: 4,
      title: 'Help on the Way',
      description: 'Emergency services are contacted. Help is on the way',
      icon: '🚑',
    },
    {
      step: 5,
      title: 'Cancel if Needed',
      description: 'If false alarm, say "Cancel" to stop the emergency',
      icon: '❌',
    },
  ];

  const faqItems = [
    {
      id: 1,
      question: 'How do I trigger emergency mode?',
      answer: 'You can trigger emergency mode in three ways: 1) Say "Help" or "Emergency", 2) Show the two fingers gesture, or 3) Press the emergency button on the dashboard. After triggering, you\'ll have 10 seconds to cancel if needed.',
    },
    {
      id: 2,
      question: 'What gestures does VOICE2EYE recognize?',
      answer: 'VOICE2EYE recognizes 8 gestures: Open Hand, Fist, Two Fingers, Thumbs Up, Thumbs Down, Pointing, Wave, and Stop. You can practice these in the Gesture Training section.',
    },
    {
      id: 3,
      question: 'How do I add emergency contacts?',
      answer: 'Go to the Contacts screen and tap the "+" button. Enter the contact\'s name, phone number, relationship, and set priority level. You can also set one contact as your primary emergency contact.',
    },
    {
      id: 4,
      question: 'Can I use VOICE2EYE offline?',
      answer: 'Yes, VOICE2EYE works offline for most features. Voice recognition and gesture detection work without internet. However, emergency alerts require internet connectivity to send SMS messages.',
    },
    {
      id: 5,
      question: 'How do I adjust voice settings?',
      answer: 'Go to Settings > Audio Settings. You can adjust speech rate, pitch, enable/disable voice navigation, and toggle haptic feedback.',
    },
    {
      id: 6,
      question: 'What if I accidentally trigger emergency mode?',
      answer: 'Don\'t worry! You have 10 seconds to cancel emergency mode. Just say "Cancel" or tap the "Cancel Emergency" button. No alerts will be sent if you cancel in time.',
    },
  ];

  const renderOverview = () => (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Welcome to VOICE2EYE
      </Text>
      <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
        VOICE2EYE is an assistive technology app designed to help users navigate 
        their environment using voice commands and hand gestures. This guide will 
        help you understand all the features and how to use them effectively.
      </Text>
      
      <View style={[styles.featureCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.featureTitle, { color: colors.text }]}>
          Key Features
        </Text>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎤</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>
              Voice Command Recognition
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✋</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>
              Hand Gesture Detection
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🚨</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>
              Emergency Alert System
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>👥</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>
              Emergency Contact Management
            </Text>
          </View>
        </View>
      </View>
      
      <AccessibleButton
        title="Start Tutorial"
        onPress={() => setActiveSection('gestures')}
        variant="primary"
        size="large"
        accessibilityLabel="Start the tutorial"
        style={styles.actionButton}
      />
    </Animated.View>
  );

  const renderGestures = () => (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Gesture Tutorial
      </Text>
      <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
        VOICE2EYE recognizes 8 different hand gestures. Practice these gestures 
        in the Gesture Training section to improve recognition accuracy.
      </Text>
      
      {gestureTutorials.map((gesture, index) => (
        <View 
          key={gesture.id} 
          style={[styles.gestureCard, { backgroundColor: colors.surface }]}
        >
          <View style={styles.gestureHeader}>
            <Text style={styles.gestureEmoji}>{gesture.emoji}</Text>
            <View style={styles.gestureInfo}>
              <Text style={[styles.gestureName, { color: colors.text }]}>
                {gesture.name}
              </Text>
              <Text style={[styles.gestureDescription, { color: colors.textSecondary }]}>
                {gesture.description}
              </Text>
            </View>
          </View>
          <Text style={[styles.gestureInstruction, { color: colors.text }]}>
            {gesture.instruction}
          </Text>
          <Text style={[styles.gestureUsage, { color: colors.textSecondary }]}>
            {gesture.usage}
          </Text>
        </View>
      ))}
      
      <AccessibleButton
        title="Practice Gestures"
        onPress={() => navigation.navigate('GestureTraining')}
        variant="primary"
        size="large"
        accessibilityLabel="Go to gesture training"
        style={styles.actionButton}
      />
    </Animated.View>
  );

  const renderVoiceCommands = () => (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Voice Command Reference
      </Text>
      <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
        VOICE2EYE responds to various voice commands. Speak clearly and naturally 
        for best results. The system works best in quiet environments.
      </Text>
      
      {voiceCommands.map((command, index) => (
        <View 
          key={index} 
          style={[styles.commandCard, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.commandName, { color: colors.text }]}>
            {command.command}
          </Text>
          <Text style={[styles.commandDescription, { color: colors.textSecondary }]}>
            {command.description}
          </Text>
          <Text style={[styles.commandExample, { color: colors.primary }]}>
            Example: {command.example}
          </Text>
        </View>
      ))}
      
      <View style={[styles.tipCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.tipTitle, { color: colors.text }]}>Pro Tips</Text>
        <Text style={[styles.tipText, { color: colors.textSecondary }]}>
          • Speak clearly and at a moderate pace
        </Text>
        <Text style={[styles.tipText, { color: colors.textSecondary }]}>
          • Use simple, direct commands
        </Text>
        <Text style={[styles.tipText, { color: colors.textSecondary }]}>
          • Minimize background noise when possible
        </Text>
      </View>
    </Animated.View>
  );

  const renderEmergency = () => (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Emergency Procedure
      </Text>
      <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
        Follow these steps when using the emergency system. Remember, you have 
        10 seconds to cancel after triggering to prevent false alarms.
      </Text>
      
      {emergencyProcedure.map((step) => (
        <View 
          key={step.step} 
          style={[styles.stepCard, { backgroundColor: colors.surface }]}
        >
          <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
            <Text style={styles.stepNumberText}>{step.step}</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              {step.title}
            </Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              {step.description}
            </Text>
          </View>
          <Text style={styles.stepIcon}>{step.icon}</Text>
        </View>
      ))}
      
      <View style={[styles.warningCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.warningTitle, { color: colors.error }]}>Important</Text>
        <Text style={[styles.warningText, { color: colors.textSecondary }]}>
          Emergency alerts require internet connectivity to send SMS messages. 
          Make sure you have a stable connection when using this feature.
        </Text>
      </View>
    </Animated.View>
  );

  const renderFAQ = () => (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Frequently Asked Questions
      </Text>
      
      {faqItems.map((faq) => (
        <View 
          key={faq.id} 
          style={[styles.faqCard, { backgroundColor: colors.surface }]}
        >
          <TouchableOpacity
            style={styles.faqHeader}
            onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
            accessibilityRole="button"
            accessibilityLabel={faq.question}
            accessibilityHint="Double tap to expand or collapse answer"
          >
            <Text style={[styles.faqQuestion, { color: colors.text }]}>
              {faq.question}
            </Text>
            <Text style={styles.faqToggle}>
              {expandedFAQ === faq.id ? '−' : '+'}
            </Text>
          </TouchableOpacity>
          
          {expandedFAQ === faq.id && (
            <View style={styles.faqContent}>
              <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                {faq.answer}
              </Text>
            </View>
          )}
        </View>
      ))}
      
      <View style={[styles.contactCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.contactTitle, { color: colors.text }]}>
          Need More Help?
        </Text>
        <Text style={[styles.contactText, { color: colors.textSecondary }]}>
          If you have questions not covered here, please contact our support team.
        </Text>
        <AccessibleButton
          title="Contact Support"
          onPress={() => Linking.openURL('mailto:support@voice2eye.com')}
          variant="primary"
          size="medium"
          accessibilityLabel="Send email to support"
          style={styles.contactButton}
        />
      </View>
    </Animated.View>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'gestures': return renderGestures();
      case 'voice': return renderVoiceCommands();
      case 'emergency': return renderEmergency();
      case 'faq': return renderFAQ();
      default: return renderOverview();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={[styles.title, { color: 'white' }]}>
          Help & Tutorial
        </Text>
        <Text style={[styles.subtitle, { color: 'white' }]}>
          Learn how to use VOICE2EYE
        </Text>
      </View>

      {/* Status Indicator */}
      <StatusIndicator
        status="idle"
        message="Help and tutorial guide"
        announceVoice={false}
      />

      {/* Section Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sectionNav}
        contentContainerStyle={styles.sectionNavContent}
      >
        {helpSections.map((section) => (
          <AccessibleButton
            key={section.id}
            title={`${section.icon} ${section.title}`}
            onPress={() => setActiveSection(section.id)}
            variant={activeSection === section.id ? 'primary' : 'outline'}
            size="small"
            accessibilityLabel={`Go to ${section.title} section`}
            style={styles.navButton}
          />
        ))}
      </ScrollView>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>

      {/* Back Button */}
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <AccessibleButton
          title="Back to Dashboard"
          onPress={() => navigation.navigate('Dashboard')}
          variant="outline"
          size="large"
          accessibilityLabel="Return to main dashboard"
          style={styles.footerButton}
        />
      </View>
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
  sectionNav: {
    paddingVertical: 10,
  },
  sectionNavContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  navButton: {
    minWidth: 100,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  featureCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
  },
  actionButton: {
    marginTop: 10,
  },
  gestureCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gestureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gestureEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  gestureInfo: {
    flex: 1,
  },
  gestureName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gestureDescription: {
    fontSize: 16,
  },
  gestureInstruction: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  gestureUsage: {
    fontSize: 14,
  },
  commandCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  commandName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  commandDescription: {
    fontSize: 16,
    marginBottom: 8,
  },
  commandExample: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  tipCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 16,
    marginBottom: 8,
  },
  stepCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 16,
  },
  stepIcon: {
    fontSize: 24,
    marginLeft: 16,
  },
  warningCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 16,
  },
  faqCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  faqToggle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  faqContent: {
    marginTop: 16,
  },
  faqAnswer: {
    fontSize: 16,
    lineHeight: 24,
  },
  contactCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 16,
    marginBottom: 16,
  },
  contactButton: {
    alignSelf: 'flex-start',
  },
  footer: {
    padding: 20,
  },
  footerButton: {
    borderRadius: 12,
  },
});

export default HelpScreen;