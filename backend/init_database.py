"""
Initialize SQLite Database for VOICE2EYE
Creates database tables and inserts sample data
"""
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent))

from storage.database import DatabaseManager
from storage.log_analyzer import LogAnalyzer
import logging
import json
from datetime import datetime, timezone

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def init_database():
    """Initialize the database with tables and sample data"""
    try:
        logger.info("Initializing VOICE2EYE database...")
        
        # Create database manager
        db_manager = DatabaseManager("storage/voice2eye.db")
        
        # Connect and create tables
        if not db_manager.connect():
            logger.error("Failed to connect to database")
            return False
        
        if not db_manager.create_tables():
            logger.error("Failed to create tables")
            return False
        
        # Insert sample data
        insert_sample_data(db_manager)
        
        # Test database
        test_database(db_manager)
        
        db_manager.disconnect()
        logger.info("Database initialization completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        return False

def insert_sample_data(db_manager):
    """Insert sample data for testing"""
    try:
        logger.info("Inserting sample data...")
        
        with db_manager.get_cursor() as cursor:
            # Insert sample events
            sample_events = [
                ("voice_command", json.dumps({"command": "start listening", "confidence": 0.95}), datetime.now().timestamp(), 0.95, "session_1"),
                ("gesture_detected", json.dumps({"gesture": "open_hand", "confidence": 0.88}), datetime.now().timestamp(), 0.88, "session_1"),
                ("emergency_triggered", json.dumps({"trigger_type": "voice", "message": "help"}), datetime.now().timestamp(), 0.92, "session_2"),
                ("voice_command", json.dumps({"command": "stop listening", "confidence": 0.91}), datetime.now().timestamp(), 0.91, "session_1"),
                ("gesture_detected", json.dumps({"gesture": "fist", "confidence": 0.85}), datetime.now().timestamp(), 0.85, "session_1"),
            ]
            
            cursor.executemany("""
                INSERT INTO events (event_type, event_data, timestamp, confidence, session_id)
                VALUES (?, ?, ?, ?, ?)
            """, sample_events)
            
            # Insert sample performance metrics
            sample_metrics = [
                ("speech_recognition_latency", 245.3, "ms", datetime.now().timestamp(), "session_1"),
                ("gesture_detection_latency", 89.2, "ms", datetime.now().timestamp(), "session_1"),
                ("emergency_response_time", 156.7, "ms", datetime.now().timestamp(), "session_2"),
                ("speech_recognition_latency", 238.1, "ms", datetime.now().timestamp(), "session_1"),
                ("gesture_detection_latency", 92.4, "ms", datetime.now().timestamp(), "session_1"),
            ]
            
            cursor.executemany("""
                INSERT INTO performance_metrics (metric_name, metric_value, metric_unit, timestamp, session_id)
                VALUES (?, ?, ?, ?, ?)
            """, sample_metrics)
            
            # Insert sample settings
            sample_settings = [
                ("speech_rate", "150", "integer"),
                ("speech_pitch", "1.0", "float"),
                ("gesture_confidence_threshold", "0.7", "float"),
                ("emergency_confirmation_timeout", "30", "integer"),
                ("voice_navigation", "true", "boolean"),
            ]
            
            cursor.executemany("""
                INSERT INTO user_settings (setting_key, setting_value, setting_type)
                VALUES (?, ?, ?)
            """, sample_settings)
            
            # Insert sample emergency contacts
            sample_contacts = [
                ("Emergency Contact 1", "+1234567890", "Family", 1, True),
                ("Emergency Contact 2", "+1234567891", "Friend", 2, True),
                ("Emergency Contact 3", "+1234567892", "Doctor", 1, False),
            ]
            
            cursor.executemany("""
                INSERT INTO emergency_contacts (name, phone, relationship, priority, enabled)
                VALUES (?, ?, ?, ?, ?)
            """, sample_contacts)
            
            # Insert sample sessions
            sample_sessions = [
                ("session_1", datetime.now().timestamp() - 3600, datetime.now().timestamp() - 300, 3300, 4),
                ("session_2", datetime.now().timestamp() - 1800, datetime.now().timestamp() - 200, 1600, 1),
            ]
            
            cursor.executemany("""
                INSERT INTO sessions (id, start_time, end_time, duration, event_count)
                VALUES (?, ?, ?, ?, ?)
            """, sample_sessions)
            
            logger.info("Sample data inserted successfully")
            
    except Exception as e:
        logger.error(f"Error inserting sample data: {e}")

def test_database(db_manager):
    """Test database functionality"""
    try:
        logger.info("Testing database functionality...")
        
        # Test log analyzer
        log_analyzer = LogAnalyzer(db_manager)
        
        # Test usage statistics
        usage_stats = log_analyzer.get_usage_statistics(days=7)
        logger.info(f"Usage stats: {usage_stats}")
        
        # Test performance metrics
        perf_metrics = log_analyzer.get_performance_metrics(days=7)
        logger.info(f"Performance metrics: {perf_metrics}")
        
        # Test emergency analysis
        emergency_analysis = log_analyzer.get_emergency_analysis(days=30)
        logger.info(f"Emergency analysis: {emergency_analysis}")
        
        # Test database info
        db_info = db_manager.get_database_info()
        logger.info(f"Database info: {db_info}")
        
        logger.info("Database tests completed successfully")
        
    except Exception as e:
        logger.error(f"Database test failed: {e}")

if __name__ == "__main__":
    success = init_database()
    if success:
        print("Database initialized successfully!")
        print("You can now start the API server.")
    else:
        print("Database initialization failed!")
        sys.exit(1)
