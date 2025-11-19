"""
Translation API Routes
Handles text translation and speech-to-text translation endpoints
"""
import os
import tempfile
import logging
from fastapi import APIRouter, HTTPException, Form, UploadFile, File
from typing import Dict, Any, Optional
from pydantic import BaseModel

# Add backend to path
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

# Import backend services
try:
    from translation.translation_service import TranslationService
    TRANSLATION_AVAILABLE = True
except ImportError as e:
    print(f"Translation service not available: {e}")
    TRANSLATION_AVAILABLE = False

try:
    from speech.speech_recognition import SpeechRecognitionService
    SPEECH_AVAILABLE = True
except ImportError as e:
    print(f"Speech recognition service not available: {e}")
    SPEECH_AVAILABLE = False

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize services
translation_service = None
speech_service = None

if TRANSLATION_AVAILABLE:
    try:
        translation_service = TranslationService()
        logger.info("Translation service initialized")
    except Exception as e:
        logger.error(f"Failed to initialize translation service: {e}")
        TRANSLATION_AVAILABLE = False

if SPEECH_AVAILABLE:
    try:
        speech_service = SpeechRecognitionService()
        # Note: Speech service needs model initialization, but we'll handle that per request
        logger.info("Speech recognition service available")
    except Exception as e:
        logger.warning(f"Speech recognition service not fully initialized: {e}")


# Pydantic models for request/response validation
class TranslationRequest(BaseModel):
    """Request model for text translation"""
    text: str
    source_language: str  # Language code (e.g., 'en', 'es')
    target_language: str  # Language code (e.g., 'fr', 'de')


@router.post("/translate", response_model=Dict[str, Any])
async def translate_text(request: TranslationRequest):
    """
    Translate text from source language to target language
    
    Args:
        request: Translation request with text and language codes
    
    Returns:
        Dict containing:
            - original_text: Original input text
            - translated_text: Translated text
            - source_language: Source language code
            - target_language: Target language code
            - confidence: Translation confidence
            - timestamp: Translation timestamp
            - translation_time_ms: Translation time in milliseconds
    """
    try:
        if not TRANSLATION_AVAILABLE or not translation_service:
            raise HTTPException(
                status_code=503,
                detail="Translation service is not available. Please check backend configuration."
            )
        
        logger.info(f"Translation request: '{request.text[:50]}...' from {request.source_language} to {request.target_language}")
        
        # Perform translation
        result = translation_service.translate_text(
            request.text,
            request.source_language,
            request.target_language
        )
        
        logger.info(f"Translation successful: {result['translated_text'][:50]}...")
        return result
        
    except ValueError as e:
        logger.error(f"Translation validation error: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid request: {str(e)}")
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


