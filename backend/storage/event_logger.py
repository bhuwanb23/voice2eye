"""
Event logging system for VOICE2EYE
Handles logging of voice commands, gestures, emergencies, and system events
"""
import logging
import time
import uuid
import json
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from pathlib import Path

from .database import DatabaseManager
from .models import Event, EventType, PerformanceMetric, Session

logger = logging.getLogger(__name__)

class EventLogger:
    """Event logging service for VOICE2EYE"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
        self.current_session_id: Optional[str] = None
        self.session_start_time: Optional[float] = None
        self.event_count = 0
        
    def start_session(self, user_id: Optional[str] = None) -> str:
        """Start a new logging session"""
        try:
            self.current_session_id = str(uuid.uuid4())
            self.session_start_time = time.time()
            self.event_count = 0
            
            # Create session record
            session = Session(
                session_id=self.current_session_id,
                start_time=self.session_start_time,
                user_id=user_id
            )
            
            with self.db_manager.get_cursor() as cursor:
                cursor.execute("""
                    INSERT INTO sessions (id, start_time, end_time, duration, event_count, user_id)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    session.session_id,
                    session.start_time,
                    session.end_time,
                    session.duration,
                    session.event_count,
                    session.user_id
                ))
            
            # Log session start event
            self.log_event(EventType.SYSTEM_START, {
                "session_id": self.current_session_id,
                "user_id": user_id
            })
            
            logger.info(f"Started logging session: {self.current_session_id}")
            return self.current_session_id
            
        except Exception as e:
            logger.error(f"Error starting session: {e}")
            return None
    
    def end_session(self):
        """End the current logging session"""
        try:
            if not self.current_session_id:
                logger.warning("No active session to end")
                return
            
            end_time = time.time()
            duration = end_time - self.session_start_time if self.session_start_time else 0
            
            # Update session record
            with self.db_manager.get_cursor() as cursor:
                cursor.execute("""
                    UPDATE sessions 
                    SET end_time = ?, duration = ?, event_count = ?
                    WHERE id = ?
                """, (end_time, duration, self.event_count, self.current_session_id))
            
            # Log session end event
            self.log_event(EventType.SYSTEM_STOP, {
                "session_id": self.current_session_id,
                "duration": duration,
                "event_count": self.event_count
            })
            
            logger.info(f"Ended logging session: {self.current_session_id} (duration: {duration:.2f}s, events: {self.event_count})")
            
            # Reset session
            self.current_session_id = None
            self.session_start_time = None
            self.event_count = 0
            
        except Exception as e:
            logger.error(f"Error ending session: {e}")
    
    def log_event(self, event_type: EventType, event_data: Dict[str, Any], 
                  confidence: Optional[float] = None, user_id: Optional[str] = None) -> bool:
        """Log an event to the database"""
        try:
            event = Event(
                event_type=event_type,
                event_data=event_data,
                timestamp=time.time(),
                confidence=confidence,
                session_id=self.current_session_id,
                user_id=user_id
            )
            
            with self.db_manager.get_cursor() as cursor:
                cursor.execute("""
                    INSERT INTO events (event_type, event_data, timestamp, confidence, session_id, user_id)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    event.event_type.value,
                    json.dumps(event.event_data),
                    event.timestamp,
                    event.confidence,
                    event.session_id,
                    event.user_id
                ))
            
            self.event_count += 1
            
            # Log to console for debugging
            logger.debug(f"Logged event: {event_type.value} - {event_data}")
            return True
            
        except Exception as e:
            logger.error(f"Error logging event: {e}")
            return False
    
    def log_voice_command(self, command: str, text: str, confidence: float, 
                         user_id: Optional[str] = None) -> bool:
        """Log a voice command event"""
        return self.log_event(
            EventType.VOICE_COMMAND,
            {
                "command": command,
                "text": text,
                "timestamp": time.time()
            },
            confidence=confidence,
            user_id=user_id
        )
    
    def log_gesture_detected(self, gesture_type: str, confidence: float, 
                           gesture_data: Dict[str, Any], user_id: Optional[str] = None) -> bool:
        """Log a gesture detection event"""
        return self.log_event(
            EventType.GESTURE_DETECTED,
            {
                "gesture_type": gesture_type,
                "gesture_data": gesture_data,
                "timestamp": time.time()
            },
            confidence=confidence,
            user_id=user_id
        )
    
    def log_emergency_triggered(self, trigger_type: str, trigger_data: Dict[str, Any], 
                               confidence: float, user_id: Optional[str] = None) -> bool:
        """Log an emergency trigger event"""
        return self.log_event(
            EventType.EMERGENCY_TRIGGERED,
            {
                "trigger_type": trigger_type,
                "trigger_data": trigger_data,
                "timestamp": time.time()
            },
            confidence=confidence,
            user_id=user_id
        )
    
    def log_emergency_confirmed(self, alert_id: str, location_data: Optional[Dict[str, Any]] = None,
                               user_id: Optional[str] = None) -> bool:
        """Log an emergency confirmation event"""
        return self.log_event(
            EventType.EMERGENCY_CONFIRMED,
            {
                "alert_id": alert_id,
                "location_data": location_data,
                "timestamp": time.time()
            },
            user_id=user_id
        )
    
    def log_emergency_cancelled(self, alert_id: str, user_id: Optional[str] = None) -> bool:
        """Log an emergency cancellation event"""
        return self.log_event(
            EventType.EMERGENCY_CANCELLED,
            {
                "alert_id": alert_id,
                "timestamp": time.time()
            },
            user_id=user_id
        )
    
    def log_message_sent(self, message_type: str, recipient: str, success: bool,
                        message_id: Optional[str] = None, user_id: Optional[str] = None) -> bool:
        """Log a message sending event"""
        return self.log_event(
            EventType.MESSAGE_SENT,
            {
                "message_type": message_type,
                "recipient": recipient,
                "success": success,
                "message_id": message_id,
                "timestamp": time.time()
            },
            user_id=user_id
        )
    
    def log_location_detected(self, location_data: Dict[str, Any], 
                             accuracy: float, user_id: Optional[str] = None) -> bool:
        """Log a location detection event"""
        return self.log_event(
            EventType.LOCATION_DETECTED,
            {
                "location_data": location_data,
                "accuracy": accuracy,
                "timestamp": time.time()
            },
            user_id=user_id
        )
    
    def log_performance_metric(self, metric_name: str, metric_value: float, 
                              metric_unit: Optional[str] = None, user_id: Optional[str] = None) -> bool:
        """Log a performance metric"""
        try:
            metric = PerformanceMetric(
                metric_name=metric_name,
                metric_value=metric_value,
                metric_unit=metric_unit,
                session_id=self.current_session_id
            )
            
            with self.db_manager.get_cursor() as cursor:
                cursor.execute("""
                    INSERT INTO performance_metrics (metric_name, metric_value, metric_unit, timestamp, session_id)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    metric.metric_name,
                    metric.metric_value,
                    metric.metric_unit,
                    metric.timestamp,
                    metric.session_id
                ))
            
            logger.debug(f"Logged performance metric: {metric_name} = {metric_value} {metric_unit or ''}")
            return True
            
        except Exception as e:
            logger.error(f"Error logging performance metric: {e}")
            return False
    
    def get_events(self, event_type: Optional[EventType] = None, 
                   limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """Get events from the database"""
        try:
            with self.db_manager.get_cursor() as cursor:
                if event_type:
                    cursor.execute("""
                        SELECT * FROM events 
                        WHERE event_type = ? 
                        ORDER BY timestamp DESC 
                        LIMIT ? OFFSET ?
                    """, (event_type.value, limit, offset))
                else:
                    cursor.execute("""
                        SELECT * FROM events 
                        ORDER BY timestamp DESC 
                        LIMIT ? OFFSET ?
                    """, (limit, offset))
                
                rows = cursor.fetchall()
                return [dict(row) for row in rows]
                
        except Exception as e:
            logger.error(f"Error getting events: {e}")
            return []
    
    def get_session_events(self, session_id: str) -> List[Dict[str, Any]]:
        """Get all events for a specific session"""
        try:
            with self.db_manager.get_cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM events 
                    WHERE session_id = ? 
                    ORDER BY timestamp ASC
                """, (session_id,))
                
                rows = cursor.fetchall()
                return [dict(row) for row in rows]
                
        except Exception as e:
            logger.error(f"Error getting session events: {e}")
            return []
    
    def get_performance_metrics(self, metric_name: Optional[str] = None, 
                               limit: int = 100) -> List[Dict[str, Any]]:
        """Get performance metrics from the database"""
        try:
            with self.db_manager.get_cursor() as cursor:
                if metric_name:
                    cursor.execute("""
                        SELECT * FROM performance_metrics 
                        WHERE metric_name = ? 
                        ORDER BY timestamp DESC 
                        LIMIT ?
                    """, (metric_name, limit))
                else:
                    cursor.execute("""
                        SELECT * FROM performance_metrics 
                        ORDER BY timestamp DESC 
                        LIMIT ?
                    """, (limit,))
                
                rows = cursor.fetchall()
                return [dict(row) for row in rows]
                
        except Exception as e:
            logger.error(f"Error getting performance metrics: {e}")
            return []

def test_event_logger() -> bool:
    """Test event logger functionality"""
    try:
        logger.info("Testing event logger...")
        
        # Create database manager
        db_manager = DatabaseManager("storage/test_event_logger.db")
        if not db_manager.connect():
            logger.error("Failed to connect to database")
            return False
        
        if not db_manager.create_tables():
            logger.error("Failed to create tables")
            return False
        
        # Create event logger
        event_logger = EventLogger(db_manager)
        
        # Start session
        session_id = event_logger.start_session("test_user")
        if not session_id:
            logger.error("Failed to start session")
            return False
        
        # Log various events
        event_logger.log_voice_command("hello", "hello world", 0.95, "test_user")
        event_logger.log_gesture_detected("open_hand", 0.8, {"fingers": 5}, "test_user")
        event_logger.log_emergency_triggered("voice", {"text": "help"}, 0.9, "test_user")
        event_logger.log_performance_metric("speech_recognition_latency", 150.5, "ms")
        
        # Get events
        events = event_logger.get_events(limit=10)
        logger.info(f"Retrieved {len(events)} events")
        
        # Get performance metrics
        metrics = event_logger.get_performance_metrics(limit=10)
        logger.info(f"Retrieved {len(metrics)} performance metrics")
        
        # End session
        event_logger.end_session()
        
        # Disconnect
        db_manager.disconnect()
        
        # Clean up test database
        test_db = Path("storage/test_event_logger.db")
        if test_db.exists():
            test_db.unlink()
        
        logger.info("Event logger test completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Event logger test failed: {e}")
        return False

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    # Test event logger
    test_event_logger()
