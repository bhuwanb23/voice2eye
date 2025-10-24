"""
Logging Middleware for API Requests
"""
import time
from fastapi import Request
import logging

# Configure logger
logger = logging.getLogger("api")
logger.setLevel(logging.INFO)

# Create console handler if it doesn't exist
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)

async def log_requests(request: Request, call_next):
    """Middleware to log incoming requests"""
    start_time = time.time()
    
    # Log request
    logger.info(f"Incoming request: {request.method} {request.url}")
    logger.info(f"Headers: {dict(request.headers)}")
    
    # Process request
    response = await call_next(request)
    
    # Calculate process time
    process_time = time.time() - start_time
    
    # Log response
    logger.info(f"Response status: {response.status_code} | Time: {process_time:.4f}s")
    
    return response