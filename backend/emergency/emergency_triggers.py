"""
Emergency Trigger System for VOICE2EYE
Handles voice, gesture, and manual emergency triggers
"""
import logging
import time
import threading
from typing import Optional, Callable, Dict, Any, List
from enum import Enum
from dataclasses import dataclass

logger = logging.getLogger(__name__)

class EmergencyType(Enum):
    """Types of emergency triggers"""
    VOICE = "voice"
    GESTURE = "gesture"
    MANUAL = "manual"
    TIMEOUT = "timeout"

@dataclass
class EmergencyEvent:
    """Emergency event data"""
    emergency_type: EmergencyType
    trigger_data: str
    timestamp: float
    confidence: float
    location_data: Optional[Dict] = None

class EmergencyTriggerSystem:
    """Emergency trigger detection and management"""
    
    def __init__(self):
        self.is_active = False
        self.emergency_timeout = 30.0  # 30 seconds
        self.confirmation_timeout = 10.0  # 10 seconds
        self.emergency_keywords = ["help", "emergency", "sos", "assist", "urgent", "danger"]
        
        # State tracking
        self.emergency_start_time: Optional[float] = None
        self.emergency_confirmed = False
        self.emergency_cancelled = False
        
        # Callbacks
        self.on_emergency_callback: Optional[Callable] = None
        self.on_confirmation_callback: Optional[Callable] = None
        self.on_cancellation_callback: Optional[Callable] = None
        
        # Threading
        self.emergency_thread: Optional[threading.Thread] = None
        self.stop_event = threading.Event()
        
    def set_callbacks(self, on_emergency: Optional[Callable] = None,
                     on_confirmation: Optional[Callable] = None,
                     on_cancellation: Optional[Callable] = None):
        """Set emergency callbacks"""
        self.on_emergency_callback = on_emergency
        self.on_confirmation_callback = on_confirmation
        self.on_cancellation_callback = on_cancellation
    
    def trigger_voice_emergency(self, text: str, confidence: float) -> bool:
        """Trigger emergency from voice input"""
        try:
            text_lower = text.lower().strip()
            
            # Check for emergency keywords
            for keyword in self.emergency_keywords:
                if keyword in text_lower:
                    logger.warning(f"Voice emergency detected: '{text}' (confidence: {confidence:.2f})")
                    
                    event = EmergencyEvent(
                        emergency_type=EmergencyType.VOICE,
                        trigger_data=text,
                        timestamp=time.time(),
                        confidence=confidence
                    )
                    
                    self._handle_emergency_trigger(event)
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error in voice emergency trigger: {e}")
            return False
    
    def trigger_gesture_emergency(self, gesture_data: Dict[str, Any]) -> bool:
        """Trigger emergency from gesture input"""
        try:
            # Check for emergency gesture (two fingers)
            if gesture_data.get('gesture_type') == 'two_fingers':
                confidence = gesture_data.get('confidence', 0.0)
                
                logger.warning(f"Gesture emergency detected: {gesture_data}")
                
                event = EmergencyEvent(
                    emergency_type=EmergencyType.GESTURE,
                    trigger_data=f"Two fingers gesture (confidence: {confidence:.2f})",
                    timestamp=time.time(),
                    confidence=confidence
                )
                
                self._handle_emergency_trigger(event)
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error in gesture emergency trigger: {e}")
            return False
    
    def trigger_manual_emergency(self) -> bool:
        """Trigger manual emergency (button press)"""
        try:
            logger.warning("Manual emergency triggered")
            
            event = EmergencyEvent(
                emergency_type=EmergencyType.MANUAL,
                trigger_data="Manual emergency button pressed",
                timestamp=time.time(),
                confidence=1.0
            )
            
            self._handle_emergency_trigger(event)
            return True
            
        except Exception as e:
            logger.error(f"Error in manual emergency trigger: {e}")
            return False
    
    def _handle_emergency_trigger(self, event: EmergencyEvent):
        """Handle emergency trigger with confirmation system"""
        try:
            if self.is_active:
                logger.info("Emergency already active, ignoring new trigger")
                return
            
            self.is_active = True
            self.emergency_start_time = time.time()
            self.emergency_confirmed = False
            self.emergency_cancelled = False
            
            logger.warning(f"EMERGENCY TRIGGERED: {event.emergency_type.value}")
            logger.warning(f"Trigger data: {event.trigger_data}")
            logger.warning(f"Confidence: {event.confidence:.2f}")
            
            # Start emergency confirmation process
            self._start_emergency_confirmation(event)
            
        except Exception as e:
            logger.error(f"Error handling emergency trigger: {e}")
    
    def _start_emergency_confirmation(self, event: EmergencyEvent):
        """Start emergency confirmation process"""
        try:
            # Call emergency callback
            if self.on_emergency_callback:
                self.on_emergency_callback(event)
            
            # Start confirmation thread
            self.emergency_thread = threading.Thread(
                target=self._emergency_confirmation_loop,
                args=(event,),
                daemon=True
            )
            self.emergency_thread.start()
            
        except Exception as e:
            logger.error(f"Error starting emergency confirmation: {e}")
    
    def _emergency_confirmation_loop(self, event: EmergencyEvent):
        """Emergency confirmation loop with timeout"""
        try:
            logger.info("Emergency confirmation started - waiting for confirmation...")
            
            # Wait for confirmation or timeout
            start_time = time.time()
            while not self.stop_event.is_set():
                current_time = time.time()
                elapsed = current_time - start_time
                
                # Check for confirmation
                if self.emergency_confirmed:
                    logger.warning("Emergency CONFIRMED - proceeding with emergency protocol")
                    if self.on_confirmation_callback:
                        self.on_confirmation_callback(event)
                    break
                
                # Check for cancellation
                if self.emergency_cancelled:
                    logger.info("Emergency CANCELLED by user")
                    if self.on_cancellation_callback:
                        self.on_cancellation_callback(event)
                    break
                
                # Check for timeout
                if elapsed >= self.confirmation_timeout:
                    logger.warning("Emergency confirmation TIMEOUT - proceeding automatically")
                    if self.on_confirmation_callback:
                        self.on_confirmation_callback(event)
                    break
                
                time.sleep(0.1)
            
        except Exception as e:
            logger.error(f"Error in emergency confirmation loop: {e}")
        finally:
            self._reset_emergency_state()
    
    def confirm_emergency(self):
        """Confirm emergency (user confirms they need help)"""
        try:
            if self.is_active and not self.emergency_confirmed:
                self.emergency_confirmed = True
                logger.info("Emergency confirmed by user")
            else:
                logger.warning("No active emergency to confirm")
                
        except Exception as e:
            logger.error(f"Error confirming emergency: {e}")
    
    def cancel_emergency(self):
        """Cancel emergency (user cancels the emergency)"""
        try:
            if self.is_active and not self.emergency_cancelled:
                self.emergency_cancelled = True
                logger.info("Emergency cancelled by user")
            else:
                logger.warning("No active emergency to cancel")
                
        except Exception as e:
            logger.error(f"Error cancelling emergency: {e}")
    
    def _reset_emergency_state(self):
        """Reset emergency state"""
        try:
            self.is_active = False
            self.emergency_start_time = None
            self.emergency_confirmed = False
            self.emergency_cancelled = False
            self.stop_event.clear()
            
            logger.info("Emergency state reset")
            
        except Exception as e:
            logger.error(f"Error resetting emergency state: {e}")
    
    def get_emergency_status(self) -> Dict[str, Any]:
        """Get current emergency status"""
        try:
            return {
                "is_active": self.is_active,
                "emergency_start_time": self.emergency_start_time,
                "emergency_confirmed": self.emergency_confirmed,
                "emergency_cancelled": self.emergency_cancelled,
                "elapsed_time": time.time() - self.emergency_start_time if self.emergency_start_time else 0
            }
        except Exception as e:
            logger.error(f"Error getting emergency status: {e}")
            return {"is_active": False}

