"""
Main FastAPI Server for VOICE2EYE Backend
REST API for mobile app integration
"""
import os
import sys
import json
import base64
import cv2
from pathlib import Path
import numpy as np
import tensorflow as tf
from pydantic import BaseModel
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

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
_hand_detector = None

try:
    _gesture_model_path = os.path.join(_MODEL_DIR, "custom_gestures.tflite")
    _gesture_labels_path = os.path.join(_MODEL_DIR, "labels.json")
    _hand_landmarker_path = os.path.join(_MODEL_DIR, "hand_landmarker.task")

    print(f"Loading model from: {_gesture_model_path}")
    print(f"Model exists: {os.path.exists(_gesture_model_path)}")
    print(f"Labels exists: {os.path.exists(_gesture_labels_path)}")
    print(f"Landmarker exists: {os.path.exists(_hand_landmarker_path)}")

    if os.path.exists(_gesture_model_path):
        # Load TFLite model
        interpreter = tf.lite.Interpreter(model_path=_gesture_model_path)
        interpreter.allocate_tensors()
        _gesture_model = interpreter
        print("TFLite model loaded successfully")

    if os.path.exists(_gesture_labels_path):
        with open(_gesture_labels_path) as f:
            _gesture_labels = json.load(f)
        print(f"Labels loaded: {_gesture_labels}")

    if os.path.exists(_hand_landmarker_path):
        _mp_base_options = python.BaseOptions(model_asset_path=_hand_landmarker_path)
        _mp_options = vision.HandLandmarkerOptions(
            base_options=_mp_base_options,
            num_hands=1
        )
        _hand_detector = vision.HandLandmarker.create_from_options(_mp_options)
        print("MediaPipe hand detector loaded successfully")

except Exception as e:
    print(f"Error loading gesture model or MediaPipe: {e}")

class FramePayload(BaseModel):
    frame: str  # base64 encoded image

@app.post("/api/gestures/detect")
def detect_gesture(payload: FramePayload):
    if not _gesture_model or not _gesture_labels or not _hand_detector:
        return {
            "error": "Gesture model or MediaPipe not loaded on backend",
            "label": "unknown",
            "confidence": 0.0
        }
        
    try:
        # Decode base64 image
        img_bytes = base64.b64decode(payload.frame)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"label": "unknown", "confidence": 0.0, "error": "Could not decode image"}

        # Run MediaPipe
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        result = _hand_detector.detect(mp_image)

        if not result.hand_landmarks:
            return {"label": "unknown", "confidence": 0.0}

        # Extract landmarks
        hand = result.hand_landmarks[0]
        landmarks = [v for p in hand for v in (p.x, p.y, p.z)]

        if len(landmarks) != 63:
            return {"label": "unknown", "confidence": 0.0, "error": f"Expected 63 landmarks, got {len(landmarks)}"}

        # Classify
        # Classify using TFLite interpreter
        x = np.array(landmarks, dtype=np.float32).reshape(1, -1)
        input_details = _gesture_model.get_input_details()
        output_details = _gesture_model.get_output_details()
        _gesture_model.set_tensor(input_details[0]['index'], x)
        _gesture_model.invoke()
        scores = _gesture_model.get_tensor(output_details[0]['index'])[0]
        idx = int(np.argmax(scores))

        return {
            "label": _gesture_labels[idx],
            "confidence": float(scores[idx]),
            "source": "backend"
        }
    except Exception as e:
        return {"label": "unknown", "confidence": 0.0, "error": str(e)}



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