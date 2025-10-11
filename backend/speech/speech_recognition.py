"""
Speech Recognition Service using Vosk ASR
Handles real-time speech-to-text conversion with confidence scoring
"""
import json
import logging
import threading
import time
from typing import Optional, Callable, Dict, Any
from pathlib import Path

try:
    import vosk
    VOSK_AVAILABLE = True
except ImportError:
    VOSK_AVAILABLE = False
    logging.warning("Vosk not available. Install with: pip install vosk")

import numpy as np
import pyaudio

from .audio_processing import AudioProcessor, NoiseReducer
from config.settings import (
    VOSK_MODEL_PATH, SAMPLE_RATE, CHUNK_SIZE, CONFIDENCE_THRESHOLD,
    LISTENING_TIMEOUT, EMERGENCY_KEYWORDS
)

logger = logging.getLogger(__name__)

class SpeechRecognitionService:
    """Main speech recognition service using Vosk ASR"""
    
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or str(VOSK_MODEL_PATH)
        self.model = None
        self.recognizer = None
        self.audio_processor = AudioProcessor(SAMPLE_RATE, CHUNK_SIZE)
        self.noise_reducer = NoiseReducer(SAMPLE_RATE)
        
        self.is_listening = False
        self.is_continuous = False
        self.confidence_threshold = CONFIDENCE_THRESHOLD
        
        # Callbacks
        self.on_result_callback: Optional[Callable] = None
        self.on_emergency_callback: Optional[Callable] = None
        
        # Threading
        self.listening_thread: Optional[threading.Thread] = None
        self.stop_event = threading.Event()
        
    def initialize_model(self) -> bool:
        """Initialize Vosk model and recognizer"""
        try:
            if not VOSK_AVAILABLE:
                logger.error("Vosk is not installed. Please install with: pip install vosk")
                return False
            
            if not Path(self.model_path).exists():
                logger.error(f"Vosk model not found at: {self.model_path}")
                logger.info("Please download a model from: https://alphacephei.com/vosk/models")
                return False
            
            # Set Vosk log level
            vosk.SetLogLevel(-1)  # Suppress Vosk logs
            
            # Load model
            logger.info(f"Loading Vosk model from: {self.model_path}")
            self.model = vosk.Model(self.model_path)
            self.recognizer = vosk.KaldiRecognizer(self.model, SAMPLE_RATE)
            
            logger.info("Vosk model loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize Vosk model: {e}")
            return False
    
    def set_callbacks(self, on_result: Optional[Callable] = None, 
                     on_emergency: Optional[Callable] = None):
        """Set callback functions for results and emergency detection"""
        self.on_result_callback = on_result
        self.on_emergency_callback = on_emergency
    
    def _process_audio_chunk(self, audio_data: bytes) -> Optional[Dict[str, Any]]:
        """Process a chunk of audio data and return recognition result"""
        try:
            if not self.recognizer:
                return None
            
            # Apply noise reduction
            audio_array = np.frombuffer(audio_data, dtype=np.int16)
            processed_audio = self.noise_reducer.preprocess_audio(audio_array)
            
            # Convert back to bytes
            processed_bytes = processed_audio.tobytes()
            
            # Feed to recognizer
            if self.recognizer.AcceptWaveform(processed_bytes):
                result = json.loads(self.recognizer.Result())
                return result
            else:
                # Partial result
                partial_result = json.loads(self.recognizer.PartialResult())
                return partial_result
                
        except Exception as e:
            logger.error(f"Error processing audio chunk: {e}")
            return None
    
    def _detect_emergency(self, text: str) -> bool:
        """Check if the recognized text contains emergency keywords"""
        if not text:
            return False
        
        text_lower = text.lower().strip()
        for keyword in EMERGENCY_KEYWORDS:
            if keyword in text_lower:
                return True
        return False
    
    def _audio_callback(self, in_data, frame_count, time_info, status):
        """Callback function for audio stream"""
        try:
            if self.stop_event.is_set():
                return (None, pyaudio.paComplete)
            
            # Process audio chunk
            result = self._process_audio_chunk(in_data)
            
            if result and 'text' in result:
                text = result['text'].strip()
                confidence = result.get('confidence', 0.0)
                
                if text and confidence >= self.confidence_threshold:
                    logger.info(f"Recognized: '{text}' (confidence: {confidence:.2f})")
                    
                    # Check for emergency
                    if self._detect_emergency(text):
                        logger.warning(f"EMERGENCY DETECTED: '{text}'")
                        if self.on_emergency_callback:
                            self.on_emergency_callback(text, confidence)
                    
                    # Call result callback
                    if self.on_result_callback:
                        self.on_result_callback(text, confidence)
            
            return (None, pyaudio.paContinue)
            
        except Exception as e:
            logger.error(f"Audio callback error: {e}")
            return (None, pyaudio.paComplete)
    
    def start_listening(self, continuous: bool = False) -> bool:
        """Start speech recognition"""
        try:
            if not self.model or not self.recognizer:
                if not self.initialize_model():
                    return False
            
            if not self.audio_processor.initialize_audio():
                return False
            
            self.is_continuous = continuous
            self.stop_event.clear()
            
            # Start audio recording with callback
            if not self.audio_processor.start_recording(self._audio_callback):
                return False
            
            self.is_listening = True
            logger.info(f"Speech recognition started (continuous: {continuous})")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start listening: {e}")
            return False
    
    def stop_listening(self):
        """Stop speech recognition"""
        try:
            self.stop_event.set()
            self.audio_processor.stop_recording()
            self.is_listening = False
            logger.info("Speech recognition stopped")
            
        except Exception as e:
            logger.error(f"Error stopping listening: {e}")
    
    def listen_once(self, timeout: float = LISTENING_TIMEOUT) -> Optional[Dict[str, Any]]:
        """Listen for speech once and return result"""
        try:
            if not self.start_listening(continuous=False):
                return None
            
            # Wait for result or timeout
            start_time = time.time()
            while time.time() - start_time < timeout:
                if not self.is_listening:
                    break
                time.sleep(0.1)
            
            self.stop_listening()
            
            # Get final result
            if self.recognizer:
                final_result = json.loads(self.recognizer.FinalResult())
                return final_result
            
            return None
            
        except Exception as e:
            logger.error(f"Error in listen_once: {e}")
            self.stop_listening()
            return None
    
    def cleanup(self):
        """Clean up resources"""
        self.stop_listening()
        self.audio_processor.cleanup()
        logger.info("Speech recognition service cleaned up")

# Convenience functions
def create_speech_service(model_path: Optional[str] = None) -> SpeechRecognitionService:
    """Create and initialize a speech recognition service"""
    service = SpeechRecognitionService(model_path)
    if not service.initialize_model():
        logger.error("Failed to initialize speech service")
        return None
    return service

def test_speech_recognition() -> bool:
    """Test speech recognition functionality"""
    try:
        service = create_speech_service()
        if not service:
            return False
        
        logger.info("Testing speech recognition...")
        logger.info("Say something for 3 seconds...")
        
        result = service.listen_once(timeout=3.0)
        service.cleanup()
        
        if result and result.get('text'):
            logger.info(f"Test successful! Recognized: '{result['text']}'")
            return True
        else:
            logger.warning("No speech detected in test")
            return False
            
    except Exception as e:
        logger.error(f"Speech recognition test failed: {e}")
        return False
