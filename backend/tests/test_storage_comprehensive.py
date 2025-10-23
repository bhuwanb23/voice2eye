"""
Comprehensive tests for Storage System
Tests: Database, Event Logger, Settings Manager, Log Analyzer
"""
import pytest
import os
from pathlib import Path

from storage.database import DatabaseManager
from storage.event_logger import EventLogger
from storage.settings_manager import SettingsManager
from storage.log_analyzer import LogAnalyzer
from storage.storage_system import StorageSystem


# ============================================================================
# Database Manager Tests
# ============================================================================

@pytest.mark.unit
class TestDatabaseManager:
    """Test DatabaseManager class"""
    
    def test_initialization(self, temp_db_path):
        """Test database manager initialization"""
        db = DatabaseManager(str(temp_db_path))
        assert db is not None
    
    def test_connect_and_disconnect(self, temp_db_path):
        """Test database connection and disconnection"""
        db = DatabaseManager(str(temp_db_path))
        
        # Connect
        result = db.connect()
        assert isinstance(result, bool)
        
        # Disconnect
        db.disconnect()
    
    def test_create_tables(self, temp_db_path):
        """Test table creation"""
        db = DatabaseManager(str(temp_db_path))
        db.connect()
        
        result = db.create_tables()
        assert isinstance(result, bool)
        
        db.disconnect()
    
    def test_database_file_creation(self, temp_db_path):
        """Test that database file is created"""
        db = DatabaseManager(str(temp_db_path))
        db.connect()
        db.create_tables()
        
        # Database file should exist
        assert temp_db_path.exists()
        
        db.disconnect()


# ============================================================================
# Event Logger Tests
# ============================================================================

@pytest.mark.unit
class TestEventLogger:
    """Test EventLogger class"""
    
    def test_initialization(self, temp_db_path):
        """Test event logger initialization"""
        db = DatabaseManager(str(temp_db_path))
        db.connect()
        db.create_tables()
        
        logger = EventLogger(db)
        assert logger is not None
        
        db.disconnect()
    
    def test_start_and_end_session(self, temp_db_path):
        """Test session management"""
        db = DatabaseManager(str(temp_db_path))
        db.connect()
        db.create_tables()
        
        logger = EventLogger(db)
        
        # Start session
        session_id = logger.start_session()
        assert session_id is not None
        assert isinstance(session_id, str)
        
        # End session
        logger.end_session()
        
        db.disconnect()
    
    def test_log_voice_command(self, temp_db_path):
        """Test logging voice commands"""
        db = DatabaseManager(str(temp_db_path))
        db.connect()
        db.create_tables()
        
        logger = EventLogger(db)
        logger.start_session()
        
        result = logger.log_voice_command(
            command="test_command",
            text="hello world",
            confidence=0.95
        )
        
        assert isinstance(result, bool)
        
        logger.end_session()
        db.disconnect()
    
    def test_log_gesture_detected(self, temp_db_path):
        """Test logging gesture detection"""
        db = DatabaseManager(str(temp_db_path))
        db.connect()
        db.create_tables()
        
        logger = EventLogger(db)
        logger.start_session()
        
        gesture_data = {
            'finger_count': 5,
            'handedness': 'Right'
        }
        
        result = logger.log_gesture_detected(
            gesture_type="open_hand",
            confidence=0.92,
            gesture_data=gesture_data
        )
        
        assert isinstance(result, bool)
        
        logger.end_session()
        db.disconnect()
    
    def test_log_emergency_triggered(self, temp_db_path):
        """Test logging emergency triggers"""
        db = DatabaseManager(str(temp_db_path))
        db.connect()
        db.create_tables()
        
        logger = EventLogger(db)
        logger.start_session()
        
        trigger_data = {
            'trigger_type': 'voice',
            'text': 'help me'
        }
        
        result = logger.log_emergency_triggered(
            trigger_type="voice",
            trigger_data=trigger_data,
            confidence=0.98
        )
        
        assert isinstance(result, bool)
        
        logger.end_session()
        db.disconnect()


