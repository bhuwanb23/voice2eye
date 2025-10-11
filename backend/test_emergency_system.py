"""
Test script for Emergency Alert System
Comprehensive testing of all emergency components
"""
import sys
import logging
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent))

from emergency.location_services import test_location_services
from emergency.emergency_triggers import test_emergency_triggers
from emergency.message_sender import test_message_sender
from emergency.emergency_alert_system import test_emergency_alert_system

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    """Run comprehensive emergency alert system tests"""
    logger.info("🚨 Testing VOICE2EYE Emergency Alert System")
    logger.info("=" * 60)
    
    tests = [
        ("Location Services", test_location_services),
        ("Emergency Triggers", test_emergency_triggers),
        ("Message Sender", test_message_sender),
        ("Complete Emergency System", test_emergency_alert_system),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        logger.info(f"\n🧪 Running {test_name} test...")
        try:
            result = test_func()
            results[test_name] = result
            status = "✅ PASSED" if result else "❌ FAILED"
            logger.info(f"{test_name}: {status}")
        except Exception as e:
            logger.error(f"{test_name} test failed with error: {e}")
            results[test_name] = False
    
    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("🚨 EMERGENCY ALERT SYSTEM TEST SUMMARY")
    logger.info("=" * 60)
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        logger.info(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    overall_status = "✅ ALL TESTS PASSED" if all_passed else "❌ SOME TESTS FAILED"
    logger.info(f"\nOverall: {overall_status}")
    
    if all_passed:
        logger.info("\n🎉 Emergency Alert System is ready for production!")
        logger.info("📱 Configure Twilio credentials for SMS functionality")
        logger.info("📞 Add emergency contacts in emergency/contacts.json")
        logger.info("🔧 Set up location services for accurate positioning")
    else:
        logger.warning("\n⚠️ Some tests failed - check configuration and dependencies")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
