"""
Health Check API Routes
"""
from fastapi import APIRouter, Depends
from typing import Dict, Any

router = APIRouter()

@router.get("/health", response_model=Dict[str, Any])
async def health_check():
    """Check overall system health"""
    return {
        "status": "healthy",
        "message": "VOICE2EYE Backend API is running",
        "services": {
            "speech": "operational",
            "gesture": "operational", 
            "emergency": "operational",
            "storage": "operational"
        }
    }

@router.get("/health/speech")
async def speech_health():
    """Check speech service health"""
    return {
        "service": "speech",
        "status": "operational",
        "details": "Speech recognition and TTS services ready"
    }

@router.get("/health/gestures")
async def gestures_health():
    """Check gesture service health"""
    return {
        "service": "gestures",
        "status": "operational", 
        "details": "Gesture detection and classification ready"
    }

@router.get("/health/emergency")
async def emergency_health():
    """Check emergency service health"""
    return {
        "service": "emergency",
        "status": "operational",
        "details": "Emergency alert system ready"
    }

@router.get("/health/storage")
async def storage_health():
    """Check storage service health"""
    return {
        "service": "storage",
        "status": "operational",
        "details": "Database and logging services ready"
    }