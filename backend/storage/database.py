"""
Database connection and management for VOICE2EYE
SQLite-based storage for logs, settings, and user data
"""
import sqlite3
import logging
from pathlib import Path
from typing import Optional, Dict, Any, List
from contextlib import contextmanager
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class DatabaseManager:
    """SQLite database manager for VOICE2EYE"""
    
    def __init__(self, db_path: str = "storage/voice2eye.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.connection: Optional[sqlite3.Connection] = None
        
    def connect(self) -> bool:
        """Connect to the database"""
        try:
            self.connection = sqlite3.connect(
                str(self.db_path),
                check_same_thread=False
            )
            self.connection.row_factory = sqlite3.Row
            logger.info(f"Connected to database: {self.db_path}")
            return True
        except Exception as e:
            logger.error(f"Error connecting to database: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from the database"""
        try:
            if self.connection:
                self.connection.close()
                self.connection = None
                logger.info("Disconnected from database")
        except Exception as e:
            logger.error(f"Error disconnecting from database: {e}")
    
    @contextmanager
    def get_cursor(self):
        """Get database cursor with automatic cleanup"""
        if not self.connection:
            self.connect()
        
        cursor = self.connection.cursor()
        try:
            yield cursor
            self.connection.commit()
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            cursor.close()
    
    def create_tables(self) -> bool:
        """Create all database tables"""
        try:
            with self.get_cursor() as cursor:
                # Events table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS events (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        event_type TEXT NOT NULL,
                        event_data TEXT NOT NULL,
                        timestamp REAL NOT NULL,
                        confidence REAL,
                        session_id TEXT,
                        user_id TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Performance metrics table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS performance_metrics (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        metric_name TEXT NOT NULL,
                        metric_value REAL NOT NULL,
                        metric_unit TEXT,
                        timestamp REAL NOT NULL,
                        session_id TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # User settings table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS user_settings (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        setting_key TEXT UNIQUE NOT NULL,
                        setting_value TEXT NOT NULL,
                        setting_type TEXT NOT NULL,
                        user_id TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Emergency contacts table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS emergency_contacts (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        phone TEXT NOT NULL,
                        relationship TEXT,
                        priority INTEGER DEFAULT 1,
                        enabled BOOLEAN DEFAULT 1,
                        user_id TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Sessions table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS sessions (
                        id TEXT PRIMARY KEY,
                        start_time REAL NOT NULL,
                        end_time REAL,
                        duration REAL,
                        event_count INTEGER DEFAULT 0,
                        user_id TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Log files table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS log_files (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        file_path TEXT UNIQUE NOT NULL,
                        file_size INTEGER,
                        created_at DATETIME NOT NULL,
                        last_accessed DATETIME,
                        retention_days INTEGER DEFAULT 30,
                        archived BOOLEAN DEFAULT 0
                    )
                """)
                
                # Create indexes for better performance
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON performance_metrics(timestamp)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_metrics_name ON performance_metrics(metric_name)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_settings_key ON user_settings(setting_key)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_contacts_priority ON emergency_contacts(priority)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_log_files_created ON log_files(created_at)")
                
                logger.info("Database tables created successfully")
                return True
                
        except Exception as e:
            logger.error(f"Error creating database tables: {e}")
            return False
    
    def get_database_info(self) -> Dict[str, Any]:
        """Get database information and statistics"""
        try:
            with self.get_cursor() as cursor:
                # Get table counts
                cursor.execute("SELECT COUNT(*) FROM events")
                event_count = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM performance_metrics")
                metrics_count = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM user_settings")
                settings_count = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM emergency_contacts")
                contacts_count = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM sessions")
                sessions_count = cursor.fetchone()[0]
                
                # Get database size
                db_size = self.db_path.stat().st_size if self.db_path.exists() else 0
                
                return {
                    "database_path": str(self.db_path),
                    "database_size_bytes": db_size,
                    "database_size_mb": round(db_size / (1024 * 1024), 2),
                    "event_count": event_count,
                    "metrics_count": metrics_count,
                    "settings_count": settings_count,
                    "contacts_count": contacts_count,
                    "sessions_count": sessions_count,
                    "tables": [
                        "events", "performance_metrics", "user_settings",
                        "emergency_contacts", "sessions", "log_files"
                    ]
                }
                
        except Exception as e:
            logger.error(f"Error getting database info: {e}")
            return {"error": str(e)}
    
    def cleanup_old_data(self, days: int = 30) -> int:
        """Clean up old data based on retention policy"""
        try:
            cutoff_time = datetime.now(timezone.utc).timestamp() - (days * 24 * 60 * 60)
            
            with self.get_cursor() as cursor:
                # Clean up old events
                cursor.execute("DELETE FROM events WHERE timestamp < ?", (cutoff_time,))
                events_deleted = cursor.rowcount
                
                # Clean up old performance metrics
                cursor.execute("DELETE FROM performance_metrics WHERE timestamp < ?", (cutoff_time,))
                metrics_deleted = cursor.rowcount
                
                # Clean up old sessions
                cursor.execute("DELETE FROM sessions WHERE start_time < ?", (cutoff_time,))
                sessions_deleted = cursor.rowcount
                
                # Clean up old log files
                cursor.execute("DELETE FROM log_files WHERE created_at < datetime('now', '-{} days')".format(days))
                log_files_deleted = cursor.rowcount
                
                total_deleted = events_deleted + metrics_deleted + sessions_deleted + log_files_deleted
                
                logger.info(f"Cleaned up {total_deleted} old records ({days} days retention)")
                return total_deleted
                
        except Exception as e:
            logger.error(f"Error cleaning up old data: {e}")
            return 0

def test_database_manager() -> bool:
    """Test database manager functionality"""
    try:
        logger.info("Testing database manager...")
        
        # Create database manager
        db_manager = DatabaseManager("storage/test_voice2eye.db")
        
        # Connect and create tables
        if not db_manager.connect():
            logger.error("Failed to connect to database")
            return False
        
        if not db_manager.create_tables():
            logger.error("Failed to create tables")
            return False
        
        # Test database info
        info = db_manager.get_database_info()
        logger.info(f"Database info: {info}")
        
        # Test cleanup
        deleted = db_manager.cleanup_old_data(0)  # Clean all data for test
        logger.info(f"Cleaned up {deleted} records")
        
        # Disconnect
        db_manager.disconnect()
        
        # Clean up test database
        test_db = Path("storage/test_voice2eye.db")
        if test_db.exists():
            test_db.unlink()
        
        logger.info("Database manager test completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Database manager test failed: {e}")
        return False

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    # Test database manager
    test_database_manager()
