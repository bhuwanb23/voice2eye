"""
Main storage system for VOICE2EYE
Integrates database, logging, settings, and analysis
"""
import logging
import time
from typing import Optional, Dict, Any, List
from pathlib import Path

from .database import DatabaseManager
from .event_logger import EventLogger
from .settings_manager import SettingsManager
from .log_analyzer import LogAnalyzer

logger = logging.getLogger(__name__)

class StorageSystem:
    """Main storage system for VOICE2EYE"""
    
    def __init__(self, db_path: str = "storage/voice2eye.db"):
        self.db_manager = DatabaseManager(db_path)
        self.event_logger: Optional[EventLogger] = None
        self.settings_manager: Optional[SettingsManager] = None
        self.log_analyzer: Optional[LogAnalyzer] = None
        self.is_initialized = False
        
    def initialize(self) -> bool:
        """Initialize the storage system"""
        try:
            logger.info("Initializing storage system...")
            
            # Connect to database
            if not self.db_manager.connect():
                logger.error("Failed to connect to database")
                return False
            
            # Create tables
            if not self.db_manager.create_tables():
                logger.error("Failed to create database tables")
                return False
            
            # Initialize components
            self.event_logger = EventLogger(self.db_manager)
            self.settings_manager = SettingsManager(self.db_manager)
            self.log_analyzer = LogAnalyzer(self.db_manager)
            
            self.is_initialized = True
            logger.info("Storage system initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error initializing storage system: {e}")
            return False
    
    def cleanup(self):
        """Cleanup the storage system"""
        try:
            if self.event_logger and self.event_logger.current_session_id:
                self.event_logger.end_session()
            
            self.db_manager.disconnect()
            self.is_initialized = False
            logger.info("Storage system cleaned up")
            
        except Exception as e:
            logger.error(f"Error cleaning up storage system: {e}")
    
    def start_session(self, user_id: Optional[str] = None) -> Optional[str]:
        """Start a new logging session"""
        if not self.is_initialized:
            logger.error("Storage system not initialized")
            return None
        
        return self.event_logger.start_session(user_id)
    
    def end_session(self):
        """End the current logging session"""
        if not self.is_initialized:
            logger.error("Storage system not initialized")
            return
        
        self.event_logger.end_session()
    
    def log_voice_command(self, command: str, text: str, confidence: float, 
                         user_id: Optional[str] = None) -> bool:
        """Log a voice command"""
        if not self.is_initialized:
            logger.error("Storage system not initialized")
            return False
        
        return self.event_logger.log_voice_command(command, text, confidence, user_id)
    
    def log_gesture_detected(self, gesture_type: str, confidence: float, 
                           gesture_data: Dict[str, Any], user_id: Optional[str] = None) -> bool:
        """Log a gesture detection"""
        if not self.is_initialized:
            logger.error("Storage system not initialized")
            return False
        
        return self.event_logger.log_gesture_detected(gesture_type, confidence, gesture_data, user_id)
    
    def log_emergency_triggered(self, trigger_type: str, trigger_data: Dict[str, Any], 
                               confidence: float, user_id: Optional[str] = None) -> bool:
        """Log an emergency trigger"""
        if not self.is_initialized:
            logger.error("Storage system not initialized")
            return False
        
        return self.event_logger.log_emergency_triggered(trigger_type, trigger_data, confidence, user_id)
    
    def log_emergency_confirmed(self, alert_id: str, location_data: Optional[Dict[str, Any]] = None,
                               user_id: Optional[str] = None) -> bool:
        """Log an emergency confirmation"""
        if not self.is_initialized:
            logger.error("Storage system not initialized")
            return False
        
        return self.event_logger.log_emergency_confirmed(alert_id, location_data, user_id)
    
    def log_emergency_cancelled(self, alert_id: str, user_id: Optional[str] = None) -> bool:
        """Log an emergency cancellation"""
        if not self.is_initialized:
            logger.error("Storage system not initialized")
            return False
        
        return self.event_logger.log_emergency_cancelled(alert_id, user_id)
    
    def log_performance_metric(self, metric_name: str, metric_value: float, 
                              metric_unit: Optional[str] = None, user_id: Optional[str] = None) -> bool:
        """Log a performance metric"""
        if not self.is_initialized:
            logger.error("Storage system not initialized")
            return False
        
        return self.event_logger.log_performance_metric(metric_name, metric_value, metric_unit, user_id)
    
    def get_setting(self, key: str, default: Any = None) -> Any:
        """Get a setting value"""
        if not self.is_initialized:
            logger.error("Storage system not initialized")
            return default
        
        return self.settings_manager.get_setting(key, default)
    
    def set_setting(self, key: str, value: Any, user_id: Optional[str] = None) -> bool:
        """Set a setting value"""
        if not self.is_initialized:
            logger.error("Storage system not initialized")
            return False
        
        return self.settings_manager.set_setting(key, value, None, user_id)
    
    def get_emergency_contacts(self, enabled_only: bool = True) -> List[Dict[str, Any]]:
        """Get emergency contacts"""
        if not self.is_initialized:
            logger.error("Storage system not initialized")
            return []
        
        contacts = self.settings_manager.get_emergency_contacts(enabled_only)
        return [contact.to_dict() for contact in contacts]
    
    def add_emergency_contact(self, name: str, phone: str, relationship: Optional[str] = None,
                             priority: int = 1, enabled: bool = True, user_id: Optional[str] = None) -> bool:
        """Add an emergency contact"""
        if not self.is_initialized:
            logger.error("Storage system not initialized")
            return False
        
        return self.settings_manager.add_emergency_contact(name, phone, relationship, priority, enabled, user_id)
    
    def get_usage_statistics(self, days: int = 7) -> Dict[str, Any]:
        """Get usage statistics"""
        if not self.is_initialized:
            logger.error("Storage system not initialized")
            return {"error": "Storage system not initialized"}
        
        return self.log_analyzer.get_usage_statistics(days)
    
    def get_performance_metrics(self, metric_name: Optional[str] = None, days: int = 7) -> Dict[str, Any]:
        """Get performance metrics"""
        if not self.is_initialized:
            logger.error("Storage system not initialized")
            return {"error": "Storage system not initialized"}
        
        return self.log_analyzer.get_performance_metrics(metric_name, days)
    
    def get_emergency_analysis(self, days: int = 30) -> Dict[str, Any]:
        """Get emergency analysis"""
        if not self.is_initialized:
            logger.error("Storage system not initialized")
            return {"error": "Storage system not initialized"}
        
        return self.log_analyzer.get_emergency_analysis(days)
    
    def generate_report(self, days: int = 7, output_file: Optional[str] = None) -> Dict[str, Any]:
        """Generate a comprehensive system report"""
        if not self.is_initialized:
            logger.error("Storage system not initialized")
            return {"error": "Storage system not initialized"}
        
        return self.log_analyzer.generate_report(days, output_file)
    
    def cleanup_old_data(self, days: int = 30) -> int:
        """Clean up old data"""
        if not self.is_initialized:
            logger.error("Storage system not initialized")
            return 0
        
        return self.log_analyzer.cleanup_old_logs(days)
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get storage system status"""
        try:
            if not self.is_initialized:
                return {
                    "initialized": False,
                    "error": "Storage system not initialized"
                }
            
            db_info = self.db_manager.get_database_info()
            
            return {
                "initialized": True,
                "database_info": db_info,
                "current_session": self.event_logger.current_session_id if self.event_logger else None,
                "settings_count": len(self.settings_manager.settings_cache),
                "contacts_count": len(self.settings_manager.contacts_cache)
            }
            
        except Exception as e:
            logger.error(f"Error getting system status: {e}")
            return {
                "initialized": False,
                "error": str(e)
            }

def test_storage_system() -> bool:
    """Test storage system functionality"""
    try:
        logger.info("Testing storage system...")
        
        # Create storage system
        storage = StorageSystem("storage/test_storage.db")
        
        # Initialize
        if not storage.initialize():
            logger.error("Failed to initialize storage system")
            return False
        
        # Start session
        session_id = storage.start_session("test_user")
        if not session_id:
            logger.error("Failed to start session")
            return False
        
        # Test logging
        storage.log_voice_command("hello", "hello world", 0.95, "test_user")
        storage.log_gesture_detected("open_hand", 0.8, {"fingers": 5}, "test_user")
        storage.log_emergency_triggered("voice", {"text": "help"}, 0.9, "test_user")
        storage.log_performance_metric("speech_recognition_latency", 150.5, "ms")
        
        # Test settings
        storage.set_setting("voice_sensitivity", 0.9, "test_user")
        storage.add_emergency_contact("John Doe", "+1234567890", "Family", 1, True, "test_user")
        
        # Test getting data
        voice_sens = storage.get_setting("voice_sensitivity")
        contacts = storage.get_emergency_contacts()
        usage_stats = storage.get_usage_statistics(7)
        
        logger.info(f"Voice sensitivity: {voice_sens}")
        logger.info(f"Emergency contacts: {len(contacts)}")
        logger.info(f"Usage statistics: {usage_stats}")
        
        # Test report generation
        report = storage.generate_report(7)
        logger.info(f"Report generated: {len(report)} keys")
        
        # End session
        storage.end_session()
        
        # Get system status
        status = storage.get_system_status()
        logger.info(f"System status: {status}")
        
        # Cleanup
        storage.cleanup()
        
        # Clean up test database
        test_db = Path("storage/test_storage.db")
        if test_db.exists():
            test_db.unlink()
        
        logger.info("Storage system test completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Storage system test failed: {e}")
        return False

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    # Test storage system
    test_storage_system()
