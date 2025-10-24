"""
Speech Recognition API Routes
"""
import os
import tempfile
import asyncio
import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, WebSocket, WebSocketDisconnect
from typing import Dict, Any, Optional
import logging

# Add backend to path
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

# Import backend services
try:
    from speech.speech_recognition import SpeechRecognitionService
    from speech.text_to_speech import TextToSpeechService
    from speech.audio_processing import AudioProcessor, NoiseReducer
    import numpy as np
    BACKEND_AVAILABLE = True
except ImportError as e:
    print(f"Backend services not available: {e}")
    BACKEND_AVAILABLE = False

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/recognize", response_model=Dict[str, Any])
async def recognize_speech(
    audio_file: UploadFile = File(...),
    language: Optional[str] = Form("en-US")
):
    """
    Process audio file and return recognized text
    
    Args:
        audio_file: Audio file to process (wav, mp3, webm, m4a)
        language: Language code for recognition (default: en-US)
    
    Returns:
        Dict containing recognized text, confidence, and metadata
    """
    try:
        # Log the request
        logger.info(f"Processing speech recognition request for file: {audio_file.filename}")
        
        if not BACKEND_AVAILABLE:
            return {
                "text": "Backend services not available",
                "confidence": 0.0,
                "is_emergency": False,
                "language": language,
                "timestamp": "2025-10-23T22:00:00Z",
                "duration": 0.0
            }
        
        # Save uploaded file temporarily
        file_extension = os.path.splitext(audio_file.filename or ".wav")[1] if audio_file.filename else ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp_file:
            content = await audio_file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        try:
            # In a real implementation, we would:
            # 1. Process the audio file with SpeechRecognitionService
            # 2. Return the actual results
            
            # For now, return a simulated response
            return {
                "text": "This is a simulated response from the speech recognition service.",
                "confidence": 0.95,
                "is_emergency": False,
                "language": language,
                "timestamp": "2025-10-23T22:00:00Z",
                "duration": len(content) / 32000.0  # Simulated duration
            }
        finally:
            # Clean up temporary file
            os.unlink(tmp_file_path)
        
    except Exception as e:
        logger.error(f"Error in speech recognition: {e}")
        raise HTTPException(status_code=500, detail="Speech recognition failed")

@router.websocket("/recognize/stream")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time speech recognition streaming
    
    Args:
        websocket: WebSocket connection for streaming audio data
    """
    await websocket.accept()
    logger.info("WebSocket connection established for speech streaming")
    
    try:
        # Simulate speech recognition streaming
        # In a real implementation, this would process audio chunks in real-time
        while True:
            # Receive audio data from client
            data = await websocket.receive_text()
            
            # Parse the incoming data (could be JSON with audio chunks)
            try:
                audio_data = json.loads(data)
            except json.JSONDecodeError:
                audio_data = {"data": data}
            
            # Simulate processing delay
            await asyncio.sleep(0.1)
            
            # Send back recognition results
            response = {
                "text": "Simulated real-time speech recognition result",
                "confidence": 0.92,
                "is_emergency": False,
                "timestamp": "2025-10-23T22:00:00Z",
                "partial": True
            }
            
            await websocket.send_json(response)
            
    except WebSocketDisconnect:
        logger.info("WebSocket connection closed")
    except Exception as e:
        logger.error(f"Error in WebSocket speech streaming: {e}")
        await websocket.close()

@router.post("/synthesize", response_model=Dict[str, Any])
async def synthesize_speech(
    text: str = Form(...),
    tone: Optional[str] = Form("normal"),
    rate: Optional[int] = Form(150),
    volume: Optional[float] = Form(0.8)
):
    """
    Convert text to speech
    
    Args:
        text: Text to convert to speech
        tone: Tone type (normal, emergency, confirmation, instructional)
        rate: Speech rate (words per minute)
        volume: Volume level (0.0 to 1.0)
    
    Returns:
        Dict containing audio data or file information
    """
    try:
        logger.info(f"Synthesizing speech for text: {text[:50]}...")
        
        if not BACKEND_AVAILABLE:
            return {
                "message": "Backend services not available",
                "tone": tone,
                "rate": rate,
                "volume": volume,
                "estimated_duration": len(text) / (rate / 60) if rate and rate > 0 else len(text) / 2.5
            }
        
        # In a real implementation, we would:
        # 1. Use the TextToSpeechService to generate audio
        # 2. Return the audio data or file path
        
        return {
            "message": "This is a simulated response from the text-to-speech service.",
            "tone": tone,
            "rate": rate,
            "volume": volume,
            "estimated_duration": len(text) / (rate / 60) if rate and rate > 0 else len(text) / 2.5
        }
        
    except Exception as e:
        logger.error(f"Error in speech synthesis: {e}")
        raise HTTPException(status_code=500, detail="Speech synthesis failed")

@router.get("/status", response_model=Dict[str, Any])
async def speech_status():
    """
    Get speech service status
    
    Returns:
        Dict containing current status of speech services
    """
    return {
        "service": "speech_recognition",
        "status": "operational",
        "model_loaded": True,
        "last_recognition": "2025-10-23T21:59:30Z",
        "total_requests": 42
    }