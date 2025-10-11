"""
Configuration settings for VOICE2EYE Speech Processing Module
"""
import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).parent.parent
MODELS_DIR = BASE_DIR / "models" / "vosk_models"
LOGS_DIR = BASE_DIR / "logs"

# Audio settings
SAMPLE_RATE = 16000
CHUNK_SIZE = 4000
CHANNELS = 1
FORMAT = "int16"

# Vosk model settings
VOSK_MODEL_NAME = "vosk-model-small-en-us-0.15"
VOSK_MODEL_PATH = MODELS_DIR / VOSK_MODEL_NAME

# Speech recognition settings
CONFIDENCE_THRESHOLD = 0.7
LISTENING_TIMEOUT = 5.0  # seconds
SILENCE_THRESHOLD = 0.01

# TTS settings
TTS_RATE = 150
TTS_VOLUME = 0.8
TTS_VOICE_ID = 0  # Default voice

# Emergency keywords
EMERGENCY_KEYWORDS = ["help", "emergency", "sos", "assist", "urgent"]

# Gesture Recognition Settings
GESTURE_CONFIDENCE_THRESHOLD = 0.7
GESTURE_HOLD_TIME = 1.0  # seconds
GESTURE_SEQUENCE_TIMEOUT = 3.0  # seconds
GESTURE_SMOOTHING_FACTOR = 0.3
GESTURE_MIN_DETECTION_FRAMES = 5

# Camera settings
CAMERA_WIDTH = 640
CAMERA_HEIGHT = 480
CAMERA_FPS = 30
CAMERA_INDEX = 0  # Default camera

# OpenCV Hand Detection settings
OPENCV_MIN_HAND_AREA = 1000
OPENCV_MAX_HAND_AREA = 50000
OPENCV_SKIN_LOWER = [0, 20, 70]
OPENCV_SKIN_UPPER = [20, 255, 255]

# Gesture vocabulary
GESTURE_VOCABULARY = {
    "open_hand": "Start listening",
    "fist": "Stop listening", 
    "two_fingers": "Emergency",
    "thumbs_up": "Yes/Confirm",
    "thumbs_down": "No/Cancel",
    "pointing": "Direction/Selection",
    "wave": "Hello/Goodbye",
    "stop_gesture": "Halt action"
}

# Logging settings
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# Create directories if they don't exist
MODELS_DIR.mkdir(parents=True, exist_ok=True)
LOGS_DIR.mkdir(parents=True, exist_ok=True)
