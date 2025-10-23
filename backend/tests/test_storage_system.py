"""
Test script for Storage System
Comprehensive testing of all storage components
"""
import sys
import logging
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent))

from storage.database import test_database_manager
from storage.models import test_data_models
from storage.event_logger import test_event_logger
from storage.settings_manager import test_settings_manager
from storage.log_analyzer import test_log_analyzer
from storage.storage_system import test_storage_system

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    """Run comprehensive storage system tests"""
    logger.info("🗂️ Testing VOICE2EYE Storage System")
    logger.info("=" * 60)
    
    tests = [
        ("Database Manager", test_database_manager),
        ("Data Models", test_data_models),
        ("Event Logger", test_event_logger),
        ("Settings Manager", test_settings_manager),
        ("Log Analyzer", test_log_analyzer),
        ("Complete Storage System", test_storage_system),
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
    logger.info("🗂️ STORAGE SYSTEM TEST SUMMARY")
    logger.info("=" * 60)
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        logger.info(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    overall_status = "✅ ALL TESTS PASSED" if all_passed else "❌ SOME TESTS FAILED"
    logger.info(f"\nOverall: {overall_status}")
    
    if all_passed:
        logger.info("\n🎉 Storage System is ready for production!")
        logger.info("📊 Database schema created with all required tables")
        logger.info("📝 Event logging system operational")
        logger.info("⚙️ Settings management system ready")
        logger.info("📈 Log analysis and reporting available")
        logger.info("💾 Data persistence and backup functionality working")
    else:
        logger.warning("\n⚠️ Some tests failed - check configuration and dependencies")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
