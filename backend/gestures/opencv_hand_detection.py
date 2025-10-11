"""
OpenCV-based Hand Detection for VOICE2EYE
Alternative to MediaPipe for Python 3.13 compatibility
"""
import cv2
import logging
import numpy as np
from typing import Optional, Tuple, List, Dict, Any
from sklearn.cluster import KMeans

from config.settings import (
    CAMERA_WIDTH, CAMERA_HEIGHT, CAMERA_FPS, CAMERA_INDEX
)

logger = logging.getLogger(__name__)

class OpenCVHandDetector:
    """OpenCV-based hand detection using contour analysis"""
    
    def __init__(self):
        self.is_initialized = False
        self.hand_cascade = None
        self.background_subtractor = None
        
    def initialize(self) -> bool:
        """Initialize OpenCV hand detection"""
        try:
            # Initialize background subtractor for motion detection
            self.background_subtractor = cv2.createBackgroundSubtractorMOG2(
                detectShadows=True, varThreshold=50, history=500
            )
            
            # Try to load Haar cascade for hand detection (if available)
            try:
                self.hand_cascade = cv2.CascadeClassifier(
                    cv2.data.haarcascades + 'haarcascade_hand.xml'
                )
                if self.hand_cascade.empty():
                    logger.warning("Hand cascade not available, using contour-based detection")
                    self.hand_cascade = None
            except:
                logger.warning("Hand cascade not available, using contour-based detection")
                self.hand_cascade = None
            
            self.is_initialized = True
            logger.info("OpenCV hand detector initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize OpenCV hand detector: {e}")
            return False
    
    def detect_hands(self, frame: np.ndarray) -> Tuple[List[Dict], np.ndarray]:
        """Detect hands in frame using OpenCV methods"""
        try:
            if not self.is_initialized:
                return [], frame
            
            # Create annotated frame
            annotated_frame = frame.copy()
            hand_data = []
            
            # Method 1: Try Haar cascade if available
            if self.hand_cascade is not None:
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                hands = self.hand_cascade.detectMultiScale(
                    gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
                )
                
                for (x, y, w, h) in hands:
                    # Draw rectangle around detected hand
                    cv2.rectangle(annotated_frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                    
                    # Extract hand region
                    hand_region = frame[y:y+h, x:x+w]
                    hand_info = self._analyze_hand_region(hand_region, x, y, w, h)
                    if hand_info:
                        hand_data.append(hand_info)
            
            # Method 2: Contour-based detection (fallback)
            if not hand_data:
                hand_data = self._detect_hands_by_contours(frame, annotated_frame)
            
            return hand_data, annotated_frame
            
        except Exception as e:
            logger.error(f"Error detecting hands: {e}")
            return [], frame
    
    def _detect_hands_by_contours(self, frame: np.ndarray, annotated_frame: np.ndarray) -> List[Dict]:
        """Detect hands using contour analysis"""
        try:
            hand_data = []
            
            # Convert to HSV for better skin detection
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            
            # Define skin color range
            lower_skin = np.array([0, 20, 70], dtype=np.uint8)
            upper_skin = np.array([20, 255, 255], dtype=np.uint8)
            
            # Create skin mask
            skin_mask = cv2.inRange(hsv, lower_skin, upper_skin)
            
            # Apply morphological operations to clean up the mask
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
            skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel)
            skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_CLOSE, kernel)
            
            # Find contours
            contours, _ = cv2.findContours(skin_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            for contour in contours:
                area = cv2.contourArea(contour)
                
                # Filter by area (hand should be reasonably sized)
                if 1000 < area < 50000:
                    # Get bounding rectangle
                    x, y, w, h = cv2.boundingRect(contour)
                    
                    # Check aspect ratio (hands are roughly square-ish)
                    aspect_ratio = w / h
                    if 0.5 < aspect_ratio < 2.0:
                        # Draw rectangle around detected hand
                        cv2.rectangle(annotated_frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                        
                        # Extract hand region
                        hand_region = frame[y:y+h, x:x+w]
                        hand_info = self._analyze_hand_region(hand_region, x, y, w, h)
                        if hand_info:
                            hand_data.append(hand_info)
            
            return hand_data
            
        except Exception as e:
            logger.error(f"Error in contour-based hand detection: {e}")
            return []
    
    def _analyze_hand_region(self, hand_region: np.ndarray, x: int, y: int, w: int, h: int) -> Optional[Dict]:
        """Analyze detected hand region for gesture features"""
        try:
            if hand_region.size == 0:
                return None
            
            # Convert to grayscale
            gray_hand = cv2.cvtColor(hand_region, cv2.COLOR_BGR2GRAY)
            
            # Apply Gaussian blur
            blurred = cv2.GaussianBlur(gray_hand, (5, 5), 0)
            
            # Apply threshold
            _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Find contours in hand region
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Analyze contours for finger detection
            finger_count = self._count_fingers(contours, hand_region.shape)
            
            # Calculate hand center
            center_x = x + w // 2
            center_y = y + h // 2
            
            # Create hand data
            hand_info = {
                'center': (center_x, center_y),
                'bbox': (x, y, w, h),
                'finger_count': finger_count,
                'area': w * h,
                'confidence': 0.8,  # Default confidence
                'handedness': 'unknown'  # Can't determine left/right without more complex analysis
            }
            
            return hand_info
            
        except Exception as e:
            logger.error(f"Error analyzing hand region: {e}")
            return None
    
    def _count_fingers(self, contours: List, hand_shape: Tuple) -> int:
        """Count fingers using contour analysis"""
        try:
            if not contours:
                return 0
            
            # Find the largest contour (likely the hand)
            largest_contour = max(contours, key=cv2.contourArea)
            
            # Approximate the contour
            epsilon = 0.02 * cv2.arcLength(largest_contour, True)
            approx = cv2.approxPolyDP(largest_contour, epsilon, True)
            
            # Count convexity defects (fingers)
            hull = cv2.convexHull(approx, returnPoints=False)
            defects = cv2.convexityDefects(approx, hull)
            
            finger_count = 0
            if defects is not None:
                for i in range(defects.shape[0]):
                    s, e, f, d = defects[i, 0]
                    start = tuple(approx[s][0])
                    end = tuple(approx[e][0])
                    far = tuple(approx[f][0])
                    
                    # Calculate distances
                    a = np.sqrt((end[0] - start[0])**2 + (end[1] - start[1])**2)
                    b = np.sqrt((far[0] - start[0])**2 + (far[1] - start[1])**2)
                    c = np.sqrt((end[0] - far[0])**2 + (end[1] - far[1])**2)
                    
                    # Calculate angle
                    angle = np.arccos((b**2 + c**2 - a**2) / (2*b*c))
                    
                    # If angle is less than 90 degrees, it's likely a finger
                    if angle <= np.pi/2:
                        finger_count += 1
            
            # Ensure finger count is reasonable
            return min(finger_count, 5)
            
        except Exception as e:
            logger.error(f"Error counting fingers: {e}")
            return 0
    
    def cleanup(self):
        """Clean up resources"""
        self.is_initialized = False
        self.hand_cascade = None
        self.background_subtractor = None
        logger.info("OpenCV hand detector cleaned up")

class CameraManager:
    """Camera management for OpenCV-based detection"""
    
    def __init__(self, camera_index: int = CAMERA_INDEX):
        self.camera_index = camera_index
        self.cap = None
        self.is_initialized = False
        self.width = CAMERA_WIDTH
        self.height = CAMERA_HEIGHT
        self.fps = CAMERA_FPS
        
    def initialize_camera(self) -> bool:
        """Initialize camera"""
        try:
            self.cap = cv2.VideoCapture(self.camera_index)
            
            if not self.cap.isOpened():
                logger.error(f"Failed to open camera {self.camera_index}")
                return False
            
            # Set camera properties
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
            self.cap.set(cv2.CAP_PROP_FPS, self.fps)
            
            # Test camera
            ret, frame = self.cap.read()
            if not ret:
                logger.error("Failed to capture test frame")
                return False
            
            self.is_initialized = True
            logger.info(f"Camera {self.camera_index} initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Camera initialization failed: {e}")
            return False
    
    def get_frame(self) -> Optional[np.ndarray]:
        """Capture frame from camera"""
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

def test_opencv_hand_detection() -> bool:
    """Test OpenCV hand detection functionality"""
    try:
        detector = OpenCVHandDetector()
        if not detector.initialize():
            return False
        
        camera = CameraManager()
        if not camera.initialize_camera():
            detector.cleanup()
            return False
        
        logger.info("Testing OpenCV hand detection...")
        logger.info("Show your hand to the camera for 3 seconds...")
        
        # Test for 3 seconds
        for i in range(90):  # 3 seconds at 30 FPS
            frame = camera.get_frame()
            if frame is None:
                continue
            
            hand_data, annotated_frame = detector.detect_hands(frame)
            
            if hand_data:
                for hand in hand_data:
                    logger.info(f"Hand detected: {hand['finger_count']} fingers, "
                              f"center: {hand['center']}, confidence: {hand['confidence']:.2f}")
            
            # Show frame (optional, for debugging)
            # cv2.imshow('Hand Detection Test', annotated_frame)
            # if cv2.waitKey(1) & 0xFF == ord('q'):
            #     break
        
        camera.release_camera()
        detector.cleanup()
        
        logger.info("OpenCV hand detection test completed")
        return True
        
    except Exception as e:
        logger.error(f"OpenCV hand detection test failed: {e}")
        return False
