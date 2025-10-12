"""
Settings management system for VOICE2EYE
Handles user preferences, emergency contacts, and system configuration
"""
import logging
import json
import time
from typing import Optional, Dict, Any, List, Union
from pathlib import Path

from .database import DatabaseManager
from .models import UserSetting, SettingType, EmergencyContact

logger = logging.getLogger(__name__)

class SettingsManager:
    """Settings management service for VOICE2EYE"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
        self.settings_cache: Dict[str, Any] = {}
        self.contacts_cache: List[EmergencyContact] = []
        self._load_settings_cache()
        self._load_contacts_cache()
    
    def _load_settings_cache(self):
        """Load settings into cache"""
        try:
            with self.db_manager.get_cursor() as cursor:
                cursor.execute("SELECT setting_key, setting_value, setting_type FROM user_settings")
                rows = cursor.fetchall()
                
                self.settings_cache = {}
                for row in rows:
                    setting_type = SettingType(row["setting_type"])
                    
                    # Parse value based on type
                    if setting_type == SettingType.JSON:
                        value = json.loads(row["setting_value"])
                    elif setting_type == SettingType.INTEGER:
                        value = int(row["setting_value"])
                    elif setting_type == SettingType.FLOAT:
                        value = float(row["setting_value"])
                    elif setting_type == SettingType.BOOLEAN:
                        value = row["setting_value"].lower() == "true"
                    else:
                        value = row["setting_value"]
                    
                    self.settings_cache[row["setting_key"]] = value
                
                logger.info(f"Loaded {len(self.settings_cache)} settings into cache")
                
        except Exception as e:
            logger.error(f"Error loading settings cache: {e}")
    
    def _load_contacts_cache(self):
        """Load emergency contacts into cache"""
        try:
            with self.db_manager.get_cursor() as cursor:
                cursor.execute("""
                    SELECT name, phone, relationship, priority, enabled, user_id 
                    FROM emergency_contacts 
                    ORDER BY priority ASC
                """)
                rows = cursor.fetchall()
                
                self.contacts_cache = []
                for row in rows:
                    contact = EmergencyContact(
                        name=row["name"],
                        phone=row["phone"],
                        relationship=row["relationship"],
                        priority=row["priority"],
                        enabled=bool(row["enabled"]),
                        user_id=row["user_id"]
                    )
                    self.contacts_cache.append(contact)
                
                logger.info(f"Loaded {len(self.contacts_cache)} emergency contacts into cache")
                
        except Exception as e:
            logger.error(f"Error loading contacts cache: {e}")
    
    def get_setting(self, key: str, default: Any = None) -> Any:
        """Get a setting value"""
        return self.settings_cache.get(key, default)
    
    def set_setting(self, key: str, value: Any, setting_type: SettingType, 
                   user_id: Optional[str] = None) -> bool:
        """Set a setting value"""
        try:
            # Determine setting type if not provided
            if setting_type is None:
                if isinstance(value, bool):
                    setting_type = SettingType.BOOLEAN
                elif isinstance(value, int):
                    setting_type = SettingType.INTEGER
                elif isinstance(value, float):
                    setting_type = SettingType.FLOAT
                elif isinstance(value, (dict, list)):
                    setting_type = SettingType.JSON
                else:
                    setting_type = SettingType.STRING
            
            # Create setting object
            setting = UserSetting(
                setting_key=key,
                setting_value=value,
                setting_type=setting_type,
                user_id=user_id
            )
            
            # Insert or update in database
            with self.db_manager.get_cursor() as cursor:
                cursor.execute("""
                    INSERT OR REPLACE INTO user_settings 
                    (setting_key, setting_value, setting_type, user_id, updated_at)
                    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                """, (
                    setting.setting_key,
                    setting.setting_value if setting_type != SettingType.JSON else json.dumps(setting.setting_value),
                    setting.setting_type.value,
                    setting.user_id
                ))
            
            # Update cache
            self.settings_cache[key] = value
            
            logger.debug(f"Set setting: {key} = {value}")
            return True
            
        except Exception as e:
            logger.error(f"Error setting {key}: {e}")
            return False
    
    def get_all_settings(self) -> Dict[str, Any]:
        """Get all settings"""
        return self.settings_cache.copy()
    
    def delete_setting(self, key: str) -> bool:
        """Delete a setting"""
        try:
            with self.db_manager.get_cursor() as cursor:
                cursor.execute("DELETE FROM user_settings WHERE setting_key = ?", (key,))
            
            # Remove from cache
            if key in self.settings_cache:
                del self.settings_cache[key]
            
            logger.debug(f"Deleted setting: {key}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting setting {key}: {e}")
            return False
    
    def add_emergency_contact(self, name: str, phone: str, relationship: Optional[str] = None,
                             priority: int = 1, enabled: bool = True, user_id: Optional[str] = None) -> bool:
        """Add an emergency contact"""
        try:
            contact = EmergencyContact(
                name=name,
                phone=phone,
                relationship=relationship,
                priority=priority,
                enabled=enabled,
                user_id=user_id
            )
            
            with self.db_manager.get_cursor() as cursor:
                cursor.execute("""
                    INSERT INTO emergency_contacts 
                    (name, phone, relationship, priority, enabled, user_id)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    contact.name,
                    contact.phone,
                    contact.relationship,
                    contact.priority,
                    contact.enabled,
                    contact.user_id
                ))
            
            # Add to cache
            self.contacts_cache.append(contact)
            self.contacts_cache.sort(key=lambda x: x.priority)
            
            logger.info(f"Added emergency contact: {name}")
            return True
            
        except Exception as e:
            logger.error(f"Error adding emergency contact: {e}")
            return False
    
    def get_emergency_contacts(self, enabled_only: bool = True) -> List[EmergencyContact]:
        """Get emergency contacts"""
        if enabled_only:
            return [contact for contact in self.contacts_cache if contact.enabled]
        return self.contacts_cache.copy()
    
    def update_emergency_contact(self, contact_id: int, **kwargs) -> bool:
        """Update an emergency contact"""
        try:
            # Get current contact
            with self.db_manager.get_cursor() as cursor:
                cursor.execute("SELECT * FROM emergency_contacts WHERE id = ?", (contact_id,))
                row = cursor.fetchone()
                
                if not row:
                    logger.error(f"Contact with ID {contact_id} not found")
                    return False
                
                # Update fields
                update_fields = []
                update_values = []
                
                for field, value in kwargs.items():
                    if field in ['name', 'phone', 'relationship', 'priority', 'enabled']:
                        update_fields.append(f"{field} = ?")
                        update_values.append(value)
                
                if not update_fields:
                    logger.warning("No valid fields to update")
                    return False
                
                update_values.append(contact_id)
                
                cursor.execute(f"""
                    UPDATE emergency_contacts 
                    SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, update_values)
            
            # Reload cache
            self._load_contacts_cache()
            
            logger.info(f"Updated emergency contact ID {contact_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating emergency contact: {e}")
            return False
    
    def delete_emergency_contact(self, contact_id: int) -> bool:
        """Delete an emergency contact"""
        try:
            with self.db_manager.get_cursor() as cursor:
                cursor.execute("DELETE FROM emergency_contacts WHERE id = ?", (contact_id,))
            
            # Reload cache
            self._load_contacts_cache()
            
            logger.info(f"Deleted emergency contact ID {contact_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting emergency contact: {e}")
            return False
    
    def get_voice_sensitivity(self) -> float:
        """Get voice sensitivity setting"""
        return self.get_setting("voice_sensitivity", 0.8)
    
    def set_voice_sensitivity(self, sensitivity: float) -> bool:
        """Set voice sensitivity setting"""
        return self.set_setting("voice_sensitivity", sensitivity, SettingType.FLOAT)
    
    def get_gesture_sensitivity(self) -> float:
        """Get gesture sensitivity setting"""
        return self.get_setting("gesture_sensitivity", 0.7)
    
    def set_gesture_sensitivity(self, sensitivity: float) -> bool:
        """Set gesture sensitivity setting"""
        return self.set_setting("gesture_sensitivity", sensitivity, SettingType.FLOAT)
    
    def get_emergency_timeout(self) -> int:
        """Get emergency confirmation timeout setting"""
        return self.get_setting("emergency_timeout", 10)
    
    def set_emergency_timeout(self, timeout: int) -> bool:
        """Set emergency confirmation timeout setting"""
        return self.set_setting("emergency_timeout", timeout, SettingType.INTEGER)
    
    def get_tts_settings(self) -> Dict[str, Any]:
        """Get TTS settings"""
        return self.get_setting("tts_settings", {
            "rate": 200,
            "volume": 0.9,
            "voice": "default"
        })
    
    def set_tts_settings(self, settings: Dict[str, Any]) -> bool:
        """Set TTS settings"""
        return self.set_setting("tts_settings", settings, SettingType.JSON)
    
    def export_settings(self, file_path: str) -> bool:
        """Export settings to JSON file"""
        try:
            export_data = {
                "settings": self.settings_cache,
                "emergency_contacts": [contact.to_dict() for contact in self.contacts_cache],
                "export_timestamp": time.time()
            }
            
            with open(file_path, 'w') as f:
                json.dump(export_data, f, indent=2)
            
            logger.info(f"Settings exported to {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error exporting settings: {e}")
            return False
    
    def import_settings(self, file_path: str) -> bool:
        """Import settings from JSON file"""
        try:
            with open(file_path, 'r') as f:
                import_data = json.load(f)
            
            # Import settings
            for key, value in import_data.get("settings", {}).items():
                self.set_setting(key, value, None)
            
            # Import emergency contacts
            for contact_data in import_data.get("emergency_contacts", []):
                contact = EmergencyContact.from_dict(contact_data)
                self.add_emergency_contact(
                    contact.name,
                    contact.phone,
                    contact.relationship,
                    contact.priority,
                    contact.enabled,
                    contact.user_id
                )
            
            logger.info(f"Settings imported from {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error importing settings: {e}")
            return False

def test_settings_manager() -> bool:
    """Test settings manager functionality"""
    try:
        logger.info("Testing settings manager...")
        
        # Create database manager
        db_manager = DatabaseManager("storage/test_settings.db")
        if not db_manager.connect():
            logger.error("Failed to connect to database")
            return False
        
        if not db_manager.create_tables():
            logger.error("Failed to create tables")
            return False
        
        # Create settings manager
        settings_manager = SettingsManager(db_manager)
        
        # Test settings
        settings_manager.set_voice_sensitivity(0.9)
        settings_manager.set_gesture_sensitivity(0.8)
        settings_manager.set_emergency_timeout(15)
        
        # Test emergency contacts
        settings_manager.add_emergency_contact("John Doe", "+1234567890", "Family", 1)
        settings_manager.add_emergency_contact("Jane Smith", "+1234567891", "Friend", 2)
        
        # Test getting settings
        voice_sens = settings_manager.get_voice_sensitivity()
        gesture_sens = settings_manager.get_gesture_sensitivity()
        emergency_timeout = settings_manager.get_emergency_timeout()
        
        logger.info(f"Voice sensitivity: {voice_sens}")
        logger.info(f"Gesture sensitivity: {gesture_sens}")
        logger.info(f"Emergency timeout: {emergency_timeout}")
        
        # Test getting contacts
        contacts = settings_manager.get_emergency_contacts()
        logger.info(f"Emergency contacts: {len(contacts)}")
        
        # Test export/import
        settings_manager.export_settings("storage/test_settings_export.json")
        logger.info("Settings exported successfully")
        
        # Disconnect
        db_manager.disconnect()
        
        # Clean up test database
        test_db = Path("storage/test_settings.db")
        if test_db.exists():
            test_db.unlink()
        
        # Clean up export file
        export_file = Path("storage/test_settings_export.json")
        if export_file.exists():
            export_file.unlink()
        
        logger.info("Settings manager test completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Settings manager test failed: {e}")
        return False

if __name__ == "__main__":
    import time
    # Configure logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    # Test settings manager
    test_settings_manager()
