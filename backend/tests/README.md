# 🧪 VOICE2EYE Backend - Test Suite

## 📋 Overview

Comprehensive test suite for VOICE2EYE backend core components using pytest.

### Test Coverage:
- ✅ **Speech Processing** - Speech recognition, TTS, audio processing
- ✅ **Gesture Recognition** - Hand detection, gesture classification
- ✅ **Emergency System** - Location services, triggers, messaging
- ✅ **Storage System** - Database, logging, analytics

---

## 🚀 Quick Start

### 1. Install Test Dependencies

```bash
# Navigate to backend directory
cd d:\projects\apps\voice2eye\backend

# Install testing requirements
pip install -r tests/requirements-test.txt

# Or install individual packages
pip install pytest pytest-cov pytest-asyncio pytest-mock pytest-timeout
```

### 2. Run All Tests

```bash
# Run all tests with coverage
python run_tests.py

# Or use pytest directly
pytest -v --cov
```

### 3. View Coverage Report

```bash
# Open HTML coverage report (generated after running tests)
start htmlcov\index.html  # Windows
# or
open htmlcov/index.html   # Mac/Linux
```

---

## 📊 Test Types

### Unit Tests (Fast)
Tests individual components in isolation without external dependencies.

```bash
python run_tests.py unit
# or
pytest -v -m unit
```

### Integration Tests
Tests component interactions and workflows.

```bash
python run_tests.py integration
# or
pytest -v -m integration
```

### Quick Tests
Runs fast tests only (excludes slow and hardware tests).

```bash
python run_tests.py quick
# or
pytest -v -m "not slow and not requires_hardware"
```

### All Tests
Runs complete test suite including slow and hardware tests.

```bash
python run_tests.py all
# or
pytest -v
```

---

## 📁 Test Files

### Core Component Tests

#### [`test_speech_processing.py`](test_speech_processing.py)
- **AudioProcessor**: Microphone initialization, audio capture
- **NoiseReducer**: High-pass filter, noise gate, normalization
- **SpeechRecognitionService**: Vosk integration, emergency detection
- **TextToSpeechService**: pyttsx3 TTS, voice settings, tones
- **Performance**: Latency benchmarks

#### [`test_gesture_recognition.py`](test_gesture_recognition.py)
- **OpenCVHandDetector**: Hand detection, skin segmentation
- **OpenCVGestureClassifier**: Finger counting, gesture types
- **OpenCVGestureDetectionService**: Detection loop, callbacks
- **GestureEvent**: Event creation, emergency gestures
- **Performance**: Frame processing speed

#### [`test_emergency_system.py`](test_emergency_system.py)
- **LocationService**: IP geolocation, location caching
- **EmergencyTriggerSystem**: Voice/gesture/manual triggers
- **MessageSender**: Twilio SMS, message formatting
- **EmergencyAlertSystem**: Complete emergency workflow
- **Performance**: Trigger latency

#### [`test_storage_comprehensive.py`](test_storage_comprehensive.py)
- **DatabaseManager**: SQLite connection, table creation
- **EventLogger**: Session management, event logging
- **SettingsManager**: Settings CRUD, contact management
- **LogAnalyzer**: Usage statistics, performance metrics
- **StorageSystem**: Complete storage integration
- **Performance**: Bulk logging, query speed

### Configuration Files

- [`conftest.py`](conftest.py) - Pytest fixtures and configuration
- [`pytest.ini`](../pytest.ini) - Pytest settings and markers
- [`requirements-test.txt`](requirements-test.txt) - Test dependencies

---

## 🏷️ Test Markers

Tests are categorized with markers for selective execution:

### Available Markers:

- `@pytest.mark.unit` - Fast unit tests (no external dependencies)
- `@pytest.mark.integration` - Integration tests (component interactions)
- `@pytest.mark.slow` - Slow tests (may take significant time)
- `@pytest.mark.requires_hardware` - Requires camera/microphone
- `@pytest.mark.requires_internet` - Requires internet connection

### Usage Examples:

```bash
# Run only unit tests
pytest -v -m unit

# Run tests without hardware requirements
pytest -v -m "not requires_hardware"

# Run fast tests only
pytest -v -m "not slow"

# Run integration tests that don't require hardware
pytest -v -m "integration and not requires_hardware"
```

---

## 📈 Coverage Goals

### Target Coverage: **85%+**

Current Coverage by Module:
- Speech Processing: ~75%
- Gesture Recognition: ~70%
- Emergency System: ~65%
- Storage System: ~80%

**Overall**: ~72% (working towards 85%+)

### Viewing Coverage:

```bash
# Run tests with coverage
pytest --cov --cov-report=term-missing

# Generate HTML report
pytest --cov --cov-report=html

# View HTML report
start htmlcov\index.html
```

---

## 🔧 Running Specific Tests

### Run Single Test File:
```bash
pytest tests/test_speech_processing.py -v
```

### Run Single Test Class:
```bash
pytest tests/test_speech_processing.py::TestAudioProcessor -v
```

### Run Single Test Method:
```bash
pytest tests/test_speech_processing.py::TestAudioProcessor::test_initialization -v
```

