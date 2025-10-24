"""
Emergency Alert API Routes
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
import logging
import uuid
from datetime import datetime
import time

router = APIRouter()
logger = logging.getLogger(__name__)

# Pydantic models for request/response validation
class EmergencyTriggerRequest(BaseModel):
    trigger_type: str  # "voice", "gesture", "manual"
    trigger_data: Dict[str, Any]
    location: Optional[Dict[str, Any]] = None
    user_id: Optional[str] = None

class EmergencyConfirmRequest(BaseModel):
    alert_id: str
    user_id: Optional[str] = None

class EmergencyCancelRequest(BaseModel):
    alert_id: str
    cancellation_reason: Optional[str] = None
    user_id: Optional[str] = None

# In-memory storage for emergency alerts (in a real implementation, this would use the database)
emergency_alerts = {}
emergency_history = []

@router.post("/trigger", response_model=Dict[str, Any])
async def trigger_emergency(request: EmergencyTriggerRequest):
    """
    Trigger emergency alert
    
    Args:
        request: Emergency trigger request with type and data
    
    Returns:
        Dict containing alert ID and status
    """
    try:
        logger.warning(f"EMERGENCY TRIGGERED: {request.trigger_type}")
        
        # Generate alert ID
        alert_id = f"emergency_{uuid.uuid4().hex[:8]}"
        
        # Create emergency alert record
        alert_record = {
            "alert_id": alert_id,
            "trigger_type": request.trigger_type,
            "trigger_data": request.trigger_data,
            "location": request.location,
            "user_id": request.user_id,
            "status": "pending",
            "confirmation_required": True,
            "confirmation_timeout": 30,  # seconds
            "created_at": datetime.utcnow().isoformat() + "Z",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
        
        # Store in memory (in real implementation, this would go to database)
        emergency_alerts[alert_id] = alert_record
        
        # Add to history
        emergency_history.append(alert_record)
        
        # In a real implementation, we would:
        # 1. Start actual confirmation countdown
        # 2. Notify EmergencyAlertSystem
        # 3. Get current location from location service
        
        return {
            "alert_id": alert_id,
            "status": "pending",
            "confirmation_required": True,
            "confirmation_timeout": 30,  # seconds
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
    except Exception as e:
        logger.error(f"Error triggering emergency: {e}")
        raise HTTPException(status_code=500, detail="Failed to trigger emergency alert")

@router.post("/confirm", response_model=Dict[str, Any])
async def confirm_emergency(request: EmergencyConfirmRequest):
    """
    Confirm emergency alert
    
    Args:
        request: Emergency confirmation request with alert ID
    
    Returns:
        Dict containing confirmation status and message results
    """
    try:
        logger.warning(f"EMERGENCY CONFIRMED: {request.alert_id}")
        
        # Check if alert exists
        if request.alert_id not in emergency_alerts:
            raise HTTPException(status_code=404, detail="Emergency alert not found")
        
        # Update alert status
        alert_record = emergency_alerts[request.alert_id]
        alert_record["status"] = "confirmed"
        alert_record["updated_at"] = datetime.utcnow().isoformat() + "Z"
        
        # In a real implementation, we would:
        # 1. Cancel actual confirmation countdown
        # 2. Send SMS/WhatsApp to emergency contacts via MessageSender
        # 3. Get current location
        # 4. Update alert status in database
        
        return {
            "alert_id": request.alert_id,
            "status": "confirmed",
            "messages_sent": 3,  # Simulated count
            "failed_contacts": 0,  # Simulated count
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error confirming emergency: {e}")
        raise HTTPException(status_code=500, detail="Failed to confirm emergency alert")

@router.post("/cancel", response_model=Dict[str, Any])
async def cancel_emergency(request: EmergencyCancelRequest):
    """
    Cancel emergency alert
    
    Args:
        request: Emergency cancellation request with alert ID
    
    Returns:
        Dict containing cancellation status
    """
    try:
        logger.info(f"EMERGENCY CANCELLED: {request.alert_id}")
        
        # Check if alert exists
        if request.alert_id not in emergency_alerts:
            raise HTTPException(status_code=404, detail="Emergency alert not found")
        
        # Update alert status
        alert_record = emergency_alerts[request.alert_id]
        alert_record["status"] = "cancelled"
        alert_record["cancellation_reason"] = request.cancellation_reason or "User cancelled"
        alert_record["updated_at"] = datetime.utcnow().isoformat() + "Z"
        
        # In a real implementation, we would:
        # 1. Cancel actual confirmation countdown
        # 2. Update alert status in database
        # 3. Log cancellation event to storage system
        
        return {
            "alert_id": request.alert_id,
            "status": "cancelled",
            "cancellation_reason": request.cancellation_reason or "User cancelled",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling emergency: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel emergency alert")

@router.get("/status/{alert_id}", response_model=Dict[str, Any])
async def get_emergency_status(alert_id: str):
    """
    Get emergency alert status
    
    Args:
        alert_id: ID of the emergency alert
    
    Returns:
        Dict containing current status of the alert
    """
    try:
        # Check if alert exists
        if alert_id not in emergency_alerts:
            raise HTTPException(status_code=404, detail="Emergency alert not found")
        
        alert_record = emergency_alerts[alert_id]
        
        return {
            "alert_id": alert_id,
            "status": alert_record["status"],
            "trigger_type": alert_record["trigger_type"],
            "messages_sent": [],  # In real implementation, this would be populated
            "location": alert_record.get("location"),
            "timestamp": alert_record["updated_at"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting emergency status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get emergency status")

@router.get("/history", response_model=Dict[str, Any])
async def get_emergency_history(
    days: int = Query(30, description="Number of days to look back"),
    limit: int = Query(50, description="Maximum number of alerts to return"),
    start_date: Optional[str] = Query(None, description="Start date for filtering (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date for filtering (ISO format)")
):
    """
    Get emergency alert history
    
    Args:
        days: Number of days to look back (default: 30)
        limit: Maximum number of alerts to return (default: 50)
        start_date: Start date for filtering (ISO format)
        end_date: End date for filtering (ISO format)
    
    Returns:
        Dict containing emergency alert history
    """
    try:
        # Filter alerts by date range if provided
        filtered_alerts = []
        now = time.time()
        days_in_seconds = days * 24 * 60 * 60
        
        for alert in emergency_history:
            try:
                # Parse alert creation time
                alert_time = datetime.fromisoformat(alert["created_at"].replace("Z", "+00:00"))
                alert_timestamp = alert_time.timestamp()
                
                # Check if alert is within the specified date range
                if start_date:
                    start_time = datetime.fromisoformat(start_date.replace("Z", "+00:00")).timestamp()
                    if alert_timestamp < start_time:
                        continue
                
                if end_date:
                    end_time = datetime.fromisoformat(end_date.replace("Z", "+00:00")).timestamp()
                    if alert_timestamp > end_time:
                        continue
                
                # Check if alert is within the days limit
                if (now - alert_timestamp) <= days_in_seconds:
                    filtered_alerts.append(alert)
            except Exception:
                # Skip alerts with invalid timestamps
                continue
        
        # Apply limit
        filtered_alerts = filtered_alerts[-limit:] if len(filtered_alerts) > limit else filtered_alerts
        
        return {
            "alerts": filtered_alerts,
            "total_count": len(filtered_alerts),
            "days": days,
            "limit": limit,
            "start_date": start_date,
            "end_date": end_date
        }
    except Exception as e:
        logger.error(f"Error getting emergency history: {e}")
        raise HTTPException(status_code=500, detail="Failed to get emergency history")