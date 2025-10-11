"""
Text-to-Speech Service using pyttsx3
Handles voice synthesis with customizable settings
"""
import logging
import threading
import queue
from typing import Optional, List, Dict, Any

try:
    import pyttsx3
    PYTTSX3_AVAILABLE = True
except ImportError:
    PYTTSX3_AVAILABLE = False
    logging.warning("pyttsx3 not available. Install with: pip install pyttsx3")

from config.settings import TTS_RATE, TTS_VOLUME, TTS_VOICE_ID

logger = logging.getLogger(__name__)

class TextToSpeechService:
    """Text-to-Speech service using pyttsx3"""
    
    def __init__(self):
        self.engine = None
        self.is_initialized = False
        self.is_speaking = False
        
        # Speech queue for managing multiple messages
        self.speech_queue = queue.Queue()
        self.queue_thread: Optional[threading.Thread] = None
        self.stop_queue = threading.Event()
        
        # Settings
        self.rate = TTS_RATE
        self.volume = TTS_VOLUME
        self.voice_id = TTS_VOICE_ID
        
        # Available voices
        self.available_voices: List[Dict[str, Any]] = []
        
    def initialize(self) -> bool:
        """Initialize TTS engine"""
        try:
            if not PYTTSX3_AVAILABLE:
                logger.error("pyttsx3 is not installed. Please install with: pip install pyttsx3")
                return False
            
            self.engine = pyttsx3.init()
            
            # Get available voices
            voices = self.engine.getProperty('voices')
            self.available_voices = []
            
            for i, voice in enumerate(voices):
                voice_info = {
                    'id': i,
                    'name': voice.name,
                    'languages': voice.languages,
                    'gender': voice.gender,
                    'age': voice.age
                }
                self.available_voices.append(voice_info)
                logger.info(f"Voice {i}: {voice.name} ({voice.gender})")
            
            # Set default voice
            if self.available_voices:
                self.set_voice(self.voice_id)
            
            # Set rate and volume
            self.set_rate(self.rate)
            self.set_volume(self.volume)
            
            self.is_initialized = True
            logger.info("TTS service initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize TTS service: {e}")
            return False
    
    def set_voice(self, voice_id: int) -> bool:
        """Set the voice to use for speech synthesis"""
        try:
            if not self.is_initialized or not self.engine:
                return False
            
            if voice_id >= len(self.available_voices):
                logger.warning(f"Voice ID {voice_id} not available")
                return False
            
            voices = self.engine.getProperty('voices')
            self.engine.setProperty('voice', voices[voice_id].id)
            self.voice_id = voice_id
            
            logger.info(f"Voice set to: {self.available_voices[voice_id]['name']}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to set voice: {e}")
            return False
    
    def set_rate(self, rate: int):
        """Set speech rate (words per minute)"""
        try:
            if self.engine:
                self.engine.setProperty('rate', rate)
                self.rate = rate
                logger.debug(f"Speech rate set to: {rate}")
        except Exception as e:
            logger.error(f"Failed to set speech rate: {e}")
    
    def set_volume(self, volume: float):
        """Set speech volume (0.0 to 1.0)"""
        try:
            if self.engine:
                self.engine.setProperty('volume', volume)
                self.volume = volume
                logger.debug(f"Speech volume set to: {volume}")
        except Exception as e:
            logger.error(f"Failed to set speech volume: {e}")
    
    def speak(self, text: str, interrupt: bool = True) -> bool:
        """Speak the given text"""
        try:
            if not self.is_initialized or not self.engine:
                logger.error("TTS service not initialized")
                return False
            
            if not text or not text.strip():
                logger.warning("Empty text provided for speech")
                return False
            
            # Interrupt current speech if requested
            if interrupt and self.is_speaking:
                self.stop_speaking()
            
            logger.info(f"Speaking: '{text[:50]}{'...' if len(text) > 50 else ''}'")
            
            self.is_speaking = True
            self.engine.say(text)
            self.engine.runAndWait()
            self.is_speaking = False
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to speak text: {e}")
            self.is_speaking = False
            return False
    
    def stop_speaking(self):
        """Stop current speech"""
        try:
            if self.engine and self.is_speaking:
                self.engine.stop()
                self.is_speaking = False
                logger.info("Speech stopped")
        except Exception as e:
            logger.error(f"Failed to stop speech: {e}")
    
    def speak_async(self, text: str):
        """Add text to speech queue for asynchronous speaking"""
        try:
            if not text or not text.strip():
                return
            
            self.speech_queue.put(text)
            
            # Start queue processing if not already running
            if not self.queue_thread or not self.queue_thread.is_alive():
                self.start_queue_processing()
                
        except Exception as e:
            logger.error(f"Failed to add text to speech queue: {e}")
    
    def start_queue_processing(self):
        """Start processing the speech queue"""
        try:
            self.stop_queue.clear()
            self.queue_thread = threading.Thread(target=self._process_queue, daemon=True)
            self.queue_thread.start()
            logger.info("Speech queue processing started")
        except Exception as e:
            logger.error(f"Failed to start queue processing: {e}")
    
    def stop_queue_processing(self):
        """Stop processing the speech queue"""
        try:
            self.stop_queue.set()
            if self.queue_thread and self.queue_thread.is_alive():
                self.queue_thread.join(timeout=1.0)
            logger.info("Speech queue processing stopped")
        except Exception as e:
            logger.error(f"Failed to stop queue processing: {e}")
    
    def _process_queue(self):
        """Process the speech queue"""
        try:
            while not self.stop_queue.is_set():
                try:
                    # Get text from queue with timeout
                    text = self.speech_queue.get(timeout=1.0)
                    if text:
                        self.speak(text, interrupt=False)
                        self.speech_queue.task_done()
                except queue.Empty:
                    continue
                except Exception as e:
                    logger.error(f"Error processing speech queue: {e}")
                    
        except Exception as e:
            logger.error(f"Speech queue processing error: {e}")
    
    def speak_emergency(self, message: str):
        """Speak emergency message with urgent tone"""
        try:
            # Save current settings
            original_rate = self.rate
            original_volume = self.volume
            
            # Set urgent tone (faster rate, higher volume)
            self.set_rate(200)  # Faster speech
            self.set_volume(1.0)  # Maximum volume
            
            # Speak emergency message
            emergency_text = f"EMERGENCY ALERT: {message}"
            self.speak(emergency_text, interrupt=True)
            
            # Restore original settings
            self.set_rate(original_rate)
            self.set_volume(original_volume)
            
            logger.warning(f"Emergency message spoken: {message}")
            
        except Exception as e:
            logger.error(f"Failed to speak emergency message: {e}")
    
    def speak_confirmation(self, message: str):
        """Speak confirmation message with calm tone"""
        try:
            # Save current settings
            original_rate = self.rate
            
            # Set calm tone (slower rate)
            self.set_rate(120)  # Slower speech
            
            # Speak confirmation
            confirmation_text = f"Confirmed: {message}"
            self.speak(confirmation_text, interrupt=True)
            
            # Restore original rate
            self.set_rate(original_rate)
            
            logger.info(f"Confirmation spoken: {message}")
            
        except Exception as e:
            logger.error(f"Failed to speak confirmation: {e}")
    
    def get_available_voices(self) -> List[Dict[str, Any]]:
        """Get list of available voices"""
        return self.available_voices.copy()
    
    def cleanup(self):
        """Clean up TTS resources"""
        try:
            self.stop_speaking()
            self.stop_queue_processing()
            
            if self.engine:
                self.engine.stop()
                self.engine = None
            
            self.is_initialized = False
            logger.info("TTS service cleaned up")
            
        except Exception as e:
            logger.error(f"Error cleaning up TTS service: {e}")

# Convenience functions
def create_tts_service() -> TextToSpeechService:
    """Create and initialize a TTS service"""
    service = TextToSpeechService()
    if not service.initialize():
        logger.error("Failed to initialize TTS service")
        return None
    return service

def test_text_to_speech() -> bool:
    """Test TTS functionality"""
    try:
        service = create_tts_service()
        if not service:
            return False
        
        logger.info("Testing text-to-speech...")
        
        # Test basic speech
        test_message = "Hello, this is a test of the text-to-speech system."
        if not service.speak(test_message):
            return False
        
        # Test emergency tone
        service.speak_emergency("Test emergency message")
        
        # Test confirmation tone
        service.speak_confirmation("Test confirmation message")
        
        service.cleanup()
        
        logger.info("TTS test successful")
        return True
        
    except Exception as e:
        logger.error(f"TTS test failed: {e}")
        return False
