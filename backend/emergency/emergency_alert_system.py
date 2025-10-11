"""
Emergency Alert System for VOICE2EYE
Main system integrating location, triggers, and messaging
"""
import logging
import time
import threading
from typing import Optional, Dict, Any, List, Callable
from dataclasses import dataclass

from .location_services import LocationService, LocationData
from .emergency_triggers import EmergencyTriggerSystem, EmergencyEvent, EmergencyType
from .message_sender import MessageSender, MessageResult

logger = logging.getLogger(__name__)

@dataclass
class EmergencyAlert:
    """Emergency alert data"""
    alert_id: str
    trigger_type: EmergencyType
    location: Optional[LocationData]
    timestamp: float
    confirmed: bool
    messages_sent: List[MessageResult]
    status: str  # 'pending', 'confirmed', 'cancelled', 'completed'

class EmergencyAlertSystem:
    """Main emergency alert system"""
    
    def __init__(self):
        self.location_service = LocationService()
        self.trigger_system = EmergencyTriggerSystem()
        self.message_sender = MessageSender()
        
        self.is_active = False
        self.current_alert: Optional[EmergencyAlert] = None
        self.alert_history: List[EmergencyAlert] = []
        
        # Callbacks
        self.on_alert_triggered: Optional[Callable] = None
        self.on_alert_confirmed: Optional[Callable] = None
        self.on_alert_cancelled: Optional[Callable] = None
        self.on_messages_sent: Optional[Callable] = None
        
        # Initialize
        self._setup_trigger_callbacks()
    
    def _setup_trigger_callbacks(self):
        """Setup emergency trigger callbacks"""
        try:
            self.trigger_system.set_callbacks(
                on_emergency=self._handle_emergency_trigger,
                on_confirmation=self._handle_emergency_confirmation,
                on_cancellation=self._handle_emergency_cancellation
            )
            logger.info("Emergency trigger callbacks configured")
            
        except Exception as e:
            logger.error(f"Error setting up trigger callbacks: {e}")
    
    def set_callbacks(self, on_alert_triggered: Optional[Callable] = None,
                     on_alert_confirmed: Optional[Callable] = None,
                     on_alert_cancelled: Optional[Callable] = None,
                     on_messages_sent: Optional[Callable] = None):
        """Set emergency alert callbacks"""
        self.on_alert_triggered = on_alert_triggered
        self.on_alert_confirmed = on_alert_confirmed
        self.on_alert_cancelled = on_alert_cancelled
        self.on_messages_sent = on_messages_sent
    
    def start(self) -> bool:
        """Start the emergency alert system"""
        try:
            if self.is_active:
                logger.warning("Emergency alert system already active")
                return True
            
            logger.info("Starting Emergency Alert System...")
            
            # Test location service
            location = self.location_service.get_current_location()
            if location:
                logger.info(f"Location service ready: {self.location_service.get_location_summary(location)}")
            else:
                logger.warning("Location service not available")
            
            # Test message sender
            logger.info("Message sender ready")
            
            self.is_active = True
            logger.info("Emergency Alert System started successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error starting emergency alert system: {e}")
            return False
    
    def stop(self):
        """Stop the emergency alert system"""
        try:
            self.is_active = False
            logger.info("Emergency Alert System stopped")
            
        except Exception as e:
            logger.error(f"Error stopping emergency alert system: {e}")
    
    def trigger_voice_emergency(self, text: str, confidence: float) -> bool:
        """Trigger emergency from voice input"""
        try:
            return self.trigger_system.trigger_voice_emergency(text, confidence)
        except Exception as e:
            logger.error(f"Error in voice emergency trigger: {e}")
            return False
    
    def trigger_gesture_emergency(self, gesture_data: Dict[str, Any]) -> bool:
        """Trigger emergency from gesture input"""
        try:
            return self.trigger_system.trigger_gesture_emergency(gesture_data)
        except Exception as e:
            logger.error(f"Error in gesture emergency trigger: {e}")
            return False
    
    def trigger_manual_emergency(self) -> bool:
        """Trigger manual emergency"""
        try:
            return self.trigger_system.trigger_manual_emergency()
        except Exception as e:
            logger.error(f"Error in manual emergency trigger: {e}")
            return False
    
    def confirm_emergency(self):
        """Confirm emergency"""
        try:
            self.trigger_system.confirm_emergency()
        except Exception as e:
            logger.error(f"Error confirming emergency: {e}")
    
    def cancel_emergency(self):
        """Cancel emergency"""
        try:
            self.trigger_system.cancel_emergency()
        except Exception as e:
            logger.error(f"Error cancelling emergency: {e}")
    
    def _handle_emergency_trigger(self, event: EmergencyEvent):
        """Handle emergency trigger"""
        try:
            logger.warning("EMERGENCY ALERT TRIGGERED!")
            logger.warning(f"Type: {event.emergency_type.value}")
            logger.warning(f"Data: {event.trigger_data}")
            logger.warning(f"Confidence: {event.confidence:.2f}")
            
            # Get current location
            location = self.location_service.get_current_location()
            if location:
                logger.info(f"Location: {self.location_service.get_location_summary(location)}")
            else:
                logger.warning("Could not determine location")
            
            # Create emergency alert
            alert_id = f"emergency_{int(time.time())}"
            self.current_alert = EmergencyAlert(
                alert_id=alert_id,
                trigger_type=event.emergency_type,
                location=location,
                timestamp=event.timestamp,
                confirmed=False,
                messages_sent=[],
                status="pending"
            )
            
            # Call alert triggered callback
            if self.on_alert_triggered:
                self.on_alert_triggered(self.current_alert)
            
            logger.warning("Emergency alert created - waiting for confirmation...")
            
        except Exception as e:
            logger.error(f"Error handling emergency trigger: {e}")
    
    def _handle_emergency_confirmation(self, event: EmergencyEvent):
        """Handle emergency confirmation"""
        try:
            logger.warning("EMERGENCY CONFIRMED - Sending alert messages!")
            
            if not self.current_alert:
                logger.error("No current alert to confirm")
                return
            
            # Update alert status
            self.current_alert.confirmed = True
            self.current_alert.status = "confirmed"
            
            # Send emergency messages
            location_data = None
            if self.current_alert.location:
                location_data = {
                    "address": self.current_alert.location.address,
                    "city": self.current_alert.location.city,
                    "country": self.current_alert.location.country,
                    "latitude": self.current_alert.location.latitude,
                    "longitude": self.current_alert.location.longitude
                }
            
            # Send messages
            message_results = self.message_sender.send_emergency_message(
                location_data=location_data,
                trigger_type=event.emergency_type.value
            )
            
            # Update alert with message results
            self.current_alert.messages_sent = message_results
            
            # Log results
            successful_messages = sum(1 for r in message_results if r.success)
            logger.warning(f"Emergency messages sent: {successful_messages}/{len(message_results)} successful")
            
            # Add to history
            self.alert_history.append(self.current_alert)
            
            # Call confirmation callback
            if self.on_alert_confirmed:
                self.on_alert_confirmed(self.current_alert)
            
            # Call messages sent callback
            if self.on_messages_sent:
                self.on_messages_sent(message_results)
            
            logger.warning("Emergency alert protocol completed")
            
        except Exception as e:
            logger.error(f"Error handling emergency confirmation: {e}")
    
    def _handle_emergency_cancellation(self, event: EmergencyEvent):
        """Handle emergency cancellation"""
        try:
            logger.info("Emergency cancelled by user")
            
            if self.current_alert:
                self.current_alert.status = "cancelled"
                self.alert_history.append(self.current_alert)
            
            # Call cancellation callback
            if self.on_alert_cancelled:
                self.on_alert_cancelled(self.current_alert)
            
            self.current_alert = None
            
        except Exception as e:
            logger.error(f"Error handling emergency cancellation: {e}")
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get emergency alert system status"""
        try:
            trigger_status = self.trigger_system.get_emergency_status()
            
            return {
                "system_active": self.is_active,
                "current_alert": self.current_alert.alert_id if self.current_alert else None,
                "alert_status": self.current_alert.status if self.current_alert else None,
                "trigger_active": trigger_status.get("is_active", False),
                "location_available": self.location_service.get_current_location() is not None,
                "total_alerts": len(self.alert_history),
                "contacts_configured": len(self.message_sender.contacts)
            }
            
        except Exception as e:
            logger.error(f"Error getting system status: {e}")
            return {"system_active": False, "error": str(e)}
    
    def get_alert_history(self) -> List[Dict[str, Any]]:
        """Get emergency alert history"""
        try:
            history = []
            for alert in self.alert_history:
                history.append({
                    "alert_id": alert.alert_id,
                    "trigger_type": alert.trigger_type.value,
                    "timestamp": alert.timestamp,
                    "location": self.location_service.get_location_summary(alert.location) if alert.location else "Unknown",
                    "confirmed": alert.confirmed,
                    "status": alert.status,
                    "messages_sent": len(alert.messages_sent),
                    "successful_messages": sum(1 for r in alert.messages_sent if r.success)
                })
            
            return history
            
        except Exception as e:
            logger.error(f"Error getting alert history: {e}")
            return []

def test_emergency_alert_system() -> bool:
    """Test complete emergency alert system"""
    try:
        logger.info("Testing Emergency Alert System...")
        
        # Create system
        alert_system = EmergencyAlertSystem()
        
        # Set up test callbacks
        def on_alert_triggered(alert: EmergencyAlert):
            logger.info(f"Alert triggered: {alert.alert_id}")
        
        def on_alert_confirmed(alert: EmergencyAlert):
            logger.info(f"Alert confirmed: {alert.alert_id}")
        
        def on_alert_cancelled(alert: EmergencyAlert):
            logger.info(f"Alert cancelled: {alert.alert_id}")
        
        def on_messages_sent(results: List[MessageResult]):
            logger.info(f"Messages sent: {len(results)} results")
        
        alert_system.set_callbacks(on_alert_triggered, on_alert_confirmed, on_alert_cancelled, on_messages_sent)
        
        # Start system
        if not alert_system.start():
            logger.error("Failed to start emergency alert system")
            return False
        
        # Test voice emergency
        logger.info("Testing voice emergency...")
        voice_result = alert_system.trigger_voice_emergency("help me", 0.9)
        logger.info(f"Voice emergency result: {voice_result}")
        
        # Test gesture emergency
        logger.info("Testing gesture emergency...")
        gesture_data = {"gesture_type": "two_fingers", "confidence": 0.8}
        gesture_result = alert_system.trigger_gesture_emergency(gesture_data)
        logger.info(f"Gesture emergency result: {gesture_result}")
        
        # Test manual emergency
        logger.info("Testing manual emergency...")
        manual_result = alert_system.trigger_manual_emergency()
        logger.info(f"Manual emergency result: {manual_result}")
        
        # Get system status
        status = alert_system.get_system_status()
        logger.info(f"System status: {status}")
        
        # Stop system
        alert_system.stop()
        
        logger.info("Emergency Alert System test completed")
        return True
        
    except Exception as e:
        logger.error(f"Emergency Alert System test failed: {e}")
        return False

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    # Test emergency alert system
    test_emergency_alert_system()
