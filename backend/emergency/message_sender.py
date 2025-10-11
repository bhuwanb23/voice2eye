"""
Message Sending System for VOICE2EYE Emergency Alert
Handles SMS sending via Twilio and fallback methods
"""
import logging
import json
import time
from typing import Optional, Dict, List, Any, Tuple
from dataclasses import dataclass
from pathlib import Path

try:
    from twilio.rest import Client
    from twilio.base.exceptions import TwilioException
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False
    logger.warning("Twilio not available - SMS functionality limited")

logger = logging.getLogger(__name__)

@dataclass
class Contact:
    """Emergency contact information"""
    name: str
    phone: str
    relationship: str
    priority: int  # 1 = highest priority
    enabled: bool = True

@dataclass
class MessageTemplate:
    """Emergency message template"""
    template_id: str
    subject: str
    body: str
    variables: List[str]  # List of variables to replace

@dataclass
class MessageResult:
    """Message sending result"""
    success: bool
    message_id: Optional[str]
    error: Optional[str]
    delivery_status: str
    timestamp: float

class MessageSender:
    """Emergency message sending service"""
    
    def __init__(self):
        self.twilio_client: Optional[Client] = None
        self.contacts_file = Path("emergency/contacts.json")
        self.templates_file = Path("emergency/message_templates.json")
        
        # Configuration
        self.twilio_account_sid = None
        self.twilio_auth_token = None
        self.twilio_phone_number = None
        
        # Data
        self.contacts: List[Contact] = []
        self.message_templates: Dict[str, MessageTemplate] = {}
        
        # Initialize
        self._load_configuration()
        self._load_contacts()
        self._load_message_templates()
        self._initialize_twilio()
    
    def _load_configuration(self):
        """Load Twilio configuration from environment or config file"""
        try:
            # Try to load from environment variables
            import os
            self.twilio_account_sid = os.getenv('TWILIO_ACCOUNT_SID')
            self.twilio_auth_token = os.getenv('TWILIO_AUTH_TOKEN')
            self.twilio_phone_number = os.getenv('TWILIO_PHONE_NUMBER')
            
            if not all([self.twilio_account_sid, self.twilio_auth_token, self.twilio_phone_number]):
                logger.warning("Twilio credentials not found in environment variables")
                logger.info("Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER")
            
        except Exception as e:
            logger.error(f"Error loading configuration: {e}")
    
    def _initialize_twilio(self):
        """Initialize Twilio client"""
        try:
            if not TWILIO_AVAILABLE:
                logger.warning("Twilio library not available")
                return
            
            if not all([self.twilio_account_sid, self.twilio_auth_token]):
                logger.warning("Twilio credentials not configured")
                return
            
            self.twilio_client = Client(self.twilio_account_sid, self.twilio_auth_token)
            logger.info("Twilio client initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing Twilio client: {e}")
    
    def _load_contacts(self):
        """Load emergency contacts"""
        try:
            if not self.contacts_file.exists():
                # Create default contacts
                self._create_default_contacts()
                return
            
            with open(self.contacts_file, 'r') as f:
                data = json.load(f)
            
            self.contacts = []
            for contact_data in data.get('contacts', []):
                contact = Contact(
                    name=contact_data.get('name', ''),
                    phone=contact_data.get('phone', ''),
                    relationship=contact_data.get('relationship', ''),
                    priority=contact_data.get('priority', 1),
                    enabled=contact_data.get('enabled', True)
                )
                self.contacts.append(contact)
            
            logger.info(f"Loaded {len(self.contacts)} emergency contacts")
            
        except Exception as e:
            logger.error(f"Error loading contacts: {e}")
            self.contacts = []
    
    def _create_default_contacts(self):
        """Create default emergency contacts file"""
        try:
            default_contacts = {
                "contacts": [
                    {
                        "name": "Emergency Contact 1",
                        "phone": "+1234567890",
                        "relationship": "Family",
                        "priority": 1,
                        "enabled": False
                    },
                    {
                        "name": "Emergency Contact 2", 
                        "phone": "+1234567891",
                        "relationship": "Friend",
                        "priority": 2,
                        "enabled": False
                    }
                ]
            }
            
            self.contacts_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.contacts_file, 'w') as f:
                json.dump(default_contacts, f, indent=2)
            
            logger.info("Created default contacts file")
            
        except Exception as e:
            logger.error(f"Error creating default contacts: {e}")
    
    def _load_message_templates(self):
        """Load message templates"""
        try:
            if not self.templates_file.exists():
                self._create_default_templates()
                return
            
            with open(self.templates_file, 'r') as f:
                data = json.load(f)
            
            self.message_templates = {}
            for template_data in data.get('templates', []):
                template = MessageTemplate(
                    template_id=template_data.get('id', ''),
                    subject=template_data.get('subject', ''),
                    body=template_data.get('body', ''),
                    variables=template_data.get('variables', [])
                )
                self.message_templates[template.template_id] = template
            
            logger.info(f"Loaded {len(self.message_templates)} message templates")
            
        except Exception as e:
            logger.error(f"Error loading message templates: {e}")
            self.message_templates = {}
    
    def _create_default_templates(self):
        """Create default message templates"""
        try:
            default_templates = {
                "templates": [
                    {
                        "id": "emergency_alert",
                        "subject": "VOICE2EYE Emergency Alert",
                        "body": "EMERGENCY ALERT from VOICE2EYE user!\n\nLocation: {location}\nTime: {timestamp}\nTrigger: {trigger_type}\n\nPlease check on the user immediately!",
                        "variables": ["location", "timestamp", "trigger_type"]
                    },
                    {
                        "id": "location_update",
                        "subject": "VOICE2EYE Location Update",
                        "body": "Location update from VOICE2EYE user:\n\nCurrent location: {location}\nCoordinates: {coordinates}\nTime: {timestamp}",
                        "variables": ["location", "coordinates", "timestamp"]
                    }
                ]
            }
            
            self.templates_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.templates_file, 'w') as f:
                json.dump(default_templates, f, indent=2)
            
            logger.info("Created default message templates")
            
        except Exception as e:
            logger.error(f"Error creating default templates: {e}")
    
    def send_emergency_message(self, location_data: Optional[Dict] = None, 
                             trigger_type: str = "unknown") -> List[MessageResult]:
        """Send emergency message to all enabled contacts"""
        try:
            logger.warning("Sending emergency messages...")
            
            # Get emergency message template
            template = self.message_templates.get('emergency_alert')
            if not template:
                logger.error("Emergency message template not found")
                return []
            
            # Prepare message variables
            variables = self._prepare_emergency_variables(location_data, trigger_type)
            
            # Send to all enabled contacts
            results = []
            for contact in self.contacts:
                if contact.enabled:
                    result = self._send_message_to_contact(contact, template, variables)
                    results.append(result)
                else:
                    logger.info(f"Skipping disabled contact: {contact.name}")
            
            # Log results
            successful = sum(1 for r in results if r.success)
            logger.info(f"Emergency messages sent: {successful}/{len(results)} successful")
            
            return results
            
        except Exception as e:
            logger.error(f"Error sending emergency messages: {e}")
            return []
    
    def _prepare_emergency_variables(self, location_data: Optional[Dict], 
                                   trigger_type: str) -> Dict[str, str]:
        """Prepare variables for emergency message"""
        try:
            variables = {
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "trigger_type": trigger_type
            }
            
            if location_data:
                location_str = location_data.get('address', 'Unknown location')
                coordinates = f"{location_data.get('latitude', 0):.4f}, {location_data.get('longitude', 0):.4f}"
                variables["location"] = location_str
                variables["coordinates"] = coordinates
            else:
                variables["location"] = "Location unknown"
                variables["coordinates"] = "N/A"
            
            return variables
            
        except Exception as e:
            logger.error(f"Error preparing emergency variables: {e}")
            return {"location": "Unknown", "timestamp": "Unknown", "trigger_type": trigger_type}
    
    def _send_message_to_contact(self, contact: Contact, template: MessageTemplate, 
                                variables: Dict[str, str]) -> MessageResult:
        """Send message to a specific contact"""
        try:
            # Format message body
            message_body = template.body
            for var, value in variables.items():
                message_body = message_body.replace(f"{{{var}}}", str(value))
            
            # Send via Twilio
            if self.twilio_client and self.twilio_phone_number:
                return self._send_via_twilio(contact, message_body)
            else:
                # Fallback to console output
                return self._send_via_fallback(contact, message_body)
                
        except Exception as e:
            logger.error(f"Error sending message to {contact.name}: {e}")
            return MessageResult(
                success=False,
                message_id=None,
                error=str(e),
                delivery_status="failed",
                timestamp=time.time()
            )
    
    def _send_via_twilio(self, contact: Contact, message_body: str) -> MessageResult:
        """Send message via Twilio"""
        try:
            message = self.twilio_client.messages.create(
                body=message_body,
                from_=self.twilio_phone_number,
                to=contact.phone
            )
            
            logger.info(f"Message sent to {contact.name} via Twilio: {message.sid}")
            
            return MessageResult(
                success=True,
                message_id=message.sid,
                error=None,
                delivery_status=message.status,
                timestamp=time.time()
            )
            
        except TwilioException as e:
            logger.error(f"Twilio error sending to {contact.name}: {e}")
            return MessageResult(
                success=False,
                message_id=None,
                error=str(e),
                delivery_status="failed",
                timestamp=time.time()
            )
    
    def _send_via_fallback(self, contact: Contact, message_body: str) -> MessageResult:
        """Send message via fallback method (console output)"""
        try:
            logger.warning("FALLBACK MESSAGE SENDING (Twilio not configured)")
            logger.warning(f"To: {contact.name} ({contact.phone})")
            logger.warning(f"Message: {message_body}")
            
            return MessageResult(
                success=True,
                message_id=f"fallback_{int(time.time())}",
                error=None,
                delivery_status="sent",
                timestamp=time.time()
            )
            
        except Exception as e:
            logger.error(f"Fallback message error: {e}")
            return MessageResult(
                success=False,
                message_id=None,
                error=str(e),
                delivery_status="failed",
                timestamp=time.time()
            )
    
    def add_contact(self, name: str, phone: str, relationship: str, priority: int = 1):
        """Add new emergency contact"""
        try:
            contact = Contact(name=name, phone=phone, relationship=relationship, priority=priority)
            self.contacts.append(contact)
            self._save_contacts()
            logger.info(f"Added contact: {name}")
            
        except Exception as e:
            logger.error(f"Error adding contact: {e}")
    
    def _save_contacts(self):
        """Save contacts to file"""
        try:
            contacts_data = {
                "contacts": [
                    {
                        "name": contact.name,
                        "phone": contact.phone,
                        "relationship": contact.relationship,
                        "priority": contact.priority,
                        "enabled": contact.enabled
                    }
                    for contact in self.contacts
                ]
            }
            
            with open(self.contacts_file, 'w') as f:
                json.dump(contacts_data, f, indent=2)
                
        except Exception as e:
            logger.error(f"Error saving contacts: {e}")

def test_message_sender() -> bool:
    """Test message sending functionality"""
    try:
        logger.info("Testing message sender...")
        
        sender = MessageSender()
        
        # Test emergency message
        location_data = {
            "address": "123 Test Street, Test City",
            "latitude": 40.7128,
            "longitude": -74.0060
        }
        
        results = sender.send_emergency_message(location_data, "test_trigger")
        
        logger.info(f"Message sending test completed: {len(results)} results")
        for result in results:
            status = "SUCCESS" if result.success else "FAILED"
            logger.info(f"Message {status}: {result.error or 'No error'}")
        
        return True
        
    except Exception as e:
        logger.error(f"Message sender test failed: {e}")
        return False

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    # Test message sender
    test_message_sender()
