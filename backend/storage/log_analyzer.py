"""
Log analysis and reporting system for VOICE2EYE
Provides insights into system usage, performance, and user behavior
"""
import logging
import json
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
from collections import defaultdict, Counter
import statistics

from .database import DatabaseManager
from .models import EventType

logger = logging.getLogger(__name__)

class LogAnalyzer:
    """Log analysis and reporting service for VOICE2EYE"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
    
    def get_usage_statistics(self, days: int = 7) -> Dict[str, Any]:
        """Get usage statistics for the specified period"""
        try:
            cutoff_time = datetime.now(timezone.utc).timestamp() - (days * 24 * 60 * 60)
            
            with self.db_manager.get_cursor() as cursor:
                # Get total events
                cursor.execute("SELECT COUNT(*) FROM events WHERE timestamp >= ?", (cutoff_time,))
                total_events = cursor.fetchone()[0]
                
                # Get events by type
                cursor.execute("""
                    SELECT event_type, COUNT(*) as count 
                    FROM events 
                    WHERE timestamp >= ? 
                    GROUP BY event_type 
                    ORDER BY count DESC
                """, (cutoff_time,))
                events_by_type = dict(cursor.fetchall())
                
                # Get sessions
                cursor.execute("""
                    SELECT COUNT(*) FROM sessions 
                    WHERE start_time >= ?
                """, (cutoff_time,))
                total_sessions = cursor.fetchone()[0]
                
                # Get average session duration
                cursor.execute("""
                    SELECT AVG(duration) FROM sessions 
                    WHERE start_time >= ? AND duration IS NOT NULL
                """, (cutoff_time,))
                avg_session_duration = cursor.fetchone()[0] or 0
                
                # Get emergency events
                cursor.execute("""
                    SELECT COUNT(*) FROM events 
                    WHERE event_type IN ('emergency_triggered', 'emergency_confirmed', 'emergency_cancelled')
                    AND timestamp >= ?
                """, (cutoff_time,))
                emergency_events = cursor.fetchone()[0]
                
                # Get voice commands
                cursor.execute("""
                    SELECT COUNT(*) FROM events 
                    WHERE event_type = 'voice_command' AND timestamp >= ?
                """, (cutoff_time,))
                voice_commands = cursor.fetchone()[0]
                
                # Get gesture detections
                cursor.execute("""
                    SELECT COUNT(*) FROM events 
                    WHERE event_type = 'gesture_detected' AND timestamp >= ?
                """, (cutoff_time,))
                gesture_detections = cursor.fetchone()[0]
                
                return {
                    "period_days": days,
                    "total_events": total_events,
                    "total_sessions": total_sessions,
                    "average_session_duration": round(avg_session_duration, 2),
                    "emergency_events": emergency_events,
                    "voice_commands": voice_commands,
                    "gesture_detections": gesture_detections,
                    "events_by_type": events_by_type
                }
                
        except Exception as e:
            logger.error(f"Error getting usage statistics: {e}")
            return {"error": str(e)}
    
    def get_performance_metrics(self, metric_name: Optional[str] = None, 
                               days: int = 7) -> Dict[str, Any]:
        """Get performance metrics for the specified period"""
        try:
            cutoff_time = datetime.now(timezone.utc).timestamp() - (days * 24 * 60 * 60)
            
            with self.db_manager.get_cursor() as cursor:
                if metric_name:
                    cursor.execute("""
                        SELECT metric_value, metric_unit, timestamp 
                        FROM performance_metrics 
                        WHERE metric_name = ? AND timestamp >= ?
                        ORDER BY timestamp DESC
                    """, (metric_name, cutoff_time))
                else:
                    cursor.execute("""
                        SELECT metric_name, metric_value, metric_unit, timestamp 
                        FROM performance_metrics 
                        WHERE timestamp >= ?
                        ORDER BY timestamp DESC
                    """, (cutoff_time,))
                
                rows = cursor.fetchall()
                
                if not rows:
                    return {"metrics": [], "summary": {}}
                
                # Group by metric name
                metrics_by_name = defaultdict(list)
                for row in rows:
                    if metric_name:
                        metrics_by_name[metric_name].append(row["metric_value"])
                    else:
                        metrics_by_name[row["metric_name"]].append(row["metric_value"])
                
                # Calculate statistics for each metric
                summary = {}
                for name, values in metrics_by_name.items():
                    if values:
                        summary[name] = {
                            "count": len(values),
                            "min": min(values),
                            "max": max(values),
                            "mean": round(statistics.mean(values), 2),
                            "median": round(statistics.median(values), 2),
                            "std_dev": round(statistics.stdev(values) if len(values) > 1 else 0, 2)
                        }
                
                return {
                    "period_days": days,
                    "metric_name": metric_name,
                    "metrics": [dict(row) for row in rows],
                    "summary": summary
                }
                
        except Exception as e:
            logger.error(f"Error getting performance metrics: {e}")
            return {"error": str(e)}
    
    def get_emergency_analysis(self, days: int = 30) -> Dict[str, Any]:
        """Get emergency event analysis"""
        try:
            cutoff_time = datetime.now(timezone.utc).timestamp() - (days * 24 * 60 * 60)
            
            with self.db_manager.get_cursor() as cursor:
                # Get emergency events
                cursor.execute("""
                    SELECT event_type, event_data, timestamp, confidence 
                    FROM events 
                    WHERE event_type IN ('emergency_triggered', 'emergency_confirmed', 'emergency_cancelled')
                    AND timestamp >= ?
                    ORDER BY timestamp DESC
                """, (cutoff_time,))
                emergency_rows = cursor.fetchall()
                
                # Analyze emergency events
                triggered_count = 0
                confirmed_count = 0
                cancelled_count = 0
                trigger_types = Counter()
                confirmation_rate = 0
                
                for row in emergency_rows:
                    if row["event_type"] == "emergency_triggered":
                        triggered_count += 1
                        event_data = json.loads(row["event_data"])
                        trigger_type = event_data.get("trigger_type", "unknown")
                        trigger_types[trigger_type] += 1
                    elif row["event_type"] == "emergency_confirmed":
                        confirmed_count += 1
                    elif row["event_type"] == "emergency_cancelled":
                        cancelled_count += 1
                
                if triggered_count > 0:
                    confirmation_rate = round((confirmed_count / triggered_count) * 100, 2)
                
                # Get emergency events by hour
                cursor.execute("""
                    SELECT strftime('%H', datetime(timestamp, 'unixepoch')) as hour, COUNT(*) as count
                    FROM events 
                    WHERE event_type = 'emergency_triggered' AND timestamp >= ?
                    GROUP BY hour
                    ORDER BY hour
                """, (cutoff_time,))
                hourly_emergencies = dict(cursor.fetchall())
                
                return {
                    "period_days": days,
                    "total_triggered": triggered_count,
                    "total_confirmed": confirmed_count,
                    "total_cancelled": cancelled_count,
                    "confirmation_rate": confirmation_rate,
                    "trigger_types": dict(trigger_types),
                    "hourly_distribution": hourly_emergencies
                }
                
        except Exception as e:
            logger.error(f"Error getting emergency analysis: {e}")
            return {"error": str(e)}
    
    def get_user_behavior_analysis(self, user_id: Optional[str] = None, 
                                  days: int = 7) -> Dict[str, Any]:
        """Get user behavior analysis"""
        try:
            cutoff_time = datetime.now(timezone.utc).timestamp() - (days * 24 * 60 * 60)
            
            with self.db_manager.get_cursor() as cursor:
                # Get user sessions
                if user_id:
                    cursor.execute("""
                        SELECT * FROM sessions 
                        WHERE user_id = ? AND start_time >= ?
                        ORDER BY start_time DESC
                    """, (user_id, cutoff_time))
                else:
                    cursor.execute("""
                        SELECT * FROM sessions 
                        WHERE start_time >= ?
                        ORDER BY start_time DESC
                    """, (cutoff_time,))
                
                sessions = cursor.fetchall()
                
                if not sessions:
                    return {"sessions": [], "analysis": {}}
                
                # Analyze sessions
                session_durations = [s["duration"] for s in sessions if s["duration"] is not None]
                event_counts = [s["event_count"] for s in sessions]
                
                # Get most common voice commands
                cursor.execute("""
                    SELECT event_data, COUNT(*) as count
                    FROM events 
                    WHERE event_type = 'voice_command' AND timestamp >= ?
                    GROUP BY event_data
                    ORDER BY count DESC
                    LIMIT 10
                """, (cutoff_time,))
                common_commands = cursor.fetchall()
                
                # Parse command data
                command_usage = {}
                for row in common_commands:
                    try:
                        event_data = json.loads(row["event_data"])
                        command = event_data.get("command", "unknown")
                        command_usage[command] = row["count"]
                    except:
                        continue
                
                # Get most common gestures
                cursor.execute("""
                    SELECT event_data, COUNT(*) as count
                    FROM events 
                    WHERE event_type = 'gesture_detected' AND timestamp >= ?
                    GROUP BY event_data
                    ORDER BY count DESC
                    LIMIT 10
                """, (cutoff_time,))
                common_gestures = cursor.fetchall()
                
                # Parse gesture data
                gesture_usage = {}
                for row in common_gestures:
                    try:
                        event_data = json.loads(row["event_data"])
                        gesture_type = event_data.get("gesture_type", "unknown")
                        gesture_usage[gesture_type] = row["count"]
                    except:
                        continue
                
                analysis = {
                    "total_sessions": len(sessions),
                    "average_session_duration": round(statistics.mean(session_durations), 2) if session_durations else 0,
                    "average_events_per_session": round(statistics.mean(event_counts), 2) if event_counts else 0,
                    "most_common_commands": command_usage,
                    "most_common_gestures": gesture_usage
                }
                
                return {
                    "user_id": user_id,
                    "period_days": days,
                    "sessions": [dict(s) for s in sessions],
                    "analysis": analysis
                }
                
        except Exception as e:
            logger.error(f"Error getting user behavior analysis: {e}")
            return {"error": str(e)}
    
    def generate_report(self, days: int = 7, output_file: Optional[str] = None) -> Dict[str, Any]:
        """Generate a comprehensive system report"""
        try:
            logger.info(f"Generating system report for {days} days...")
            
            # Get all analysis data
            usage_stats = self.get_usage_statistics(days)
            performance_metrics = self.get_performance_metrics(days=days)
            emergency_analysis = self.get_emergency_analysis(days)
            user_behavior = self.get_user_behavior_analysis(days=days)
            
            # Generate report
            report = {
                "report_generated": datetime.now(timezone.utc).isoformat(),
                "period_days": days,
                "usage_statistics": usage_stats,
                "performance_metrics": performance_metrics,
                "emergency_analysis": emergency_analysis,
                "user_behavior": user_behavior,
                "summary": {
                    "total_events": usage_stats.get("total_events", 0),
                    "total_sessions": usage_stats.get("total_sessions", 0),
                    "emergency_events": usage_stats.get("emergency_events", 0),
                    "confirmation_rate": emergency_analysis.get("confirmation_rate", 0)
                }
            }
            
            # Save to file if specified
            if output_file:
                with open(output_file, 'w') as f:
                    json.dump(report, f, indent=2)
                logger.info(f"Report saved to {output_file}")
            
            return report
            
        except Exception as e:
            logger.error(f"Error generating report: {e}")
            return {"error": str(e)}
    
    def cleanup_old_logs(self, days: int = 30) -> int:
        """Clean up old log data"""
        try:
            return self.db_manager.cleanup_old_data(days)
        except Exception as e:
            logger.error(f"Error cleaning up old logs: {e}")
            return 0

def test_log_analyzer() -> bool:
    """Test log analyzer functionality"""
    try:
        logger.info("Testing log analyzer...")
        
        # Create database manager
        db_manager = DatabaseManager("storage/test_log_analyzer.db")
        if not db_manager.connect():
            logger.error("Failed to connect to database")
            return False
        
        if not db_manager.create_tables():
            logger.error("Failed to create tables")
            return False
        
        # Create log analyzer
        analyzer = LogAnalyzer(db_manager)
        
        # Test usage statistics
        usage_stats = analyzer.get_usage_statistics(7)
        logger.info(f"Usage statistics: {usage_stats}")
        
        # Test performance metrics
        performance_metrics = analyzer.get_performance_metrics(days=7)
        logger.info(f"Performance metrics: {performance_metrics}")
        
        # Test emergency analysis
        emergency_analysis = analyzer.get_emergency_analysis(30)
        logger.info(f"Emergency analysis: {emergency_analysis}")
        
        # Test user behavior analysis
        user_behavior = analyzer.get_user_behavior_analysis(days=7)
        logger.info(f"User behavior: {user_behavior}")
        
        # Test report generation
        report = analyzer.generate_report(7, "storage/test_report.json")
        logger.info(f"Report generated: {len(report)} keys")
        
        # Disconnect
        db_manager.disconnect()
        
        # Clean up test database
        test_db = Path("storage/test_log_analyzer.db")
        if test_db.exists():
            test_db.unlink()
        
        # Clean up test report
        test_report = Path("storage/test_report.json")
        if test_report.exists():
            test_report.unlink()
        
        logger.info("Log analyzer test completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Log analyzer test failed: {e}")
        return False

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    # Test log analyzer
    test_log_analyzer()
