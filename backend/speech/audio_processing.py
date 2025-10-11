"""
Audio processing utilities for VOICE2EYE
Handles microphone access, audio capture, and noise reduction
"""
import pyaudio
import numpy as np
import scipy.signal as signal
from typing import Optional, Callable
import logging

logger = logging.getLogger(__name__)

class AudioProcessor:
    """Handles audio input/output operations"""
    
    def __init__(self, sample_rate: int = 16000, chunk_size: int = 4000):
        self.sample_rate = sample_rate
        self.chunk_size = chunk_size
        self.audio = None
        self.stream = None
        self.is_recording = False
        
    def initialize_audio(self) -> bool:
        """Initialize PyAudio and test microphone access"""
        try:
            self.audio = pyaudio.PyAudio()
            
            # Test microphone access
            device_count = self.audio.get_device_count()
            logger.info(f"Found {device_count} audio devices")
            
            # Find default input device
            default_device = self.audio.get_default_input_device_info()
            logger.info(f"Default input device: {default_device['name']}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize audio: {e}")
            return False
    
    def start_recording(self, callback: Optional[Callable] = None) -> bool:
        """Start audio recording stream"""
        try:
            if not self.audio:
                if not self.initialize_audio():
                    return False
            
            self.stream = self.audio.open(
                format=pyaudio.paInt16,
                channels=1,
                rate=self.sample_rate,
                input=True,
                frames_per_buffer=self.chunk_size,
                stream_callback=callback
            )
            
            self.is_recording = True
            logger.info("Audio recording started")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start recording: {e}")
            return False
    
    def stop_recording(self):
        """Stop audio recording stream"""
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
            self.stream = None
        
        self.is_recording = False
        logger.info("Audio recording stopped")
    
    def cleanup(self):
        """Clean up audio resources"""
        self.stop_recording()
        if self.audio:
            self.audio.terminate()
            self.audio = None

class NoiseReducer:
    """Handles noise reduction and audio preprocessing"""
    
    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate
        
    def apply_high_pass_filter(self, audio_data: np.ndarray, cutoff_freq: float = 80.0) -> np.ndarray:
        """Apply high-pass filter to remove low-frequency noise"""
        try:
            nyquist = self.sample_rate / 2
            normalized_cutoff = cutoff_freq / nyquist
            
            # Design Butterworth high-pass filter
            b, a = signal.butter(4, normalized_cutoff, btype='high', analog=False)
            
            # Apply filter
            filtered_audio = signal.filtfilt(b, a, audio_data)
            return filtered_audio
            
        except Exception as e:
            logger.error(f"High-pass filter failed: {e}")
            return audio_data
    
    def apply_noise_gate(self, audio_data: np.ndarray, threshold: float = 0.01) -> np.ndarray:
        """Apply noise gate to reduce background noise"""
        try:
            # Convert to float for processing
            audio_float = audio_data.astype(np.float32) / 32768.0
            
            # Apply noise gate
            audio_float[np.abs(audio_float) < threshold] = 0
            
            # Convert back to int16
            return (audio_float * 32768.0).astype(np.int16)
            
        except Exception as e:
            logger.error(f"Noise gate failed: {e}")
            return audio_data
    
    def normalize_audio(self, audio_data: np.ndarray) -> np.ndarray:
        """Normalize audio to prevent clipping"""
        try:
            # Convert to float
            audio_float = audio_data.astype(np.float32) / 32768.0
            
            # Normalize
            max_val = np.max(np.abs(audio_float))
            if max_val > 0:
                audio_float = audio_float / max_val * 0.95
            
            # Convert back to int16
            return (audio_float * 32768.0).astype(np.int16)
            
        except Exception as e:
            logger.error(f"Audio normalization failed: {e}")
            return audio_data
    
    def preprocess_audio(self, audio_data: np.ndarray) -> np.ndarray:
        """Apply complete audio preprocessing pipeline"""
        try:
            # Apply noise reduction pipeline
            processed = self.apply_high_pass_filter(audio_data)
            processed = self.apply_noise_gate(processed)
            processed = self.normalize_audio(processed)
            
            return processed
            
        except Exception as e:
            logger.error(f"Audio preprocessing failed: {e}")
            return audio_data

def test_microphone_access() -> bool:
    """Test if microphone is accessible and working"""
    try:
        processor = AudioProcessor()
        
        if not processor.initialize_audio():
            return False
        
        # Test recording for 1 second
        if not processor.start_recording():
            return False
        
        import time
        time.sleep(1)
        
        processor.stop_recording()
        processor.cleanup()
        
        logger.info("Microphone test successful")
        return True
        
    except Exception as e:
        logger.error(f"Microphone test failed: {e}")
        return False
