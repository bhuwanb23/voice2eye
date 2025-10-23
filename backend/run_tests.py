"""
Test Runner for VOICE2EYE Backend
Runs all tests with comprehensive reporting
"""
import sys
import subprocess
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_all_tests():
    """Run all tests with coverage"""
    logger.info("=" * 70)
    logger.info("VOICE2EYE Backend - Comprehensive Test Suite")
    logger.info("=" * 70)
    
    cmd = [
        "pytest",
        "-v",
        "--tb=short",
        "--cov=speech",
        "--cov=gestures",
        "--cov=emergency",
        "--cov=storage",
        "--cov-report=term-missing",
        "--cov-report=html:htmlcov",
        "tests/"
    ]
    
    try:
        result = subprocess.run(cmd, cwd=Path(__file__).parent)
        return result.returncode == 0
    except FileNotFoundError:
        logger.error("pytest not found. Install with: pip install pytest pytest-cov")
        return False

def run_unit_tests():
    """Run only unit tests"""
    logger.info("Running unit tests only...")
    
    cmd = [
        "pytest",
        "-v",
        "-m", "unit",
        "--tb=short",
        "tests/"
    ]
    
    try:
        result = subprocess.run(cmd, cwd=Path(__file__).parent)
        return result.returncode == 0
    except FileNotFoundError:
        logger.error("pytest not found. Install with: pip install pytest")
        return False

def run_integration_tests():
    """Run only integration tests"""
    logger.info("Running integration tests only...")
    
    cmd = [
        "pytest",
        "-v",
        "-m", "integration",
        "--tb=short",
        "tests/"
    ]
    
    try:
        result = subprocess.run(cmd, cwd=Path(__file__).parent)
        return result.returncode == 0
    except FileNotFoundError:
        logger.error("pytest not found. Install with: pip install pytest")
        return False

def run_quick_tests():
    """Run quick tests (excluding slow and hardware tests)"""
    logger.info("Running quick tests (excluding slow and hardware tests)...")
    
    cmd = [
        "pytest",
        "-v",
        "-m", "not slow and not requires_hardware and not requires_internet",
        "--tb=short",
        "tests/"
    ]
    
    try:
        result = subprocess.run(cmd, cwd=Path(__file__).parent)
        return result.returncode == 0
    except FileNotFoundError:
        logger.error("pytest not found. Install with: pip install pytest")
        return False

def main():
    """Main test runner"""
    if len(sys.argv) > 1:
        test_type = sys.argv[1]
        
        if test_type == "unit":
            success = run_unit_tests()
        elif test_type == "integration":
            success = run_integration_tests()
        elif test_type == "quick":
            success = run_quick_tests()
        elif test_type == "all":
            success = run_all_tests()
        else:
            logger.error(f"Unknown test type: {test_type}")
            logger.info("Usage: python run_tests.py [all|unit|integration|quick]")
            sys.exit(1)
    else:
        # Run all tests by default
        success = run_all_tests()
    
    if success:
        logger.info("\n" + "=" * 70)
        logger.info("✅ ALL TESTS PASSED!")
        logger.info("=" * 70)
        logger.info("\nCoverage report generated in: htmlcov/index.html")
        sys.exit(0)
    else:
        logger.error("\n" + "=" * 70)
        logger.error("❌ SOME TESTS FAILED")
        logger.error("=" * 70)
        sys.exit(1)

if __name__ == "__main__":
    main()