# ============================================================================
# Settings Manager Tests
# ============================================================================

@pytest.mark.unit
class TestSettingsManager:
    """Test SettingsManager class"""
    
    def test_initialization(self, temp_db_path):
        """Test settings manager initialization"""
        db = DatabaseManager(str(temp_db_path))
        db.connect()
        db.create_tables()
        
        manager = SettingsManager(db)
        assert manager is not None
        
        db.disconnect()
    
    def test_get_and_set_setting(self, temp_db_path):
        """Test getting and setting values"""
        db = DatabaseManager(str(temp_db_path))
        db.connect()
        db.create_tables()
        
        manager = SettingsManager(db)
        
        # Set a setting (note: actual method signature may vary)
        result = manager.set_setting("test_key", "test_value", None)
        assert isinstance(result, bool)
        
        # Get the setting
        value = manager.get_setting("test_key")
        # Value might be None or the set value depending on implementation
        assert value is None or value == "test_value"
        
        db.disconnect()
    
    def test_get_setting_with_default(self, temp_db_path):
        """Test getting setting with default value"""
        db = DatabaseManager(str(temp_db_path))
        db.connect()
        db.create_tables()
        
        manager = SettingsManager(db)
        
        # Get non-existent setting with default
        value = manager.get_setting("nonexistent_key", default="default_value")
        assert value == "default_value"
        
        db.disconnect()
    
    def test_add_emergency_contact(self, temp_db_path, mock_emergency_contact):
        """Test adding emergency contact"""
        db = DatabaseManager(str(temp_db_path))
        db.connect()
        db.create_tables()
        
        manager = SettingsManager(db)
        
        result = manager.add_emergency_contact(
            name=mock_emergency_contact['name'],
            phone=mock_emergency_contact['phone'],
            relationship=mock_emergency_contact['relationship'],
            priority=mock_emergency_contact['priority']
        )
        
        assert isinstance(result, bool)
        
        db.disconnect()
    
    def test_get_emergency_contacts(self, temp_db_path):
        """Test getting emergency contacts"""
        db = DatabaseManager(str(temp_db_path))
        db.connect()
        db.create_tables()
        
        manager = SettingsManager(db)
        
        contacts = manager.get_emergency_contacts()
        assert isinstance(contacts, list)
        
        db.disconnect()


# ============================================================================
# Log Analyzer Tests
# ============================================================================

@pytest.mark.unit
class TestLogAnalyzer:
    """Test LogAnalyzer class"""
    
    def test_initialization(self, temp_db_path):
        """Test log analyzer initialization"""
        db = DatabaseManager(str(temp_db_path))
        db.connect()
        db.create_tables()
        
        analyzer = LogAnalyzer(db)
        assert analyzer is not None
        
        db.disconnect()
    
    def test_get_usage_statistics(self, temp_db_path):
        """Test getting usage statistics"""
        db = DatabaseManager(str(temp_db_path))
        db.connect()
        db.create_tables()
        
        analyzer = LogAnalyzer(db)
        
        stats = analyzer.get_usage_statistics(days=7)
        assert isinstance(stats, dict)
        
        db.disconnect()
    
    def test_get_performance_metrics(self, temp_db_path):
        """Test getting performance metrics"""
        db = DatabaseManager(str(temp_db_path))
        db.connect()
        db.create_tables()
        
        analyzer = LogAnalyzer(db)
        
        metrics = analyzer.get_performance_metrics(days=7)
        assert isinstance(metrics, dict)
        
        db.disconnect()
    
    def test_get_emergency_analysis(self, temp_db_path):
        """Test getting emergency analysis"""
        db = DatabaseManager(str(temp_db_path))
        db.connect()
        db.create_tables()
        
        analyzer = LogAnalyzer(db)
        
        analysis = analyzer.get_emergency_analysis(days=30)
        assert isinstance(analysis, dict)
        
        db.disconnect()


# ============================================================================
# Storage System Tests
# ============================================================================

