"""
Gesture Detection Service for VOICE2EYE
Main service that coordinates camera, MediaPipe, and gesture classification
"""
import logging
import threading
import time
from typing import Optional, Callable, Dict, Any, List
from enum import Enum

from .camera_mediapipe import CameraManager, MediaPipeHands
from .gesture_classifier import GestureClassifier, GestureType
from config.settings import (
    GESTURE_CONFIDENCE_THRESHOLD, GESTURE_HOLD_TIME, GESTURE_SEQUENCE_TIMEOUT,
    GESTURE_SMOOTHING_FACTOR, GESTURE_MIN_DETECTION_FRAMES, GESTURE_VOCABULARY
)

logger = logging.getLogger(__name__)

class GestureEvent:
    """Represents a gesture detection event"""
    
    def __init__(self, gesture_type: GestureType, confidence: float, 
                 handedness: str, timestamp: float):
        self.gesture_type = gesture_type
        self.confidence = confidence
        self.handedness = handedness
        self.timestamp = timestamp
        self.action = GESTURE_VOCABULARY.get(gesture_type.value, "Unknown action")

class GestureDetectionService:
    """Main gesture detection service"""
    
    def __init__(self):
        self.camera_manager = CameraManager()
        self.mediapipe_hands = MediaPipeHands()
        self.gesture_classifier = GestureClassifier()
        
        self.is_running = False
        self.is_initialized = False
        
        # Detection settings
        self.confidence_threshold = GESTURE_CONFIDENCE_THRESHOLD
        self.hold_time = GESTURE_HOLD_TIME
        self.sequence_timeout = GESTURE_SEQUENCE_TIMEOUT
        
        # State tracking
        self.current_gesture = None
        self.gesture_start_time = None
        self.last_gesture_time = None
        self.detection_count = 0
        
        # Callbacks
        self.on_gesture_callback: Optional[Callable] = None
        self.on_emergency_callback: Optional[Callable] = None
        
        # Threading
        self.detection_thread: Optional[threading.Thread] = None
        self.stop_event = threading.Event()
        
    def initialize(self) -> bool:
        """Initialize all components"""
        try:
            logger.info("Initializing Gesture Detection Service...")
            
            # Initialize camera
            if not self.camera_manager.initialize_camera():
                logger.error("Failed to initialize camera")
                return False
            
            # Initialize MediaPipe
            if not self.mediapipe_hands.initialize():
                logger.error("Failed to initialize MediaPipe Hands")
                self.camera_manager.release_camera()
                return False
            
            self.is_initialized = True
            logger.info("Gesture Detection Service initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize Gesture Detection Service: {e}")
            return False
    
    def set_callbacks(self, on_gesture: Optional[Callable] = None,
                     on_emergency: Optional[Callable] = None):
        """Set callback functions for gesture detection"""
        self.on_gesture_callback = on_gesture
        self.on_emergency_callback = on_emergency
    
    def start_detection(self) -> bool:
        """Start gesture detection"""
        try:
            if not self.is_initialized:
                if not self.initialize():
                    return False
            
            self.stop_event.clear()
            self.is_running = True
            
            # Start detection thread
            self.detection_thread = threading.Thread(target=self._detection_loop, daemon=True)
            self.detection_thread.start()
            
            logger.info("Gesture detection started")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start gesture detection: {e}")
            return False
    
    def stop_detection(self):
        """Stop gesture detection"""
        try:
            self.stop_event.set()
            self.is_running = False
            
            if self.detection_thread and self.detection_thread.is_alive():
                self.detection_thread.join(timeout=2.0)
            
            logger.info("Gesture detection stopped")
            
        except Exception as e:
            logger.error(f"Error stopping gesture detection: {e}")
    
    def _detection_loop(self):
        """Main detection loop"""
        try:
            while not self.stop_event.is_set():
                # Capture frame
                frame = self.camera_manager.get_frame()
                if frame is None:
                    time.sleep(0.1)
                    continue
                
                # Detect hands
                hand_landmarks, annotated_frame = self.mediapipe_hands.detect_hands(frame)
                
                if hand_landmarks:
                    # Process each detected hand
                    for hand_data in hand_landmarks:
                        self._process_hand(hand_data)
                
                # Small delay to prevent excessive CPU usage
                time.sleep(0.033)  # ~30 FPS
                
        except Exception as e:
            logger.error(f"Error in detection loop: {e}")
        finally:
            self.is_running = False
    
    def _process_hand(self, hand_data: Dict[str, Any]):
        """Process a single detected hand"""
        try:
            landmarks = hand_data['landmarks']
            handedness = hand_data['handedness']
            confidence = hand_data['confidence']
            
            # Classify gesture
            gesture_type, gesture_confidence = self.gesture_classifier.classify_gesture(landmarks)
            
            # Check if gesture meets confidence threshold
            if gesture_confidence < self.confidence_threshold:
                return
            
            current_time = time.time()
            
            # Handle gesture detection
            if gesture_type != GestureType.UNKNOWN:
                self._handle_gesture_detection(gesture_type, gesture_confidence, 
                                              handedness, current_time)
            
        except Exception as e:
            logger.error(f"Error processing hand: {e}")
    
    def _handle_gesture_detection(self, gesture_type: GestureType, confidence: float,
                                handedness: str, timestamp: float):
        """Handle detected gesture with timing and validation"""
        try:
            # Check if this is the same gesture as before
            if (self.current_gesture == gesture_type and 
                self.gesture_start_time is not None):
                
                # Same gesture - increment detection count
                self.detection_count += 1
                self.last_gesture_time = timestamp
                
                # Check if gesture has been held long enough
                hold_duration = timestamp - self.gesture_start_time
                if (hold_duration >= self.hold_time and 
                    self.detection_count >= GESTURE_MIN_DETECTION_FRAMES):
                    
                    # Gesture confirmed - trigger action
                    self._trigger_gesture_action(gesture_type, confidence, handedness, timestamp)
                    
                    # Reset state
                    self._reset_gesture_state()
            
            else:
                # New gesture detected
                self.current_gesture = gesture_type
                self.gesture_start_time = timestamp
                self.last_gesture_time = timestamp
                self.detection_count = 1
                
                logger.debug(f"New gesture detected: {gesture_type.value} (confidence: {confidence:.2f})")
            
        except Exception as e:
            logger.error(f"Error handling gesture detection: {e}")
    
    def _trigger_gesture_action(self, gesture_type: GestureType, confidence: float,
                               handedness: str, timestamp: float):
        """Trigger action for confirmed gesture"""
        try:
            # Create gesture event
            event = GestureEvent(gesture_type, confidence, handedness, timestamp)
            
            logger.info(f"Gesture confirmed: {gesture_type.value} ({handedness}) "
                       f"confidence: {confidence:.2f}")
            
            # Check for emergency gesture
            if gesture_type == GestureType.TWO_FINGERS:
                logger.warning("EMERGENCY GESTURE DETECTED!")
                if self.on_emergency_callback:
                    self.on_emergency_callback(event)
            
            # Call gesture callback
            if self.on_gesture_callback:
                self.on_gesture_callback(event)
            
        except Exception as e:
            logger.error(f"Error triggering gesture action: {e}")
    
    def _reset_gesture_state(self):
        """Reset gesture detection state"""
        self.current_gesture = None
        self.gesture_start_time = None
        self.last_gesture_time = None
        self.detection_count = 0
        self.gesture_classifier.reset_history()
    
    def get_current_frame(self) -> Optional[Any]:
        """Get current camera frame with annotations"""
        try:
            if not self.is_running:
                return None
            
            frame = self.camera_manager.get_frame()
            if frame is None:
                return None
            
            # Detect hands and return annotated frame
            _, annotated_frame = self.mediapipe_hands.detect_hands(frame)
            return annotated_frame
            
        except Exception as e:
            logger.error(f"Error getting current frame: {e}")
            return None
    
    def cleanup(self):
        """Clean up all resources"""
        try:
            self.stop_detection()
            
            if self.mediapipe_hands:
                self.mediapipe_hands.cleanup()
            
            if self.camera_manager:
                self.camera_manager.release_camera()
            
            logger.info("Gesture Detection Service cleaned up")
            
        except Exception as e:
            logger.error(f"Error cleaning up Gesture Detection Service: {e}")

# Convenience functions
def create_gesture_service() -> GestureDetectionService:
    """Create and initialize a gesture detection service"""
    service = GestureDetectionService()
    if not service.initialize():
        logger.error("Failed to initialize gesture detection service")
        return None
    return service

def test_gesture_detection() -> bool:
    """Test gesture detection functionality"""
    try:
        service = create_gesture_service()
        if not service:
            return False
        
        logger.info("Testing gesture detection...")
        logger.info("Show gestures to the camera for 5 seconds...")
        
        # Set up test callbacks
        def on_gesture(event: GestureEvent):
            logger.info(f"Test gesture detected: {event.gesture_type.value} "
                       f"({event.handedness}) confidence: {event.confidence:.2f}")
        
        def on_emergency(event: GestureEvent):
            logger.warning(f"Test emergency gesture detected: {event.gesture_type.value}")
        
        service.set_callbacks(on_gesture, on_emergency)
        
        # Start detection
        if not service.start_detection():
            service.cleanup()
            return False
        
        # Run for 5 seconds
        time.sleep(5)
        
        service.stop_detection()
        service.cleanup()
        
        logger.info("Gesture detection test completed")
        return True
        
    except Exception as e:
        logger.error(f"Gesture detection test failed: {e}")
        return False
