"""
Debug script to check server route registration
"""
import sys
import os
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent))

# Import server components
try:
    from fastapi import FastAPI
    from api.routes import health, speech, gestures, emergency, settings
    print("✓ All routes imported successfully")
    
    # Create app and register routes with correct prefixes
    app = FastAPI()
    
    print("Registering routes with correct prefixes...")
    app.include_router(health.router, prefix="/api", tags=["health"])
    app.include_router(speech.router, prefix="/api/speech", tags=["speech"])
    app.include_router(gestures.router, prefix="/api/gestures", tags=["gestures"])
    app.include_router(emergency.router, prefix="/api/emergency", tags=["emergency"])
    app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
    
    print("✓ All routes registered successfully")
    print(f"Speech router routes: {list(speech.router.routes)}")
    
    # Print all registered routes
    print("\nRegistered routes:")
    for route in app.routes:
        print(f"  {type(route).__name__}: {route}")
        
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()