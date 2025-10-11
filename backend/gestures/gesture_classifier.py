"""
Gesture Classification for VOICE2EYE
Rule-based gesture recognition using MediaPipe hand landmarks
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

class GestureClassifier:
    """Rule-based gesture classifier using MediaPipe landmarks"""
    
    def __init__(self):
        self.confidence_threshold = 0.7
        self.gesture_history = []
        self.max_history = 10
        
    def classify_gesture(self, landmarks: List[Dict]) -> Tuple[GestureType, float]:
        """Classify gesture from hand landmarks"""
        try:
            if not landmarks or len(landmarks) < 21:
                return GestureType.UNKNOWN, 0.0
            
            # Convert landmarks to numpy array for easier calculation
            points = np.array([[lm['x'], lm['y']] for lm in landmarks])
            
            # Calculate gesture features
            features = self._calculate_features(points)
            
            # Classify based on features
            gesture, confidence = self._rule_based_classification(features)
            
            # Add to history for smoothing
            self.gesture_history.append((gesture, confidence))
            if len(self.gesture_history) > self.max_history:
                self.gesture_history.pop(0)
            
            # Apply temporal smoothing
            smoothed_gesture, smoothed_confidence = self._temporal_smoothing()
            
            return smoothed_gesture, smoothed_confidence
            
        except Exception as e:
            logger.error(f"Error classifying gesture: {e}")
            return GestureType.UNKNOWN, 0.0
    
    def _calculate_features(self, points: np.ndarray) -> Dict[str, Any]:
        """Calculate features from hand landmarks"""
        try:
            # MediaPipe hand landmark indices
            # Thumb: 0, 1, 2, 3, 4
            # Index: 5, 6, 7, 8
            # Middle: 9, 10, 11, 12
            # Ring: 13, 14, 15, 16
            # Pinky: 17, 18, 19, 20
            
            features = {}
            
            # Thumb features
            thumb_tip = points[4]
            thumb_ip = points[3]
            thumb_mcp = points[2]
            thumb_cmc = points[1]
            
            # Finger tips
            index_tip = points[8]
            middle_tip = points[12]
            ring_tip = points[16]
            pinky_tip = points[20]
            
            # Finger MCPs (knuckles)
            index_mcp = points[5]
            middle_mcp = points[9]
            ring_mcp = points[13]
            pinky_mcp = points[17]
            
            # Palm center (approximate)
            palm_center = np.mean([points[0], points[5], points[9], points[13], points[17]], axis=0)
            
            # Calculate finger extensions
            features['thumb_extended'] = self._is_finger_extended(thumb_tip, thumb_ip, thumb_mcp, palm_center)
            features['index_extended'] = self._is_finger_extended(index_tip, points[7], points[6], index_mcp)
            features['middle_extended'] = self._is_finger_extended(middle_tip, points[11], points[10], middle_mcp)
            features['ring_extended'] = self._is_finger_extended(ring_tip, points[15], points[14], ring_mcp)
            features['pinky_extended'] = self._is_finger_extended(pinky_tip, points[19], points[18], pinky_mcp)
            
            # Calculate distances
            features['thumb_index_distance'] = np.linalg.norm(thumb_tip - index_tip)
            features['index_middle_distance'] = np.linalg.norm(index_tip - middle_tip)
            features['middle_ring_distance'] = np.linalg.norm(middle_tip - ring_tip)
            features['ring_pinky_distance'] = np.linalg.norm(ring_tip - pinky_tip)
            
            # Hand orientation
            features['hand_angle'] = self._calculate_hand_angle(points)
            
            # Palm area (approximate)
            features['palm_area'] = self._calculate_palm_area(points)
            
            return features
            
        except Exception as e:
            logger.error(f"Error calculating features: {e}")
            return {}
    
    def _is_finger_extended(self, tip: np.ndarray, dip: np.ndarray, pip: np.ndarray, mcp: np.ndarray) -> bool:
        """Check if a finger is extended"""
        try:
            # Calculate angles between finger segments
            vec1 = tip - dip
            vec2 = dip - pip
            vec3 = pip - mcp
            
            # Check if finger is straight (angle close to 180 degrees)
            angle1 = self._angle_between_vectors(vec1, vec2)
            angle2 = self._angle_between_vectors(vec2, vec3)
            
            # Finger is extended if both angles are close to 180 degrees
            return angle1 > 150 and angle2 > 150
            
        except Exception as e:
            logger.error(f"Error checking finger extension: {e}")
            return False
    
    def _angle_between_vectors(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calculate angle between two vectors in degrees"""
        try:
            cos_angle = np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
            cos_angle = np.clip(cos_angle, -1.0, 1.0)  # Avoid numerical errors
            angle = np.arccos(cos_angle)
            return np.degrees(angle)
        except:
            return 0.0
    
    def _calculate_hand_angle(self, points: np.ndarray) -> float:
        """Calculate hand orientation angle"""
        try:
            # Use middle finger direction as hand orientation
            middle_tip = points[12]
            middle_mcp = points[9]
            direction = middle_tip - middle_mcp
            angle = np.degrees(np.arctan2(direction[1], direction[0]))
            return angle
        except:
            return 0.0
    
    def _calculate_palm_area(self, points: np.ndarray) -> float:
        """Calculate approximate palm area"""
        try:
            # Use MCP points to approximate palm area
            mcp_points = points[[5, 9, 13, 17]]
            # Simple area calculation using shoelace formula
            area = 0.5 * abs(sum((mcp_points[i][0] * mcp_points[(i+1)%4][1] - 
                                 mcp_points[(i+1)%4][0] * mcp_points[i][1]) 
                                for i in range(4)))
            return area
        except:
            return 0.0
    
    def _rule_based_classification(self, features: Dict[str, Any]) -> Tuple[GestureType, float]:
        """Classify gesture using rule-based approach"""
        try:
            if not features:
                return GestureType.UNKNOWN, 0.0
            
            # Count extended fingers
            extended_fingers = sum([
                features.get('thumb_extended', False),
                features.get('index_extended', False),
                features.get('middle_extended', False),
                features.get('ring_extended', False),
                features.get('pinky_extended', False)
            ])
            
            # Rule-based classification
            if extended_fingers == 5:
                # All fingers extended - Open hand
                return GestureType.OPEN_HAND, 0.9
            
            elif extended_fingers == 0:
                # No fingers extended - Fist
                return GestureType.FIST, 0.9
            
            elif extended_fingers == 2:
                # Two fingers extended
                if (features.get('index_extended', False) and 
                    features.get('middle_extended', False)):
                    return GestureType.TWO_FINGERS, 0.8
                elif (features.get('thumb_extended', False) and 
                      features.get('index_extended', False)):
                    return GestureType.POINTING, 0.7
            
            elif extended_fingers == 1:
                # One finger extended
                if features.get('thumb_extended', False):
                    # Check thumb direction for thumbs up/down
                    hand_angle = features.get('hand_angle', 0)
                    if -45 <= hand_angle <= 45:  # Thumb pointing up
                        return GestureType.THUMBS_UP, 0.8
                    elif 135 <= hand_angle <= 225:  # Thumb pointing down
                        return GestureType.THUMBS_DOWN, 0.8
                elif features.get('index_extended', False):
                    return GestureType.POINTING, 0.7
            
            elif extended_fingers == 4:
                # Four fingers extended (thumb not extended) - Wave
                if not features.get('thumb_extended', False):
                    return GestureType.WAVE, 0.7
            
            elif extended_fingers == 3:
                # Three fingers extended - Stop gesture
                return GestureType.STOP_GESTURE, 0.6
            
            # Default to unknown
            return GestureType.UNKNOWN, 0.3
            
        except Exception as e:
            logger.error(f"Error in rule-based classification: {e}")
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

def test_gesture_classification() -> bool:
    """Test gesture classification with sample data"""
    try:
        classifier = GestureClassifier()
        
        # Create sample landmarks for open hand (all fingers extended)
        sample_landmarks = []
        for i in range(21):
            sample_landmarks.append({
                'x': 0.5 + i * 0.01,
                'y': 0.5 + i * 0.01,
                'z': 0.0
            })
        
        gesture, confidence = classifier.classify_gesture(sample_landmarks)
        
        logger.info(f"Test gesture classification: {gesture.value} (confidence: {confidence:.2f})")
        return True
        
    except Exception as e:
        logger.error(f"Gesture classification test failed: {e}")
        return False
