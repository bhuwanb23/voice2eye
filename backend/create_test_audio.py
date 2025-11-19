"""
Create a simple test audio file for speech recognition testing
"""
import numpy as np
import wave
import sys
from pathlib import Path

def create_test_wav(filename="test_audio.wav", duration=3.0, sample_rate=16000):
    """Create a simple test WAV file with a tone and spoken words"""
    # Create a simple audio signal (combination of tones)
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    
    # Create a simple tone (440 Hz)
    tone = np.sin(2 * np.pi * 440 * t)
    
    # Add some noise to make it more realistic
    noise = np.random.normal(0, 0.1, len(t))
    
    # Combine tone and noise
    audio = tone + noise
    
    # Normalize to 16-bit range
    audio = audio * (2**15 - 1) / np.max(np.abs(audio))
    audio = audio.astype(np.int16)
    
    # Write to WAV file
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)   # 16-bit
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio.tobytes())
    
    print(f"Created test audio file: {filename}")
    print(f"Duration: {duration} seconds")
    print(f"Sample rate: {sample_rate} Hz")

if __name__ == "__main__":
    # Create test audio file in the backend directory
    backend_dir = Path(__file__).parent
    test_file = backend_dir / "test_audio.wav"
    create_test_wav(str(test_file))
    print(f"Test audio file created at: {test_file}")