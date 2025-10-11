"""
VOICE2EYE Lite - Main Application
Speech Processing Module Demo
"""
import logging
import time
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent))

from speech.speech_recognition import SpeechRecognitionService, test_speech_recognition
from speech.text_to_speech import TextToSpeechService, test_text_to_speech
from speech.audio_processing import test_microphone_access
from gestures.gesture_detection import GestureDetectionService, GestureEvent, test_gesture_detection
from gestures.gesture_classifier import GestureType
from config.settings import LOG_LEVEL, LOG_FORMAT

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format=LOG_FORMAT,
    handlers=[
        logging.FileHandler('logs/voice2eye.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class Voice2EyeApp:
    """Main VOICE2EYE application"""
    
    def __init__(self):
        self.speech_service: SpeechRecognitionService = None
        self.tts_service: TextToSpeechService = None
        self.gesture_service: GestureDetectionService = None
        self.is_running = False
        
    def initialize(self) -> bool:
        """Initialize all services"""
        logger.info("Initializing VOICE2EYE Lite...")
        
        # Initialize TTS service
        logger.info("Initializing Text-to-Speech service...")
        self.tts_service = TextToSpeechService()
        if not self.tts_service.initialize():
            logger.error("Failed to initialize TTS service")
            return False
        
        # Initialize Speech Recognition service
        logger.info("Initializing Speech Recognition service...")
        self.speech_service = SpeechRecognitionService()
        if not self.speech_service.initialize_model():
            logger.error("Failed to initialize Speech Recognition service")
            return False
        
        # Set up speech callbacks
        self.speech_service.set_callbacks(
            on_result=self.on_speech_result,
            on_emergency=self.on_emergency_detected
        )
        
        # Initialize Gesture Detection service
        logger.info("Initializing Gesture Detection service...")
        self.gesture_service = GestureDetectionService()
        if not self.gesture_service.initialize():
            logger.error("Failed to initialize Gesture Detection service")
            return False
        
        # Set up gesture callbacks
        self.gesture_service.set_callbacks(
            on_gesture=self.on_gesture_detected,
            on_emergency=self.on_gesture_emergency
        )
        
        logger.info("VOICE2EYE Lite initialized successfully!")
        return True
    
    def on_speech_result(self, text: str, confidence: float):
        """Handle speech recognition results"""
        logger.info(f"Speech recognized: '{text}' (confidence: {confidence:.2f})")
        
        # Respond to common commands
        text_lower = text.lower().strip()
        
        if "hello" in text_lower or "hi" in text_lower:
            self.tts_service.speak("Hello! How can I help you today?")
        
        elif "time" in text_lower:
            current_time = time.strftime("%I:%M %p")
            self.tts_service.speak(f"The current time is {current_time}")
        
        elif "date" in text_lower:
            current_date = time.strftime("%B %d, %Y")
            self.tts_service.speak(f"Today is {current_date}")
        
        elif "stop" in text_lower or "exit" in text_lower:
            self.tts_service.speak("Goodbye!")
            self.stop()
        
        elif "test" in text_lower:
            self.tts_service.speak("The speech recognition system is working correctly!")
        
        else:
            self.tts_service.speak(f"I heard you say: {text}")
    
    def on_emergency_detected(self, text: str, confidence: float):
        """Handle emergency detection"""
        logger.warning(f"EMERGENCY DETECTED: '{text}' (confidence: {confidence:.2f})")
        
        # Speak emergency alert
        self.tts_service.speak_emergency("Emergency detected! Help is on the way!")
        
        # In a real implementation, this would trigger:
        # - Send SMS to emergency contacts
        # - Get current location
        # - Contact emergency services
        logger.warning("EMERGENCY PROTOCOL TRIGGERED - Implement emergency response here")
    
    def on_gesture_detected(self, event: GestureEvent):
        """Handle gesture detection"""
        logger.info(f"Gesture detected: {event.gesture_type.value} "
                   f"({event.handedness}) confidence: {event.confidence:.2f}")
        
        # Respond to gestures
        if event.gesture_type == GestureType.OPEN_HAND:
            self.tts_service.speak("Starting to listen for voice commands")
            if self.speech_service:
                self.speech_service.start_listening(continuous=True)
        
        elif event.gesture_type == GestureType.FIST:
            self.tts_service.speak("Stopping voice recognition")
            if self.speech_service:
                self.speech_service.stop_listening()
        
        elif event.gesture_type == GestureType.THUMBS_UP:
            self.tts_service.speak_confirmation("Yes, I understand")
        
        elif event.gesture_type == GestureType.THUMBS_DOWN:
            self.tts_service.speak_confirmation("No, I understand")
        
        elif event.gesture_type == GestureType.WAVE:
            self.tts_service.speak("Hello! How can I help you?")
        
        elif event.gesture_type == GestureType.STOP_GESTURE:
            self.tts_service.speak("Stopping current action")
        
        elif event.gesture_type == GestureType.POINTING:
            self.tts_service.speak("I see you're pointing. What would you like me to do?")
    
    def on_gesture_emergency(self, event: GestureEvent):
        """Handle emergency gesture detection"""
        logger.warning(f"EMERGENCY GESTURE DETECTED: {event.gesture_type.value}")
        
        # Speak emergency alert
        self.tts_service.speak_emergency("Emergency gesture detected! Help is on the way!")
        
        # In a real implementation, this would trigger:
        # - Send SMS to emergency contacts
        # - Get current location
        # - Contact emergency services
        logger.warning("EMERGENCY PROTOCOL TRIGGERED - Implement emergency response here")
    
    def start(self):
        """Start the application"""
        if not self.initialize():
            logger.error("Failed to initialize application")
            return False
        
        logger.info("Starting VOICE2EYE Lite...")
        self.tts_service.speak("VOICE2EYE Lite is now active. Use voice commands or hand gestures. Say 'help' or show two fingers for emergency.")
        
        self.is_running = True
        
        try:
            # Start gesture detection
            if not self.gesture_service.start_detection():
                logger.error("Failed to start gesture detection")
                return False
            
            # Start continuous listening
            if not self.speech_service.start_listening(continuous=True):
                logger.error("Failed to start speech recognition")
                return False
            
            logger.info("Application is running. Press Ctrl+C to stop.")
            logger.info("Available gestures: Open hand (start listening), Fist (stop listening), Two fingers (emergency)")
            
            # Keep running until interrupted
            while self.is_running:
                time.sleep(0.1)
                
        except KeyboardInterrupt:
            logger.info("Application interrupted by user")
        except Exception as e:
            logger.error(f"Application error: {e}")
        finally:
            self.stop()
        
        return True
    
    def stop(self):
        """Stop the application"""
        logger.info("Stopping VOICE2EYE Lite...")
        self.is_running = False
        
        if self.gesture_service:
            self.gesture_service.stop_detection()
            self.gesture_service.cleanup()
        
        if self.speech_service:
            self.speech_service.stop_listening()
            self.speech_service.cleanup()
        
        if self.tts_service:
            self.tts_service.cleanup()
        
        logger.info("VOICE2EYE Lite stopped")

def run_tests():
    """Run all system tests"""
    logger.info("Running VOICE2EYE Lite system tests...")
    
    tests = [
        ("Microphone Access", test_microphone_access),
        ("Text-to-Speech", test_text_to_speech),
        ("Speech Recognition", test_speech_recognition),
        ("Gesture Detection", test_gesture_detection),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        logger.info(f"Running {test_name} test...")
        try:
            result = test_func()
            results[test_name] = result
            status = "PASSED" if result else "FAILED"
            logger.info(f"{test_name} test: {status}")
        except Exception as e:
            logger.error(f"{test_name} test failed with error: {e}")
            results[test_name] = False
    
    # Summary
    logger.info("\n" + "="*50)
    logger.info("TEST SUMMARY")
    logger.info("="*50)
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        logger.info(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    logger.info(f"\nOverall: {'✅ ALL TESTS PASSED' if all_passed else '❌ SOME TESTS FAILED'}")
    
    return all_passed

def main():
    """Main entry point"""
    logger.info("VOICE2EYE Lite - Speech Processing Module")
    logger.info("="*50)
    
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        # Run tests
        success = run_tests()
        sys.exit(0 if success else 1)
    
    # Run application
    app = Voice2EyeApp()
    success = app.start()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
