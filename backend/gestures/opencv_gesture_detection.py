"""
OpenCV-based Gesture Detection Service for VOICE2EYE
Main service using OpenCV instead of MediaPipe for Python 3.13 compatibility
"""
import logging
import threading
import time
from typing import Optional, Callable, Dict, Any, List

from .opencv_hand_detection import OpenCVHandDetector, CameraManager, test_opencv_hand_detection
from .opencv_gesture_classifier import OpenCVGestureClassifier, GestureEvent, GestureType, test_gesture_classification
from config.settings import (
    GESTURE_CONFIDENCE_THRESHOLD, GESTURE_HOLD_TIME, GESTURE_SEQUENCE_TIMEOUT,
    GESTURE_SMOOTHING_FACTOR, GESTURE_MIN_DETECTION_FRAMES, GESTURE_VOCABULARY
)

logger = logging.getLogger(__name__)

class OpenCVGestureDetectionService:
    """OpenCV-based gesture detection service"""
    
    def __init__(self):
        self.camera_manager = CameraManager()
        self.hand_detector = OpenCVHandDetector()
        self.gesture_classifier = OpenCVGestureClassifier()
        
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
            logger.info("Initializing OpenCV Gesture Detection Service...")
            
            # Initialize camera
            if not self.camera_manager.initialize_camera():
                logger.error("Failed to initialize camera")
                return False
            
            # Initialize hand detector
            if not self.hand_detector.initialize():
                logger.error("Failed to initialize hand detector")
                self.camera_manager.release_camera()
                return False
            
            self.is_initialized = True
            logger.info("OpenCV Gesture Detection Service initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize OpenCV Gesture Detection Service: {e}")
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
            
            logger.info("OpenCV gesture detection started")
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
            
            logger.info("OpenCV gesture detection stopped")
            
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
                hand_data_list, annotated_frame = self.hand_detector.detect_hands(frame)
                
                if hand_data_list:
                    # Process each detected hand
                    for hand_data in hand_data_list:
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
            # Classify gesture
            gesture_type, gesture_confidence = self.gesture_classifier.classify_gesture(hand_data)
            
            # Check if gesture meets confidence threshold
            if gesture_confidence < self.confidence_threshold:
                return
            
            current_time = time.time()
            finger_count = hand_data.get('finger_count', 0)
            handedness = hand_data.get('handedness', 'unknown')
            
            # Handle gesture detection
            if gesture_type != GestureType.UNKNOWN:
                self._handle_gesture_detection(gesture_type, gesture_confidence, 
                                              handedness, current_time, finger_count)
            
        except Exception as e:
            logger.error(f"Error processing hand: {e}")
    
    def _handle_gesture_detection(self, gesture_type: GestureType, confidence: float,
                                handedness: str, timestamp: float, finger_count: int):
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
                    self._trigger_gesture_action(gesture_type, confidence, handedness, 
                                                timestamp, finger_count)
                    
                    # Reset state
                    self._reset_gesture_state()
            
            else:
                # New gesture detected
                self.current_gesture = gesture_type
                self.gesture_start_time = timestamp
                self.last_gesture_time = timestamp
                self.detection_count = 1
                
                logger.debug(f"New gesture detected: {gesture_type.value} "
                           f"(confidence: {confidence:.2f}, fingers: {finger_count})")
            
        except Exception as e:
            logger.error(f"Error handling gesture detection: {e}")
    
    def _trigger_gesture_action(self, gesture_type: GestureType, confidence: float,
                               handedness: str, timestamp: float, finger_count: int):
        """Trigger action for confirmed gesture"""
        try:
            # Create gesture event
            event = GestureEvent(gesture_type, confidence, handedness, timestamp, finger_count)
            
            logger.info(f"Gesture confirmed: {gesture_type.value} ({handedness}) "
                       f"confidence: {confidence:.2f}, fingers: {finger_count}")
            
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
            _, annotated_frame = self.hand_detector.detect_hands(frame)
            return annotated_frame
            
        except Exception as e:
            logger.error(f"Error getting current frame: {e}")
            return None
    
    def cleanup(self):
        """Clean up all resources"""
        try:
            self.stop_detection()
            
            if self.hand_detector:
                self.hand_detector.cleanup()
            
            if self.camera_manager:
                self.camera_manager.release_camera()
            
            logger.info("OpenCV Gesture Detection Service cleaned up")
            
        except Exception as e:
            logger.error(f"Error cleaning up OpenCV Gesture Detection Service: {e}")

# Convenience functions
def create_gesture_service() -> OpenCVGestureDetectionService:
    """Create and initialize an OpenCV gesture detection service"""
    service = OpenCVGestureDetectionService()
    if not service.initialize():
        logger.error("Failed to initialize OpenCV gesture detection service")
        return None
    return service

def test_opencv_gesture_detection() -> bool:
    """Test OpenCV gesture detection functionality"""
    try:
        # Test hand detection
        if not test_opencv_hand_detection():
        #     logger.error("OpenCV hand detection test failed")
        #     return False
        
        # Test gesture classification
        if not test_gesture_classification():
            logger.error("OpenCV gesture classification test failed")
            return False
        
        # Test full service
        service = create_gesture_service()
        if not service:
            return False
        
        logger.info("Testing OpenCV gesture detection...")
        logger.info("Show gestures to the camera for 5 seconds...")
        
        # Set up test callbacks
        def on_gesture(event: GestureEvent):
            logger.info(f"Test gesture detected: {event.gesture_type.value} "
                       f"({event.handedness}) confidence: {event.confidence:.2f} "
                       f"fingers: {event.finger_count}")
        
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
        
        logger.info("OpenCV gesture detection test completed")
        return True
        
    except Exception as e:
        logger.error(f"OpenCV gesture detection test failed: {e}")
        return False
