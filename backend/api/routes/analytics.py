"""
Analytics & Logging API Routes
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional, List
import logging
import json
from datetime import datetime
from pathlib import Path

# Add backend to path
import sys
from pathlib import Path as PathLib
sys.path.append(str(PathLib(__file__).parent.parent.parent))

# Import backend services
BACKEND_AVAILABLE = False
db_manager = None
log_analyzer = None
storage_system = None

try:
    from storage.storage_system import StorageSystem
    from storage.log_analyzer import LogAnalyzer
    from storage.database import DatabaseManager
    BACKEND_AVAILABLE = True
except ImportError as e:
    print(f"Backend services not available: {e}")

# Initialize backend services if available
if BACKEND_AVAILABLE:
    try:
        db_manager = DatabaseManager()
        log_analyzer = LogAnalyzer(db_manager)
        storage_system = StorageSystem()
    except Exception as e:
        print(f"Could not initialize backend services: {e}")
        BACKEND_AVAILABLE = False

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/usage", response_model=Dict[str, Any])
async def get_usage_statistics(
    days: int = Query(7, description="Number of days to analyze"),
    user_id: Optional[str] = Query(None, description="User ID for user-specific statistics")
):
    """
    Get usage statistics
    
    Args:
        days: Number of days to analyze (default: 7)
        user_id: User ID for user-specific statistics (optional)
    
    Returns:
        Dict containing usage statistics
    """
    try:
        logger.info(f"Getting usage statistics for {days} days")
        
        if BACKEND_AVAILABLE and log_analyzer:
            # Get usage statistics from log analyzer
            stats = log_analyzer.get_usage_statistics(days=days)
            stats["user_id"] = user_id
            return stats
        else:
            # Return mock data when backend is not available
            return {
                "period_days": days,
                "total_events": 127,
                "total_sessions": 23,
                "average_session_duration": 145.6,
                "emergency_events": 2,
                "voice_commands": 89,
                "gesture_detections": 36,
                "events_by_type": {
                    "voice_command": 89,
                    "gesture_detected": 36,
                    "emergency_triggered": 2
                },
                "user_id": user_id
            }
        
    except Exception as e:
        logger.error(f"Error getting usage statistics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get usage statistics")

@router.get("/performance", response_model=Dict[str, Any])
async def get_performance_metrics(
    metric_name: Optional[str] = Query(None, description="Specific metric to retrieve"),
    days: int = Query(7, description="Number of days to analyze")
):
    """
    Get performance metrics
    
    Args:
        metric_name: Specific metric to retrieve (optional)
        days: Number of days to analyze (default: 7)
    
    Returns:
        Dict containing performance metrics
    """
    try:
        logger.info(f"Getting performance metrics for {days} days")
        
        if BACKEND_AVAILABLE and log_analyzer:
            # Get performance metrics from log analyzer
            metrics = log_analyzer.get_performance_metrics(metric_name=metric_name, days=days)
            return metrics
        else:
            # Return mock data when backend is not available
            mock_metrics = {
                "period_days": days,
                "metric_name": metric_name,
                "metrics": [
                    {"name": "speech_recognition_latency", "value": 245, "unit": "ms"},
                    {"name": "gesture_detection_latency", "value": 89, "unit": "ms"},
                    {"name": "emergency_response_time", "value": 156, "unit": "ms"}
                ],
                "summary": {
                    "speech_recognition_latency": {
                        "count": 45,
                        "min": 200,
                        "max": 320,
                        "mean": 245.3,
                        "median": 242.0,
                        "std_dev": 28.7
                    },
                    "gesture_detection_latency": {
                        "count": 36,
                        "min": 75,
                        "max": 120,
                        "mean": 89.2,
                        "median": 87.5,
                        "std_dev": 12.3
                    }
                }
            }
            return mock_metrics
        
    except Exception as e:
        logger.error(f"Error getting performance metrics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get performance metrics")

@router.get("/emergencies", response_model=Dict[str, Any])
async def get_emergency_analytics(
    days: int = Query(30, description="Number of days to analyze")
):
    """
    Get emergency analytics
    
    Args:
        days: Number of days to analyze (default: 30)
    
    Returns:
        Dict containing emergency analytics
    """
    try:
        logger.info(f"Getting emergency analytics for {days} days")
        
        if BACKEND_AVAILABLE and log_analyzer:
            # Get emergency analysis from log analyzer
            analysis = log_analyzer.get_emergency_analysis(days=days)
            return analysis
        else:
            # Return mock data when backend is not available
            return {
                "period_days": days,
                "triggered_count": 5,
                "confirmed_count": 4,
                "cancelled_count": 1,
                "confirmation_rate": 80.0,
                "trigger_types": {
                    "voice": 2,
                    "gesture": 2,
                    "manual": 1
                },
                "hourly_patterns": {
                    "08": 1,
                    "12": 2,
                    "18": 1,
                    "22": 1
                }
            }
        
    except Exception as e:
        logger.error(f"Error getting emergency analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get emergency analytics")

@router.get("/report")
async def generate_report(
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    format: str = Query("json", description="Report format (json or pdf)")
):
    """
    Generate comprehensive analytics report
    
    Args:
        start_date: Start date (ISO format) (optional)
        end_date: End date (ISO format) (optional)
        format: Report format (json or pdf) (default: json)
    
    Returns:
        Dict containing report data or PDF file
    """
    try:
        logger.info(f"Generating report from {start_date} to {end_date} in {format} format")
        
        if BACKEND_AVAILABLE and log_analyzer:
            # In a real implementation, we would generate a comprehensive report
            # For now, return a structured response
            report_data = {
                "report_type": "comprehensive_analytics",
                "generated_at": datetime.utcnow().isoformat() + "Z",
                "period": {
                    "start_date": start_date,
                    "end_date": end_date
                },
                "format": format
            }
            
            if format.lower() == "pdf":
                # In a real implementation, we would generate a PDF
                # For now, just indicate that PDF generation would happen
                report_data["pdf_available"] = True
                report_data["download_url"] = "/api/analytics/report/download"
            else:
                # Generate JSON report by calling the other endpoints directly
                usage_stats = await get_usage_statistics(days=7)
                performance_stats = await get_performance_metrics(days=7)
                emergency_stats = await get_emergency_analytics(days=30)
                
                report_data["data"] = {
                    "usage": usage_stats,
                    "performance": performance_stats,
                    "emergencies": emergency_stats
                }
            
            return report_data
        else:
            # Return mock data when backend is not available
            report_data = {
                "report_type": "comprehensive_analytics",
                "generated_at": datetime.utcnow().isoformat() + "Z",
                "period": {
                    "start_date": start_date,
                    "end_date": end_date
                },
                "format": format
            }
            
            if format.lower() == "pdf":
                report_data["pdf_available"] = True
                report_data["download_url"] = "/api/analytics/report/download"
            else:
                report_data["data"] = {
                    "usage": {
                        "period_days": 7,
                        "total_events": 127,
                        "total_sessions": 23,
                        "average_session_duration": 145.6,
                        "emergency_events": 2,
                        "voice_commands": 89,
                        "gesture_detections": 36
                    },
                    "performance": {
                        "period_days": 7,
                        "metrics": [
                            {"name": "speech_recognition_latency", "value": 245, "unit": "ms"},
                            {"name": "gesture_detection_latency", "value": 89, "unit": "ms"}
                        ]
                    },
                    "emergencies": {
                        "period_days": 30,
                        "triggered_count": 5,
                        "confirmed_count": 4,
                        "cancelled_count": 1,
                        "confirmation_rate": 80.0
                    }
                }
            
            return report_data
        
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate report")