"""
VOICE2EYE Lite Installation Script
Downloads and sets up Vosk models automatically
"""
import os
import sys
import zipfile
import urllib.request
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def download_vosk_model():
    """Download Vosk English model"""
    model_url = "https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip"
    model_name = "vosk-model-small-en-us-0.15"
    
    models_dir = Path("models/vosk_models")
    models_dir.mkdir(parents=True, exist_ok=True)
    
    zip_path = models_dir / f"{model_name}.zip"
    extract_path = models_dir / model_name
    
    # Check if model already exists
    if extract_path.exists():
        logger.info(f"Vosk model already exists at: {extract_path}")
        return str(extract_path)
    
    try:
        logger.info(f"Downloading Vosk model from: {model_url}")
        logger.info("This may take a few minutes...")
        
        # Download the model
        urllib.request.urlretrieve(model_url, zip_path)
        logger.info("Download completed!")
        
        # Extract the model
        logger.info("Extracting model...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(models_dir)
        
        # Clean up zip file
        zip_path.unlink()
        
        logger.info(f"Vosk model installed at: {extract_path}")
        return str(extract_path)
        
    except Exception as e:
        logger.error(f"Failed to download Vosk model: {e}")
        logger.info("Please download manually from: https://alphacephei.com/vosk/models")
        logger.info("Extract to: models/vosk_models/")
        return None

def check_dependencies():
    """Check if required dependencies are installed"""
    dependencies = [
        ("vosk", "pip install vosk"),
        ("pyaudio", "pip install pyaudio"),
        ("pyttsx3", "pip install pyttsx3"),
        ("numpy", "pip install numpy"),
        ("scipy", "pip install scipy"),
        ("cv2", "pip install opencv-python"),
        ("mediapipe", "pip install mediapipe"),
    ]
    
    missing = []
    
    for dep, install_cmd in dependencies:
        try:
            __import__(dep)
            logger.info(f"✅ {dep} is installed")
        except ImportError:
            logger.warning(f"❌ {dep} is missing")
            missing.append(install_cmd)
    
    if missing:
        logger.error("Missing dependencies detected!")
        logger.info("Please install missing packages:")
        for cmd in missing:
            logger.info(f"  {cmd}")
        return False
    
    logger.info("All dependencies are installed!")
    return True

def main():
    """Main installation function"""
    logger.info("VOICE2EYE Lite Installation Script")
    logger.info("="*40)
    
    # Check dependencies
    logger.info("Checking dependencies...")
    if not check_dependencies():
        logger.error("Please install missing dependencies first")
        return False
    
    # Download Vosk model
    logger.info("Setting up Vosk model...")
    model_path = download_vosk_model()
    
    if model_path:
        logger.info("Installation completed successfully!")
        logger.info("You can now run: python main.py")
        return True
    else:
        logger.error("Installation failed")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
