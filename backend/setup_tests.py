"""
Setup Testing Environment for VOICE2EYE Backend
Installs all required dependencies for testing
"""
import subprocess
import sys
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def install_test_dependencies():
    """Install test dependencies"""
    logger.info("Installing test dependencies...")
    
    requirements_file = Path(__file__).parent / "tests" / "requirements-test.txt"
    
    if not requirements_file.exists():
        logger.error(f"Requirements file not found: {requirements_file}")
        return False
    
    try:
        cmd = [sys.executable, "-m", "pip", "install", "-r", str(requirements_file)]
        result = subprocess.run(cmd, check=True)
        logger.info("✅ Test dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Failed to install test dependencies: {e}")
        return False

def verify_installation():
    """Verify that all test dependencies are installed"""
    logger.info("Verifying installation...")
    
    required_packages = [
        "pytest",
        "pytest-cov",
        "pytest-asyncio",
        "pytest-mock",
        "pytest-timeout"
    ]
    
    missing = []
    
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
            logger.info(f"✅ {package} is installed")
        except ImportError:
            logger.warning(f"❌ {package} is missing")
            missing.append(package)
    
    if missing:
        logger.error(f"Missing packages: {', '.join(missing)}")
        return False
    
    logger.info("✅ All test dependencies are installed!")
    return True

def run_sample_test():
    """Run a sample test to verify everything works"""
    logger.info("Running sample test...")
    
    try:
        cmd = [sys.executable, "-m", "pytest", "--version"]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        logger.info(f"✅ Pytest version: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Failed to run pytest: {e}")
        return False

def main():
    """Main setup function"""
    logger.info("=" * 70)
    logger.info("VOICE2EYE Backend - Testing Environment Setup")
    logger.info("=" * 70)
    
    # Install dependencies
    if not install_test_dependencies():
        logger.error("Failed to install test dependencies")
        sys.exit(1)
    
    # Verify installation
    if not verify_installation():
        logger.error("Installation verification failed")
        sys.exit(1)
    
    # Run sample test
    if not run_sample_test():
        logger.error("Sample test failed")
        sys.exit(1)
    
    logger.info("\n" + "=" * 70)
    logger.info("✅ Testing environment setup complete!")
    logger.info("=" * 70)
    logger.info("\nNext steps:")
    logger.info("1. Run all tests: python run_tests.py")
    logger.info("2. Run quick tests: python run_tests.py quick")
    logger.info("3. Run unit tests: python run_tests.py unit")
    logger.info("4. View coverage: start htmlcov\\index.html")
    
    sys.exit(0)

if __name__ == "__main__":
    main()
