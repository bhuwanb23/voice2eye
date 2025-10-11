"""
Location Services for VOICE2EYE Emergency Alert System
Provides IP-based location detection and GPS integration
"""
import logging
import json
import time
import requests
from typing import Optional, Dict, Tuple, Any
from dataclasses import dataclass
from pathlib import Path

from geopy.geocoders import Nominatim
from geopy.distance import geodesic

logger = logging.getLogger(__name__)

@dataclass
class LocationData:
    """Location data structure"""
    latitude: float
    longitude: float
    address: str
    city: str
    country: str
    accuracy: float
    timestamp: float
    source: str  # 'ip', 'gps', 'manual'

class LocationService:
    """Location detection and management service"""
    
    def __init__(self):
        self.geocoder = Nominatim(user_agent="voice2eye-emergency")
        self.cache_file = Path("emergency/location_cache.json")
        self.cached_location: Optional[LocationData] = None
        self.cache_duration = 3600  # 1 hour in seconds
        
    def get_current_location(self) -> Optional[LocationData]:
        """Get current location using multiple methods"""
        try:
            # Try cached location first
            cached = self._get_cached_location()
            if cached and self._is_cache_valid(cached):
                logger.info("Using cached location")
                return cached
            
            # Try IP-based location
            ip_location = self._get_ip_location()
            if ip_location:
                self._cache_location(ip_location)
                return ip_location
            
            # Fallback to manual location
            logger.warning("Could not determine location automatically")
            return None
            
        except Exception as e:
            logger.error(f"Error getting current location: {e}")
            return None
    
    def _get_ip_location(self) -> Optional[LocationData]:
        """Get location using IP geolocation"""
        try:
            logger.info("Getting location via IP geolocation...")
            
            # Try multiple IP geolocation services
            services = [
                "http://ip-api.com/json/",
                "https://ipapi.co/json/",
                "https://api.ipify.org?format=json"
            ]
            
            for service_url in services:
                try:
                    response = requests.get(service_url, timeout=5)
                    if response.status_code == 200:
                        data = response.json()
                        location = self._parse_ip_response(data, service_url)
                        if location:
                            logger.info(f"IP location found: {location.city}, {location.country}")
                            return location
                except Exception as e:
                    logger.debug(f"IP service {service_url} failed: {e}")
                    continue
            
            logger.warning("All IP geolocation services failed")
            return None
            
        except Exception as e:
            logger.error(f"Error in IP location detection: {e}")
            return None
    
    def _parse_ip_response(self, data: Dict, service_url: str) -> Optional[LocationData]:
        """Parse IP geolocation response"""
        try:
            if "ip-api.com" in service_url:
                # ip-api.com format
                if data.get("status") == "success":
                    return LocationData(
                        latitude=float(data.get("lat", 0)),
                        longitude=float(data.get("lon", 0)),
                        address=data.get("query", ""),
                        city=data.get("city", ""),
                        country=data.get("country", ""),
                        accuracy=0.8,  # IP-based accuracy
                        timestamp=time.time(),
                        source="ip"
                    )
            
            elif "ipapi.co" in service_url:
                # ipapi.co format
                return LocationData(
                    latitude=float(data.get("latitude", 0)),
                    longitude=float(data.get("longitude", 0)),
                    address=data.get("ip", ""),
                    city=data.get("city", ""),
                    country=data.get("country_name", ""),
                    accuracy=0.8,
                    timestamp=time.time(),
                    source="ip"
                )
            
            return None
            
        except Exception as e:
            logger.error(f"Error parsing IP response: {e}")
            return None
    
    def get_address_from_coordinates(self, lat: float, lon: float) -> Optional[str]:
        """Get human-readable address from coordinates"""
        try:
            location = self.geocoder.reverse(f"{lat}, {lon}")
            if location:
                return str(location.address)
            return None
        except Exception as e:
            logger.error(f"Error getting address from coordinates: {e}")
            return None
    
    def _get_cached_location(self) -> Optional[LocationData]:
        """Get cached location"""
        try:
            if not self.cache_file.exists():
                return None
            
            with open(self.cache_file, 'r') as f:
                data = json.load(f)
            
            return LocationData(
                latitude=data.get("latitude", 0),
                longitude=data.get("longitude", 0),
                address=data.get("address", ""),
                city=data.get("city", ""),
                country=data.get("country", ""),
                accuracy=data.get("accuracy", 0),
                timestamp=data.get("timestamp", 0),
                source=data.get("source", "cached")
            )
            
        except Exception as e:
            logger.error(f"Error reading cached location: {e}")
            return None
    
    def _cache_location(self, location: LocationData):
        """Cache location data"""
        try:
            self.cache_file.parent.mkdir(parents=True, exist_ok=True)
            
            cache_data = {
                "latitude": location.latitude,
                "longitude": location.longitude,
                "address": location.address,
                "city": location.city,
                "country": location.country,
                "accuracy": location.accuracy,
                "timestamp": location.timestamp,
                "source": location.source
            }
            
            with open(self.cache_file, 'w') as f:
                json.dump(cache_data, f)
            
            self.cached_location = location
            logger.debug("Location cached successfully")
            
        except Exception as e:
            logger.error(f"Error caching location: {e}")
    
    def _is_cache_valid(self, location: LocationData) -> bool:
        """Check if cached location is still valid"""
        current_time = time.time()
        age = current_time - location.timestamp
        return age < self.cache_duration
    
    def validate_location_accuracy(self, location: LocationData) -> bool:
        """Validate location accuracy"""
        try:
            # Check if coordinates are valid
            if not (-90 <= location.latitude <= 90):
                return False
            if not (-180 <= location.longitude <= 180):
                return False
            
            # Check if location is not at default coordinates
            if location.latitude == 0 and location.longitude == 0:
                return False
            
            # Check accuracy threshold
            if location.accuracy < 0.5:
                logger.warning(f"Low location accuracy: {location.accuracy}")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error validating location accuracy: {e}")
            return False
    
    def get_location_summary(self, location: LocationData) -> str:
        """Get human-readable location summary"""
        try:
            if location.city and location.country:
                return f"{location.city}, {location.country}"
            elif location.address:
                return location.address
            else:
                return f"Coordinates: {location.latitude:.4f}, {location.longitude:.4f}"
        except Exception as e:
            logger.error(f"Error creating location summary: {e}")
            return "Location unknown"

def test_location_services() -> bool:
    """Test location services functionality"""
    try:
        logger.info("Testing location services...")
        
        service = LocationService()
        
        # Test location detection
        location = service.get_current_location()
        if location:
            logger.info(f"Location detected: {service.get_location_summary(location)}")
            logger.info(f"Coordinates: {location.latitude}, {location.longitude}")
            logger.info(f"Accuracy: {location.accuracy}")
            
            # Test validation
            is_valid = service.validate_location_accuracy(location)
            logger.info(f"Location valid: {is_valid}")
            
            return True
        else:
            logger.warning("Could not detect location")
            return False
            
    except Exception as e:
        logger.error(f"Location services test failed: {e}")
        return False

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    # Test location services
    test_location_services()