@router.post("/recognize-and-translate", response_model=Dict[str, Any])
async def recognize_and_translate(
    audio_file: UploadFile = File(...),
    source_language: str = Form(...),
    target_language: str = Form(...)
):
    """
    Recognize speech from audio file and translate to target language
    
    This endpoint:
    1. Processes the uploaded audio file with speech recognition
    2. Transcribes the speech to text
    3. Translates the transcribed text to the target language
    
    Args:
        audio_file: Audio file containing speech (wav, mp3, webm, m4a)
        source_language: Language code of the speech (e.g., 'en', 'es')
        target_language: Language code for translation (e.g., 'fr', 'de')
    
    Returns:
        Dict containing:
            - transcribed_text: Recognized speech text
            - translated_text: Translated text
            - source_language: Source language code
            - target_language: Target language code
            - confidence: Recognition and translation confidence
            - timestamp: Processing timestamp
    """
    try:
        if not TRANSLATION_AVAILABLE or not translation_service:
            raise HTTPException(
                status_code=503,
                detail="Translation service is not available"
            )
        
        logger.info(f"Recognize and translate request: {audio_file.filename}, {source_language} -> {target_language}")
        
        # Save uploaded file temporarily
        file_extension = os.path.splitext(audio_file.filename or ".wav")[1] if audio_file.filename else ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp_file:
            content = await audio_file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        try:
            transcribed_text = None
            recognition_confidence = 0.0
            
            # Step 1: Recognize speech
            if SPEECH_AVAILABLE and speech_service:
                try:
                    # Initialize speech service if needed
                    if not speech_service.model:
                        if not speech_service.initialize_model():
                            logger.warning("Speech recognition model not available, using placeholder")
                            transcribed_text = "[Speech recognition not available - placeholder text]"
                            recognition_confidence = 0.0
                    
                    # Process audio file with speech recognition service
                    speech_result = speech_service.process_audio_file(tmp_file_path)
                    
                    if speech_result:
                        transcribed_text = speech_result.get('text', '')
                        recognition_confidence = speech_result.get('confidence', 0.0)
                        logger.info(f"Speech recognition successful: '{transcribed_text[:50]}...' (confidence: {recognition_confidence:.2f})")
                    else:
                        logger.warning("Speech recognition returned no result")
                        transcribed_text = "[Speech recognition failed to produce result]"
                        recognition_confidence = 0.0
                    
                except Exception as speech_error:
                    logger.error(f"Speech recognition error: {speech_error}")
                    transcribed_text = "[Speech recognition failed]"
                    recognition_confidence = 0.0
            else:
                logger.warning("Speech recognition service not available")
                transcribed_text = "[Speech recognition service not available]"
                recognition_confidence = 0.0
            
            # Step 2: Translate the transcribed text
            if transcribed_text and not transcribed_text.startswith("["):
                translation_result = translation_service.translate_text(
                    transcribed_text,
                    source_language,
                    target_language
                )
                translated_text = translation_result['translated_text']
            else:
                # If transcription failed, return placeholder
                translated_text = "[Translation skipped - no valid transcription]"
            
            return {
                "transcribed_text": transcribed_text,
                "translated_text": translated_text,
                "source_language": source_language,
                "target_language": target_language,
                "confidence": recognition_confidence,
                "timestamp": translation_result.get('timestamp') if 'translation_result' in locals() else None
            }

        finally:
            # Clean up temporary file
            try:
                os.unlink(tmp_file_path)
            except Exception as cleanup_error:
                logger.warning(f"Failed to cleanup temp file: {cleanup_error}")
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid request: {str(e)}")
    except Exception as e:
        logger.error(f"Recognize and translate error: {e}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@router.get("/languages", response_model=Dict[str, Any])
async def get_supported_languages():
    """
    Get list of supported languages for translation
    
    Returns:
        Dict containing:
            - languages: Dictionary mapping language codes to language names
            - count: Number of supported languages
    """
    try:
        if not TRANSLATION_AVAILABLE or not translation_service:
            # Return fallback languages if service not available
            fallback_languages = {
                'en': 'English',
                'es': 'Spanish',
                'fr': 'French',
                'de': 'German',
            }
            return {
                "languages": fallback_languages,
                "count": len(fallback_languages),
                "note": "Translation service not available - showing limited languages"
            }
        
        languages = translation_service.get_supported_languages()
        
        return {
            "languages": languages,
            "count": len(languages)
        }
        
    except Exception as e:
        logger.error(f"Error getting supported languages: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get languages: {str(e)}")


@router.get("/detect", response_model=Dict[str, Any])
async def detect_language(text: str):
    """
    Detect the language of the given text
    
    Args:
        text: Text to detect language for
    
    Returns:
        Dict containing:
            - language: Detected language code
            - confidence: Detection confidence
    """
    try:
        if not TRANSLATION_AVAILABLE or not translation_service:
            raise HTTPException(
                status_code=503,
                detail="Translation service is not available"
            )
        
        if not text or not text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        logger.info(f"Language detection request for text: {text[:50]}...")
        
        result = translation_service.detect_language(text)
        
        return result
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid request: {str(e)}")
    except Exception as e:
        logger.error(f"Language detection error: {e}")
        raise HTTPException(status_code=500, detail=f"Language detection failed: {str(e)}")

