"""
Unit tests for VOICE2EYE Speech Processing Module
"""
import unittest
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent))

from speech.audio_processing import AudioProcessor, NoiseReducer
from speech.speech_recognition import SpeechRecognitionService
from speech.text_to_speech import TextToSpeechService
import numpy as np

class TestAudioProcessing(unittest.TestCase):
    """Test audio processing functionality"""
    
    def setUp(self):
        self.audio_processor = AudioProcessor()
        self.noise_reducer = NoiseReducer()
    
    def test_audio_processor_initialization(self):
        """Test audio processor initialization"""
        # This test might fail if no microphone is available
        # That's expected in some environments
        try:
            result = self.audio_processor.initialize_audio()
            # Don't assert True/False as it depends on hardware
            self.assertIsInstance(result, bool)
        except Exception as e:
            self.fail(f"Audio processor initialization failed: {e}")
    
    def test_noise_reduction(self):
        """Test noise reduction functions"""
        # Create test audio data
        test_audio = np.random.randint(-1000, 1000, 1000, dtype=np.int16)
        
        # Test high-pass filter
        filtered = self.noise_reducer.apply_high_pass_filter(test_audio)
        self.assertEqual(len(filtered), len(test_audio))
        
        # Test noise gate
        gated = self.noise_reducer.apply_noise_gate(test_audio)
        self.assertEqual(len(gated), len(test_audio))
        
        # Test normalization
        normalized = self.noise_reducer.normalize_audio(test_audio)
        self.assertEqual(len(normalized), len(test_audio))
        
        # Test complete preprocessing
        processed = self.noise_reducer.preprocess_audio(test_audio)
        self.assertEqual(len(processed), len(test_audio))

class TestSpeechRecognition(unittest.TestCase):
    """Test speech recognition functionality"""
    
    def setUp(self):
        self.speech_service = SpeechRecognitionService()
    
    def test_speech_service_initialization(self):
        """Test speech service initialization"""
        # This test might fail if Vosk model is not available
        try:
            result = self.speech_service.initialize_model()
            # Don't assert True/False as it depends on model availability
            self.assertIsInstance(result, bool)
        except Exception as e:
            self.fail(f"Speech service initialization failed: {e}")
    
    def test_emergency_detection(self):
        """Test emergency keyword detection"""
        # Test emergency keywords
        emergency_texts = ["help", "emergency", "sos", "assist", "urgent"]
        for text in emergency_texts:
            result = self.speech_service._detect_emergency(text)
            self.assertTrue(result, f"Failed to detect emergency in: {text}")
        
        # Test non-emergency text
        normal_texts = ["hello", "good morning", "how are you"]
        for text in normal_texts:
            result = self.speech_service._detect_emergency(text)
            self.assertFalse(result, f"False emergency detection in: {text}")

class TestTextToSpeech(unittest.TestCase):
    """Test text-to-speech functionality"""
    
    def setUp(self):
        self.tts_service = TextToSpeechService()
    
    def test_tts_service_initialization(self):
        """Test TTS service initialization"""
        try:
            result = self.tts_service.initialize()
            # Don't assert True/False as it depends on system TTS availability
            self.assertIsInstance(result, bool)
        except Exception as e:
            self.fail(f"TTS service initialization failed: {e}")
    
    def test_voice_settings(self):
        """Test voice setting functions"""
        if self.tts_service.is_initialized:
            # Test rate setting
            original_rate = self.tts_service.rate
            self.tts_service.set_rate(150)
            self.assertEqual(self.tts_service.rate, 150)
            self.tts_service.set_rate(original_rate)
            
            # Test volume setting
            original_volume = self.tts_service.volume
            self.tts_service.set_volume(0.8)
            self.assertEqual(self.tts_service.volume, 0.8)
            self.tts_service.set_volume(original_volume)
    
    def test_available_voices(self):
        """Test getting available voices"""
        if self.tts_service.is_initialized:
            voices = self.tts_service.get_available_voices()
            self.assertIsInstance(voices, list)
            # Each voice should have required attributes
            for voice in voices:
                self.assertIn('id', voice)
                self.assertIn('name', voice)

def run_tests():
    """Run all tests"""
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add test cases
    test_suite.addTest(unittest.makeSuite(TestAudioProcessing))
    test_suite.addTest(unittest.makeSuite(TestSpeechRecognition))
    test_suite.addTest(unittest.makeSuite(TestTextToSpeech))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    return result.wasSuccessful()

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