def test_emergency_triggers() -> bool:
    """Test emergency trigger system"""
    try:
        logger.info("Testing emergency trigger system...")
        
        trigger_system = EmergencyTriggerSystem()
        
        # Set up test callbacks
        def on_emergency(event: EmergencyEvent):
            logger.info(f"Emergency triggered: {event.emergency_type.value}")
        
        def on_confirmation(event: EmergencyEvent):
            logger.info("Emergency confirmed")
        
        def on_cancellation(event: EmergencyEvent):
            logger.info("Emergency cancelled")
        
        trigger_system.set_callbacks(on_emergency, on_confirmation, on_cancellation)
        
        # Test voice emergency
        logger.info("Testing voice emergency...")
        voice_result = trigger_system.trigger_voice_emergency("help me", 0.9)
        logger.info(f"Voice emergency result: {voice_result}")
        
        # Test gesture emergency
        logger.info("Testing gesture emergency...")
        gesture_data = {"gesture_type": "two_fingers", "confidence": 0.8}
        gesture_result = trigger_system.trigger_gesture_emergency(gesture_data)
        logger.info(f"Gesture emergency result: {gesture_result}")
        
        # Test manual emergency
        logger.info("Testing manual emergency...")
        manual_result = trigger_system.trigger_manual_emergency()
        logger.info(f"Manual emergency result: {manual_result}")
        
        logger.info("Emergency trigger system test completed")
        return True
        
    except Exception as e:
        logger.error(f"Emergency trigger system test failed: {e}")
        return False

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    # Test emergency triggers
    test_emergency_triggers()
