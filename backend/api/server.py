"""
Main FastAPI Server for VOICE2EYE Backend
REST API for mobile app integration
"""
import os
import sys
from pathlib import Path

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

# Setup CORS
if FASTAPI_AVAILABLE:
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include routers
if FASTAPI_AVAILABLE:
    try:
        from api.routes import health
        app.include_router(health.router, prefix="/api", tags=["health"])
    except ImportError as e:
        print(f"Could not import routes: {e}")

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
    host = os.getenv("API_HOST", "127.0.0.1")
    
    print(f"Starting VOICE2EYE API server on {host}:{port}")
    
    if FASTAPI_AVAILABLE:
        uvicorn.run(
            "api.server:app",
            host=host,
            port=port,
            reload=True,
            log_level="info"
        )
    else:
        print("FastAPI not available. Please install required dependencies.")