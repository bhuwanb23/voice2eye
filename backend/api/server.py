"""
Main FastAPI Server for VOICE2EYE Backend
REST API for mobile app integration
"""
import os
import sys
import json
from pathlib import Path
import numpy as np
import tensorflow as tf
from pydantic import BaseModel

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent))

# Conditional imports to handle missing dependencies gracefully
try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    import uvicorn
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False
    print("FastAPI not available. Install with: pip install fastapi uvicorn python-multipart")
    # Create mock classes for development
    class FastAPI:
        def __init__(self, *args, **kwargs):
            pass

        def add_middleware(self, *args, **kwargs):
            pass

        def include_router(self, *args, **kwargs):
            pass

    class CORSMiddleware:
        pass

    class JSONResponse:
        def __init__(self, *args, **kwargs):
            pass

# Create FastAPI app
app = FastAPI(
    title="VOICE2EYE Backend API",
    description="REST API for VOICE2EYE mobile app integration",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Load gesture model and labels
_MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
_gesture_model = None
_gesture_labels = []

try:
    _gesture_model_path = os.path.join(_MODEL_DIR, "saved_gesture_model")
    _gesture_labels_path = os.path.join(_MODEL_DIR, "labels.json")
    
    if os.path.exists(_gesture_model_path):
        _gesture_model = tf.keras.models.load_model(_gesture_model_path)
    
    if os.path.exists(_gesture_labels_path):
        with open(_gesture_labels_path) as f:
            _gesture_labels = json.load(f)
except Exception as e:
    print(f"Error loading gesture model: {e}")

class LandmarkPayload(BaseModel):
    landmarks: list

@app.post("/api/gestures/detect")
def detect_gesture(payload: LandmarkPayload):
    if not _gesture_model or not _gesture_labels:
        return {
            "error": "Gesture model not loaded on backend",
            "label": "unknown",
            "confidence": 0.0
        }
        
    if len(payload.landmarks) != 63:
        return {
            "error": f"Expected exactly 63 landmark values (21 points x 3), got {len(payload.landmarks)}",
            "label": "unknown",
            "confidence": 0.0
        }

    try:
        x = np.array(payload.landmarks, dtype=np.float32).reshape(1, -1)
        scores = _gesture_model.predict(x, verbose=0)[0]
        best_index = int(np.argmax(scores))

        return {
            "label": _gesture_labels[best_index],
            "confidence": float(scores[best_index]),
            "source": "backend"
        }
    except Exception as e:
        return {
            "error": f"Inference error: {str(e)}",
            "label": "unknown",
            "confidence": 0.0
        }


# Setup CORS
if FASTAPI_AVAILABLE:
    # Add CORS middleware - Allow all origins for development
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:8081",
            "http://localhost:8082",
            "http://192.168.31.67:8081",
            "http://192.168.31.67:8082",
            "exp://192.168.31.67:8081",
            "exp://192.168.31.67:8082",
            "*"  # Allow all for mobile app
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include routers
if FASTAPI_AVAILABLE:
    try:
        from api.routes import health, speech, gestures, emergency, settings, analytics, translation
        from api.websocket import routes as websocket_routes
        app.include_router(health.router, prefix="/api", tags=["health"])
        app.include_router(speech.router, prefix="/api/speech", tags=["speech"])
        app.include_router(gestures.router, prefix="/api/gestures", tags=["gestures"])
        app.include_router(emergency.router, prefix="/api/emergency", tags=["emergency"])
        app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
        app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
        app.include_router(translation.router, prefix="/api/translation", tags=["translation"])
        app.include_router(websocket_routes.router, prefix="/api", tags=["websocket"])
    except ImportError as e:
        print(f"Could not import routes: {e}")
        # Try without analytics if it's not available
        try:
            from api.routes import health, speech, gestures, emergency, settings, translation
            from api.websocket import routes as websocket_routes
            app.include_router(health.router, prefix="/api", tags=["health"])
            app.include_router(speech.router, prefix="/api/speech", tags=["speech"])
            app.include_router(gestures.router, prefix="/api/gestures", tags=["gestures"])
            app.include_router(emergency.router, prefix="/api/emergency", tags=["emergency"])
            app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
            app.include_router(translation.router, prefix="/api/translation", tags=["translation"])
            app.include_router(websocket_routes.router, prefix="/api", tags=["websocket"])
        except ImportError as e2:
            print(f"Could not import basic routes: {e2}")
            try:
                from api.routes import health, speech, gestures, emergency, settings, translation
                app.include_router(health.router, prefix="/api", tags=["health"])
                app.include_router(speech.router, prefix="/api/speech", tags=["speech"])
                app.include_router(gestures.router, prefix="/api/gestures", tags=["gestures"])
                app.include_router(emergency.router, prefix="/api/emergency", tags=["emergency"])
                app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
                app.include_router(translation.router, prefix="/api/translation", tags=["translation"])
            except ImportError as e3:
                print(f"Could not import basic routes: {e3}")

@app.get("/api")
async def root():
    """API root endpoint"""
    return {
        "message": "VOICE2EYE Backend API",
        "version": "1.0.0",
        "status": "operational"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    print(f"Global exception handler caught: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    # Get port from environment or default to 8000
    port = int(os.getenv("API_PORT", 8000))
    # Listen on all network interfaces (0.0.0.0) to allow mobile connections
    host = os.getenv("API_HOST", "0.0.0.0")
    
    # Production settings
    reload = os.getenv("API_RELOAD", "True").lower() == "true"
    workers = int(os.getenv("API_WORKERS", "1"))
    
    print(f"Starting VOICE2EYE API server on {host}:{port}")
    print(f"Reload: {reload}, Workers: {workers}")
    print(f"Access the API at: http://192.168.31.67:{port}")
    print(f"Health check: http://192.168.31.67:{port}/api/health")

    if FASTAPI_AVAILABLE:
        uvicorn.run(
            "api.server:app",
            host=host,
            port=port,
            reload=reload,
            workers=workers,
            log_level="info"
        )
    else:
        print("FastAPI not available. Please install required dependencies.")