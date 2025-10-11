"""
Camera and MediaPipe Setup for VOICE2EYE
Handles camera access, video capture, and MediaPipe initialization
"""
import cv2
import logging
import numpy as np
from typing import Optional, Tuple, List, Dict, Any

try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    logging.warning("MediaPipe not available. Install with: pip install mediapipe")

from config.settings import (
    CAMERA_WIDTH, CAMERA_HEIGHT, CAMERA_FPS, CAMERA_INDEX,
    MEDIAPIPE_MAX_HANDS, MEDIAPIPE_MIN_DETECTION_CONFIDENCE,
    MEDIAPIPE_MIN_TRACKING_CONFIDENCE
)

logger = logging.getLogger(__name__)

class CameraManager:
    """Manages camera access and video capture"""
    
    def __init__(self, camera_index: int = CAMERA_INDEX):
        self.camera_index = camera_index
        self.cap = None
        self.is_initialized = False
        self.width = CAMERA_WIDTH
        self.height = CAMERA_HEIGHT
        self.fps = CAMERA_FPS
        
    def initialize_camera(self) -> bool:
        """Initialize camera and test access"""
        try:
            # Try to open camera
            self.cap = cv2.VideoCapture(self.camera_index)
            
            if not self.cap.isOpened():
                logger.error(f"Failed to open camera {self.camera_index}")
                return False
            
            # Set camera properties
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
            self.cap.set(cv2.CAP_PROP_FPS, self.fps)
            
            # Test camera by capturing a frame
            ret, frame = self.cap.read()
            if not ret:
                logger.error("Failed to capture test frame from camera")
                return False
            
            logger.info(f"Camera {self.camera_index} initialized successfully")
            logger.info(f"Resolution: {self.width}x{self.height}, FPS: {self.fps}")
            
            self.is_initialized = True
            return True
            
        except Exception as e:
            logger.error(f"Camera initialization failed: {e}")
            return False
    
    def get_frame(self) -> Optional[np.ndarray]:
        """Capture a frame from the camera"""
        try:
            if not self.is_initialized or not self.cap:
                return None
            
            ret, frame = self.cap.read()
            if ret:
                return frame
            else:
                logger.warning("Failed to capture frame")
                return None
                
        except Exception as e:
            logger.error(f"Error capturing frame: {e}")
            return None
    
    def release_camera(self):
        """Release camera resources"""
        if self.cap:
            self.cap.release()
            self.cap = None
        self.is_initialized = False
        logger.info("Camera released")

class MediaPipeHands:
    """MediaPipe Hands detection and tracking"""
    
    def __init__(self):
        self.mp_hands = None
        self.hands = None
        self.mp_drawing = None
        self.mp_drawing_styles = None
        self.is_initialized = False
        
    def initialize(self) -> bool:
        """Initialize MediaPipe Hands"""
        try:
            if not MEDIAPIPE_AVAILABLE:
                logger.error("MediaPipe is not installed. Please install with: pip install mediapipe")
                return False
            
            # Initialize MediaPipe components
            self.mp_hands = mp.solutions.hands
            self.hands = self.mp_hands.Hands(
                static_image_mode=False,
                max_num_hands=MEDIAPIPE_MAX_HANDS,
                min_detection_confidence=MEDIAPIPE_MIN_DETECTION_CONFIDENCE,
                min_tracking_confidence=MEDIAPIPE_MIN_TRACKING_CONFIDENCE
            )
            
            self.mp_drawing = mp.solutions.drawing_utils
            self.mp_drawing_styles = mp.solutions.drawing_styles
            
            self.is_initialized = True
            logger.info("MediaPipe Hands initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize MediaPipe Hands: {e}")
            return False
    
    def detect_hands(self, frame: np.ndarray) -> Tuple[Optional[List[Dict]], np.ndarray]:
        """Detect hands in the frame and return landmarks"""
        try:
            if not self.is_initialized or not self.hands:
                return None, frame
            
            # Convert BGR to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process the frame
            results = self.hands.process(rgb_frame)
            
            # Extract hand landmarks
            hand_landmarks = []
            if results.multi_hand_landmarks:
                for idx, hand_landmark in enumerate(results.multi_hand_landmarks):
                    # Get handedness (left/right)
                    handedness = results.multi_handedness[idx].classification[0].label
                    
                    # Extract landmark coordinates
                    landmarks = []
                    for landmark in hand_landmark.landmark:
                        landmarks.append({
                            'x': landmark.x,
                            'y': landmark.y,
                            'z': landmark.z
                        })
                    
                    hand_data = {
                        'handedness': handedness,
                        'landmarks': landmarks,
                        'confidence': results.multi_handedness[idx].classification[0].score
                    }
                    hand_landmarks.append(hand_data)
            
            # Draw hand landmarks on frame
            annotated_frame = frame.copy()
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    self.mp_drawing.draw_landmarks(
                        annotated_frame,
                        hand_landmarks,
                        self.mp_hands.HAND_CONNECTIONS,
                        self.mp_drawing_styles.get_default_hand_landmarks_style(),
                        self.mp_drawing_styles.get_default_hand_connections_style()
                    )
            
            return hand_landmarks, annotated_frame
            
        except Exception as e:
            logger.error(f"Error detecting hands: {e}")
            return None, frame
    
    def cleanup(self):
        """Clean up MediaPipe resources"""
        if self.hands:
            self.hands.close()
            self.hands = None
        self.is_initialized = False
        logger.info("MediaPipe Hands cleaned up")

def test_camera_access() -> bool:
    """Test camera access and functionality"""
    try:
        camera = CameraManager()
        
        if not camera.initialize_camera():
            return False
        
        # Test capturing a few frames
        for i in range(5):
            frame = camera.get_frame()
            if frame is None:
                logger.error(f"Failed to capture frame {i+1}")
                camera.release_camera()
                return False
        
        camera.release_camera()
        logger.info("Camera test successful")
        return True
        
    except Exception as e:
        logger.error(f"Camera test failed: {e}")
        return False

def test_mediapipe_hands() -> bool:
    """Test MediaPipe Hands detection"""
    try:
        hands = MediaPipeHands()
        
        if not hands.initialize():
            return False
        
        # Test with camera
        camera = CameraManager()
        if not camera.initialize_camera():
            hands.cleanup()
            return False
        
        # Capture a frame and test hand detection
        frame = camera.get_frame()
        if frame is None:
            camera.release_camera()
            hands.cleanup()
            return False
        
        hand_landmarks, annotated_frame = hands.detect_hands(frame)
        
        camera.release_camera()
        hands.cleanup()
        
        logger.info("MediaPipe Hands test successful")
        return True
        
    except Exception as e:
        logger.error(f"MediaPipe Hands test failed: {e}")
        return False