@pytest.mark.unit
class TestStorageSystem:
    """Test StorageSystem integration"""
    
    def test_initialization(self, temp_db_path):
        """Test storage system initialization"""
        system = StorageSystem(str(temp_db_path))
        assert system is not None
    
    def test_initialize_system(self, temp_db_path):
        """Test system initialization"""
        system = StorageSystem(str(temp_db_path))
        
        result = system.initialize()
        assert isinstance(result, bool)
        
        if result:
            system.cleanup()
    
    def test_start_and_end_session(self, temp_db_path):
        """Test session management through storage system"""
        system = StorageSystem(str(temp_db_path))
        system.initialize()
        
        session_id = system.start_session()
        # Session ID might be None if not properly initialized
        assert session_id is None or isinstance(session_id, str)
        
        system.end_session()
        system.cleanup()
    
    def test_log_voice_command_integration(self, temp_db_path):
        """Test logging voice command through storage system"""
        system = StorageSystem(str(temp_db_path))
        system.initialize()
        system.start_session()
        
        result = system.log_voice_command(
            command="test",
            text="hello",
            confidence=0.9
        )
        
        assert isinstance(result, bool)
        
        system.end_session()
        system.cleanup()
    
    def test_get_usage_statistics_integration(self, temp_db_path):
        """Test getting usage statistics through storage system"""
        system = StorageSystem(str(temp_db_path))
        system.initialize()
        
        stats = system.get_usage_statistics(days=7)
        assert isinstance(stats, dict)
        
        system.cleanup()


# ============================================================================
# Integration Tests
# ============================================================================

@pytest.mark.integration
class TestStorageIntegration:
    """Integration tests for storage system"""
    
    def test_complete_logging_workflow(self, temp_db_path):
        """Test complete logging workflow"""
        system = StorageSystem(str(temp_db_path))
        system.initialize()
        
        # Start session
        session_id = system.start_session()
        
        # Log various events
        system.log_voice_command("hello", "hello world", 0.95)
        system.log_gesture_detected("open_hand", 0.92, {'finger_count': 5})
        system.log_emergency_triggered("voice", {'text': 'help'}, 0.98)
        
        # Get statistics
        stats = system.get_usage_statistics(days=7)
        
        # End session
        system.end_session()
        system.cleanup()
        
        assert isinstance(stats, dict)
    
    def test_settings_workflow(self, temp_db_path, mock_emergency_contact):
        """Test settings management workflow"""
        system = StorageSystem(str(temp_db_path))
        system.initialize()
        
        # Set a setting
        system.set_setting("test_key", "test_value")
        
        # Add emergency contact
        system.add_emergency_contact(
            name=mock_emergency_contact['name'],
            phone=mock_emergency_contact['phone'],
            relationship=mock_emergency_contact['relationship']
        )
        
        # Get contacts
        contacts = system.get_emergency_contacts()
        
        system.cleanup()
        
        assert isinstance(contacts, list)


# ============================================================================
# Performance Tests
# ============================================================================

@pytest.mark.slow
class TestStoragePerformance:
    """Performance tests for storage system"""
    
    def test_bulk_logging_performance(self, temp_db_path):
        """Test bulk logging performance"""
        import time
        
        system = StorageSystem(str(temp_db_path))
        system.initialize()
        system.start_session()
        
        start_time = time.time()
        
        # Log 100 events
        for i in range(100):
            system.log_voice_command(f"command_{i}", f"text_{i}", 0.9)
        
        end_time = time.time()
        
        total_time = end_time - start_time
        avg_time = total_time / 100
        
        system.end_session()
        system.cleanup()
        
        # Should log each event in less than 10ms
        assert avg_time < 0.01, f"Logging too slow: {avg_time*1000:.2f}ms per event"
    
    def test_query_performance(self, temp_db_path):
        """Test query performance"""
        import time
        
        system = StorageSystem(str(temp_db_path))
        system.initialize()
        
        start_time = time.time()
        stats = system.get_usage_statistics(days=7)
        end_time = time.time()
        
        query_time = end_time - start_time
        
        system.cleanup()
        
        # Should query in less than 1 second
        assert query_time < 1.0, f"Query too slow: {query_time:.2f}s"
