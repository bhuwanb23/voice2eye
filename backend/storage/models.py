"""
Data models for VOICE2EYE storage system
SQLAlchemy models for events, settings, and user data
"""
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, asdict
from enum import Enum
import json

logger = logging.getLogger(__name__)

class EventType(Enum):
    """Types of events that can be logged"""
    VOICE_COMMAND = "voice_command"
    GESTURE_DETECTED = "gesture_detected"
    EMERGENCY_TRIGGERED = "emergency_triggered"
    EMERGENCY_CONFIRMED = "emergency_confirmed"
    EMERGENCY_CANCELLED = "emergency_cancelled"
    MESSAGE_SENT = "message_sent"
    LOCATION_DETECTED = "location_detected"
    SYSTEM_START = "system_start"
    SYSTEM_STOP = "system_stop"
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"

class SettingType(Enum):
    """Types of settings"""
    STRING = "string"
    INTEGER = "integer"
    FLOAT = "float"
    BOOLEAN = "boolean"
    JSON = "json"

@dataclass
class Event:
    """Event data model"""
    event_type: EventType
    event_data: Dict[str, Any]
    timestamp: float
    confidence: Optional[float] = None
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for database storage"""
        return {
            "event_type": self.event_type.value,
            "event_data": json.dumps(self.event_data),
            "timestamp": self.timestamp,
            "confidence": self.confidence,
            "session_id": self.session_id,
            "user_id": self.user_id
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Event':
        """Create from dictionary"""
        return cls(
            event_type=EventType(data["event_type"]),
            event_data=json.loads(data["event_data"]),
            timestamp=data["timestamp"],
            confidence=data.get("confidence"),
            session_id=data.get("session_id"),
            user_id=data.get("user_id")
        )

@dataclass
class PerformanceMetric:
    """Performance metric data model"""
    metric_name: str
    metric_value: float
    metric_unit: Optional[str] = None
    timestamp: float = None
    session_id: Optional[str] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now(timezone.utc).timestamp()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for database storage"""
        return {
            "metric_name": self.metric_name,
            "metric_value": self.metric_value,
            "metric_unit": self.metric_unit,
            "timestamp": self.timestamp,
            "session_id": self.session_id
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'PerformanceMetric':
        """Create from dictionary"""
        return cls(
            metric_name=data["metric_name"],
            metric_value=data["metric_value"],
            metric_unit=data.get("metric_unit"),
            timestamp=data["timestamp"],
            session_id=data.get("session_id")
        )

@dataclass
class UserSetting:
    """User setting data model"""
    setting_key: str
    setting_value: Any
    setting_type: SettingType
    user_id: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for database storage"""
        return {
            "setting_key": self.setting_key,
            "setting_value": json.dumps(self.setting_value) if self.setting_type == SettingType.JSON else str(self.setting_value),
            "setting_type": self.setting_type.value,
            "user_id": self.user_id
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'UserSetting':
        """Create from dictionary"""
        setting_type = SettingType(data["setting_type"])
        
        # Parse value based on type
        if setting_type == SettingType.JSON:
            value = json.loads(data["setting_value"])
        elif setting_type == SettingType.INTEGER:
            value = int(data["setting_value"])
        elif setting_type == SettingType.FLOAT:
            value = float(data["setting_value"])
        elif setting_type == SettingType.BOOLEAN:
            value = data["setting_value"].lower() == "true"
        else:
            value = data["setting_value"]
        
        return cls(
            setting_key=data["setting_key"],
            setting_value=value,
            setting_type=setting_type,
            user_id=data.get("user_id")
        )

@dataclass
class EmergencyContact:
    """Emergency contact data model"""
    name: str
    phone: str
    relationship: Optional[str] = None
    priority: int = 1
    enabled: bool = True
    user_id: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for database storage"""
        return {
            "name": self.name,
            "phone": self.phone,
            "relationship": self.relationship,
            "priority": self.priority,
            "enabled": self.enabled,
            "user_id": self.user_id
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'EmergencyContact':
        """Create from dictionary"""
        return cls(
            name=data["name"],
            phone=data["phone"],
            relationship=data.get("relationship"),
            priority=data.get("priority", 1),
            enabled=data.get("enabled", True),
            user_id=data.get("user_id")
        )

@dataclass
class Session:
    """Session data model"""
    session_id: str
    start_time: float
    end_time: Optional[float] = None
    duration: Optional[float] = None
    event_count: int = 0
    user_id: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for database storage"""
        return {
            "id": self.session_id,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "duration": self.duration,
            "event_count": self.event_count,
            "user_id": self.user_id
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Session':
        """Create from dictionary"""
        return cls(
            session_id=data["id"],
            start_time=data["start_time"],
            end_time=data.get("end_time"),
            duration=data.get("duration"),
            event_count=data.get("event_count", 0),
            user_id=data.get("user_id")
        )

@dataclass
class LogFile:
    """Log file data model"""
    file_path: str
    file_size: Optional[int] = None
    created_at: Optional[datetime] = None
    last_accessed: Optional[datetime] = None
    retention_days: int = 30
    archived: bool = False
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now(timezone.utc)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for database storage"""
        return {
            "file_path": self.file_path,
            "file_size": self.file_size,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_accessed": self.last_accessed.isoformat() if self.last_accessed else None,
            "retention_days": self.retention_days,
            "archived": self.archived
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'LogFile':
        """Create from dictionary"""
        return cls(
            file_path=data["file_path"],
            file_size=data.get("file_size"),
            created_at=datetime.fromisoformat(data["created_at"]) if data.get("created_at") else None,
            last_accessed=datetime.fromisoformat(data["last_accessed"]) if data.get("last_accessed") else None,
            retention_days=data.get("retention_days", 30),
            archived=data.get("archived", False)
        )

def test_data_models() -> bool:
    """Test data models functionality"""
    try:
        logger.info("Testing data models...")
        
        # Test Event model
        event = Event(
            event_type=EventType.VOICE_COMMAND,
            event_data={"command": "hello", "text": "hello world"},
            timestamp=datetime.now(timezone.utc).timestamp(),
            confidence=0.95,
            session_id="test_session_123"
        )
        
        event_dict = event.to_dict()
        event_restored = Event.from_dict(event_dict)
        
        assert event.event_type == event_restored.event_type
        assert event.event_data == event_restored.event_data
        logger.info("Event model test passed")
        
        # Test PerformanceMetric model
        metric = PerformanceMetric(
            metric_name="speech_recognition_latency",
            metric_value=150.5,
            metric_unit="ms",
            session_id="test_session_123"
        )
        
        metric_dict = metric.to_dict()
        metric_restored = PerformanceMetric.from_dict(metric_dict)
        
        assert metric.metric_name == metric_restored.metric_name
        assert metric.metric_value == metric_restored.metric_value
        logger.info("PerformanceMetric model test passed")
        
        # Test UserSetting model
        setting = UserSetting(
            setting_key="voice_sensitivity",
            setting_value=0.8,
            setting_type=SettingType.FLOAT,
            user_id="user_123"
        )
        
        setting_dict = setting.to_dict()
        setting_restored = UserSetting.from_dict(setting_dict)
        
        assert setting.setting_key == setting_restored.setting_key
        assert setting.setting_value == setting_restored.setting_value
        logger.info("UserSetting model test passed")
        
        # Test EmergencyContact model
        contact = EmergencyContact(
            name="John Doe",
            phone="+1234567890",
            relationship="Family",
            priority=1,
            enabled=True
        )
        
        contact_dict = contact.to_dict()
        contact_restored = EmergencyContact.from_dict(contact_dict)
        
        assert contact.name == contact_restored.name
        assert contact.phone == contact_restored.phone
        logger.info("EmergencyContact model test passed")
        
        logger.info("All data model tests passed")
        return True
        
    except Exception as e:
        logger.error(f"Data model test failed: {e}")
        return False

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    # Test data models
    test_data_models()