### Run Tests Matching Pattern:
```bash
# Run all tests with "emergency" in the name
pytest -k emergency -v
```

---

## 🐛 Debugging Failed Tests

### Verbose Output:
```bash
pytest -vv --tb=long
```

### Stop on First Failure:
```bash
pytest -x
```

### Drop into Debugger on Failure:
```bash
pytest --pdb
```

### Show Print Statements:
```bash
pytest -s
```

### Run with Maximum Detail:
```bash
pytest -vv --tb=long -s --log-cli-level=DEBUG
```

---

## ⚡ Performance Testing

Performance tests ensure the system meets latency requirements:

### Performance Targets:

| Component | Metric | Target |
|-----------|--------|--------|
| Speech Recognition | Latency | < 300ms |
| Gesture Detection | Frame Processing | < 33ms (30fps) |
| Emergency Trigger | Response Time | < 200ms |
| Audio Preprocessing | Processing Time | < 100ms/second |
| Gesture Classification | Classification | < 10ms |
| Emergency Retrieval | Location Fetch | < 5s |
| Database Logging | Log Entry | < 10ms |
| Database Query | Statistics Query | < 1s |

### Run Performance Tests:
```bash
# Run all performance tests
pytest -v -m slow

# Run with time reporting
pytest -v --durations=10
```

---

## 🔍 Continuous Integration

### Pre-Commit Checks:
```bash
# Run before committing code
pytest -v -m "not slow and not requires_hardware"
```

### Full CI Pipeline:
```bash
# Run complete test suite (as in CI/CD)
pytest -v --cov --cov-report=xml --junitxml=junit.xml
```

---

## 📝 Writing New Tests

### Test File Template:

```python
"""
Tests for [Component Name]
"""
import pytest
from unittest.mock import Mock, patch

from module.component import ComponentClass

@pytest.mark.unit
class TestComponentClass:
    """Test ComponentClass"""
    
    def test_initialization(self):
        """Test component initialization"""
        component = ComponentClass()
        assert component is not None
    
    def test_main_functionality(self):
        """Test main functionality"""
        component = ComponentClass()
        result = component.do_something()
        assert result is not None
```

### Best Practices:

1. **Name tests clearly**: `test_what_is_being_tested()`
2. **Use fixtures**: Reuse common setup code
3. **Test one thing**: Each test should test one specific behavior
4. **Use mocks**: Mock external dependencies (API calls, hardware)
5. **Assert meaningfully**: Use descriptive assertions
6. **Document tests**: Add docstrings explaining what's being tested

---

## 🔧 Troubleshooting

### Common Issues:

#### 1. Pytest Not Found
```bash
pip install pytest
```

#### 2. Import Errors
```bash
# Ensure backend is in Python path
cd d:\projects\apps\voice2eye\backend
python -m pytest tests/
```

#### 3. Hardware Tests Failing
```bash
# Skip hardware tests
pytest -v -m "not requires_hardware"
```

#### 4. Vosk Model Not Found
```bash
# Run installation script
python install.py
```

#### 5. Coverage Not Working
```bash
pip install pytest-cov
```

---

## 📊 Test Results Example

```
======================= test session starts =======================
platform win32 -- Python 3.13.0, pytest-7.4.0
rootdir: d:\projects\apps\voice2eye\backend
collected 87 items

tests/test_speech_processing.py ........  [ 9%]
tests/test_gesture_recognition.py ........  [ 19%]
tests/test_emergency_system.py ........  [ 29%]
tests/test_storage_comprehensive.py ........  [ 39%]

---------- coverage: platform win32, python 3.13.0 -----------
Name                                 Stmts   Miss  Cover   Missing
------------------------------------------------------------------
speech/audio_processing.py             120     30    75%   45-52, 78-85
speech/speech_recognition.py           180     45    75%   120-135, 200-215
speech/text_to_speech.py               150     35    77%   95-105, 180-190
gestures/opencv_hand_detection.py      200     60    70%   150-175, 230-245
gestures/opencv_gesture_classifier.py  140     40    71%   80-95, 130-140
emergency/location_services.py         160     55    66%   100-120, 180-200
emergency/emergency_alert_system.py    220     70    68%   150-180, 240-260
storage/database.py                    100     18    82%   60-72
storage/storage_system.py              130     25    81%   80-95
------------------------------------------------------------------
TOTAL                                 1400    378    73%

===================== 87 passed in 25.3s =====================
```

---

## 🎯 Next Steps

1. **Increase Coverage**: Add tests for uncovered code
2. **Add Edge Cases**: Test error conditions and edge cases
3. **Mock External APIs**: Add mocks for Twilio, location services
4. **Performance Benchmarks**: Add more performance tests
5. **Integration Tests**: Add end-to-end workflow tests

---

## 📚 Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [Pytest-Cov Documentation](https://pytest-cov.readthedocs.io/)
- [Python Testing Best Practices](https://realpython.com/pytest-python-testing/)

---

**Last Updated**: 2025-10-23  
**Test Suite Version**: 1.0  
**Python Version**: 3.13+
