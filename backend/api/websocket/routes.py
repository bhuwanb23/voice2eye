"""
WebSocket Routes for VOICE2EYE
Centralized WebSocket endpoints for real-time communication
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import logging
import time
from typing import Dict, Any

from .server import websocket_handler, websocket_manager

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Main WebSocket endpoint for real-time communication
    Supports both speech and gesture streaming
    """
    await websocket_handler.handle_connection(websocket, "main")

@router.websocket("/ws/speech")
async def speech_websocket(websocket: WebSocket):
    """
    Dedicated WebSocket endpoint for speech streaming
    """
    await websocket_handler.handle_connection(websocket, "speech")

@router.websocket("/ws/gestures")
async def gestures_websocket(websocket: WebSocket):
    """
    Dedicated WebSocket endpoint for gesture streaming
    """
    await websocket_handler.handle_connection(websocket, "gestures")

@router.websocket("/ws/emergency")
async def emergency_websocket(websocket: WebSocket):
    """
    Dedicated WebSocket endpoint for emergency alerts
    """
    await websocket_handler.handle_connection(websocket, "emergency")

@router.get("/ws/status")
async def get_websocket_status():
    """
    Get WebSocket server status and connection information
    """
    connections = websocket_manager.get_all_connections()
    
    return {
        "status": "operational",
        "active_connections": len(connections),
        "connections": connections,
        "timestamp": time.time()
    }

@router.post("/ws/broadcast")
async def broadcast_message(message: Dict[str, Any]):
    """
    Broadcast a message to all connected WebSocket clients
    """
    try:
        await websocket_manager.broadcast_json(message)
        return {
            "status": "success",
            "message": "Message broadcasted to all clients",
            "recipients": len(websocket_manager.active_connections)
        }
    except Exception as e:
        logger.error(f"Error broadcasting message: {e}")
        return {
            "status": "error",
            "message": str(e)
        }