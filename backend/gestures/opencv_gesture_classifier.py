"""
OpenCV-based Gesture Classifier for VOICE2EYE
Simplified gesture recognition using finger counting and hand analysis
"""
import logging
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from enum import Enum

logger = logging.getLogger(__name__)

class GestureType(Enum):
    """Enumeration of supported gestures"""
    OPEN_HAND = "open_hand"
    FIST = "fist"
    TWO_FINGERS = "two_fingers"
    THUMBS_UP = "thumbs_up"
    THUMBS_DOWN = "thumbs_down"
    POINTING = "pointing"
    WAVE = "wave"
    STOP_GESTURE = "stop_gesture"
    UNKNOWN = "unknown"

class OpenCVGestureClassifier:
    """OpenCV-based gesture classifier using finger counting and hand analysis"""
    
    def __init__(self):
        self.confidence_threshold = 0.6
        self.gesture_history = []
        self.max_history = 5
        
    def classify_gesture(self, hand_data: Dict[str, Any]) -> Tuple[GestureType, float]:
        """Classify gesture from OpenCV hand detection data"""
        try:
            if not hand_data:
                return GestureType.UNKNOWN, 0.0
            
            finger_count = hand_data.get('finger_count', 0)
            area = hand_data.get('area', 0)
            confidence = hand_data.get('confidence', 0.0)
            
            # Classify based on finger count
            gesture, gesture_confidence = self._classify_by_finger_count(finger_count, area)
            
            # Apply confidence weighting
            final_confidence = gesture_confidence * confidence
            
            # Add to history for smoothing
            self.gesture_history.append((gesture, final_confidence))
            if len(self.gesture_history) > self.max_history:
                self.gesture_history.pop(0)
            
            # Apply temporal smoothing
            smoothed_gesture, smoothed_confidence = self._temporal_smoothing()
            
            return smoothed_gesture, smoothed_confidence
            
        except Exception as e:
            logger.error(f"Error classifying gesture: {e}")
            return GestureType.UNKNOWN, 0.0
    
    def _classify_by_finger_count(self, finger_count: int, area: int) -> Tuple[GestureType, float]:
        """Classify gesture based on finger count and hand area"""
        try:
            # Normalize area (assuming typical hand area is 10000-50000 pixels)
            normalized_area = min(max(area / 30000, 0.3), 1.0)
            
            if finger_count == 0:
                # No fingers visible - likely a fist
                return GestureType.FIST, 0.9 * normalized_area
            
            elif finger_count == 1:
                # One finger - pointing gesture
                return GestureType.POINTING, 0.8 * normalized_area
            
            elif finger_count == 2:
                # Two fingers - peace sign or emergency
                return GestureType.TWO_FINGERS, 0.8 * normalized_area
            
            elif finger_count == 3:
                # Three fingers - stop gesture
                return GestureType.STOP_GESTURE, 0.7 * normalized_area
            
            elif finger_count == 4:
                # Four fingers - wave gesture
                return GestureType.WAVE, 0.7 * normalized_area
            
            elif finger_count == 5:
                # Five fingers - open hand
                return GestureType.OPEN_HAND, 0.9 * normalized_area
            
            else:
                # Unusual finger count
                return GestureType.UNKNOWN, 0.3
            
        except Exception as e:
            logger.error(f"Error in finger count classification: {e}")
            return GestureType.UNKNOWN, 0.0
    
    def _temporal_smoothing(self) -> Tuple[GestureType, float]:
        """Apply temporal smoothing to reduce noise"""
        try:
            if not self.gesture_history:
                return GestureType.UNKNOWN, 0.0
            
            # Count occurrences of each gesture
            gesture_counts = {}
            total_confidence = 0.0
            
            for gesture, confidence in self.gesture_history:
                if gesture not in gesture_counts:
                    gesture_counts[gesture] = {'count': 0, 'confidence_sum': 0.0}
                gesture_counts[gesture]['count'] += 1
                gesture_counts[gesture]['confidence_sum'] += confidence
                total_confidence += confidence
            
            # Find most frequent gesture
            most_frequent = max(gesture_counts.items(), key=lambda x: x[1]['count'])
            gesture, data = most_frequent
            
            # Calculate average confidence
            avg_confidence = data['confidence_sum'] / data['count']
            
            return gesture, avg_confidence
            
        except Exception as e:
            logger.error(f"Error in temporal smoothing: {e}")
            return GestureType.UNKNOWN, 0.0
    
    def reset_history(self):
        """Reset gesture history"""
        self.gesture_history = []
        logger.debug("Gesture history reset")

class GestureEvent:
    """Represents a gesture detection event"""
    
    def __init__(self, gesture_type: GestureType, confidence: float, 
                 handedness: str, timestamp: float, finger_count: int):
        self.gesture_type = gesture_type
        self.confidence = confidence
        self.handedness = handedness
        self.timestamp = timestamp
        self.finger_count = finger_count
        self.action = self._get_action_description(gesture_type)
    
    def _get_action_description(self, gesture_type: GestureType) -> str:
        """Get action description for gesture"""
        actions = {
            GestureType.OPEN_HAND: "Start listening",
            GestureType.FIST: "Stop listening",
            GestureType.TWO_FINGERS: "Emergency",
            GestureType.THUMBS_UP: "Yes/Confirm",
            GestureType.THUMBS_DOWN: "No/Cancel",
            GestureType.POINTING: "Direction/Selection",
            GestureType.WAVE: "Hello/Goodbye",
            GestureType.STOP_GESTURE: "Halt action"
        }
        return actions.get(gesture_type, "Unknown action")

def test_gesture_classification() -> bool:
    """Test gesture classification with sample data"""
    try:
        classifier = OpenCVGestureClassifier()
        
        # Test different finger counts
        test_cases = [
            (0, 25000, "Fist"),
            (1, 20000, "Pointing"),
            (2, 30000, "Two fingers"),
            (3, 35000, "Stop gesture"),
            (4, 40000, "Wave"),
            (5, 45000, "Open hand")
        ]
        
        logger.info("Testing OpenCV gesture classification...")
        
        for finger_count, area, expected in test_cases:
            hand_data = {
                'finger_count': finger_count,
                'area': area,
                'confidence': 0.8,
                'center': (320, 240),
                'bbox': (100, 100, 200, 200)
            }
            
            gesture, confidence = classifier.classify_gesture(hand_data)
            logger.info(f"Finger count {finger_count}: {gesture.value} "
                       f"(confidence: {confidence:.2f}) - Expected: {expected}")
        
        logger.info("OpenCV gesture classification test completed")
        return True
        
    except Exception as e:
        logger.error(f"OpenCV gesture classification test failed: {e}")
        return False
