"""
Pytest Configuration and Fixtures
Shared test fixtures for all test modules
"""
import pytest
import sys
import logging
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Configure logging for tests
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

@pytest.fixture(scope="session")
def backend_path():
    """Get backend directory path"""
    return Path(__file__).parent.parent

@pytest.fixture(scope="session")
def test_data_path():
    """Get test data directory path"""
    test_data = Path(__file__).parent / "test_data"
    test_data.mkdir(exist_ok=True)
    return test_data

@pytest.fixture(scope="function")
def temp_db_path(tmp_path):
    """Create temporary database path for testing"""
    return tmp_path / "test_voice2eye.db"

@pytest.fixture(scope="function")
def sample_audio_data():
    """Generate sample audio data for testing"""
    import numpy as np
    # Generate 1 second of sample audio at 16kHz
    sample_rate = 16000
    duration = 1.0
    frequency = 440  # A4 note
    t = np.linspace(0, duration, int(sample_rate * duration))
    audio = np.sin(2 * np.pi * frequency * t) * 32767
    return audio.astype(np.int16)

@pytest.fixture(scope="function")
def sample_image():
    """Generate sample image for gesture testing"""
    import numpy as np
    # Create a blank 640x480 RGB image
    image = np.zeros((480, 640, 3), dtype=np.uint8)
    return image

@pytest.fixture(scope="function")
def mock_emergency_contact():
    """Create mock emergency contact data"""
    return {
        "name": "Test Contact",
        "phone": "+1234567890",
        "relationship": "Family",
        "priority": 1,
        "enabled": True
    }

@pytest.fixture(scope="function")
def mock_location_data():
    """Create mock location data"""
    return {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "address": "New York, NY, USA",
        "city": "New York",
        "country": "USA",
        "accuracy": 10.0
    }

# Add pytest markers
def pytest_configure(config):
    """Configure pytest markers"""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "unit: marks tests as unit tests"
    )
    config.addinivalue_line(
        "markers", "requires_hardware: marks tests that require hardware (camera, microphone)"
    )
    config.addinivalue_line(
        "markers", "requires_internet: marks tests that require internet connection"
    )
