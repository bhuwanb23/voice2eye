"""
Test suite for Settings & Configuration API endpoints
"""
import requests
import json

def test_settings_api_endpoints():
    """Test Settings & Configuration API endpoints"""
    base_url = "http://127.0.0.1:8000"
    
    print("=" * 60)
    print("Testing Settings & Configuration API Endpoints")
    print("=" * 60)
    
    try:
        # Test 1: GET /api/settings - Get all settings
        print("\n1. Testing GET /api/settings")
        response = requests.get(f"{base_url}/api/settings")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Settings keys: {list(data.get('settings', {}).keys())}")
            print("   ✅ PASS")
        else:
            print(f"   ❌ FAIL - {response.text}")
        
        # Test 2: GET /api/settings/contacts - Get emergency contacts
        print("\n2. Testing GET /api/settings/contacts")
        response = requests.get(f"{base_url}/api/settings/contacts")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Total contacts: {data.get('total_count', 0)}")
            print("   ✅ PASS")
        else:
            print(f"   ❌ FAIL - {response.text}")
        
        # Test 3: POST /api/settings/contacts - Add emergency contact
        print("\n3. Testing POST /api/settings/contacts")
        contact_data = {
            "name": "Test Contact",
            "phone": "+1234567890",
            "relationship": "Friend",
            "priority": 1,
            "enabled": True
        }
        
        response = requests.post(f"{base_url}/api/settings/contacts", json=contact_data)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Contact created: {data.get('created', False)}")
            print("   ✅ PASS")
        else:
            print(f"   ❌ FAIL - {response.text}")
        
        # Test 4: PUT /api/settings/contacts/:id - Update contact
        print("\n4. Testing PUT /api/settings/contacts/contact_1")
        update_data = {
            "name": "Updated Contact",
            "priority": 2
        }
        
        response = requests.put(f"{base_url}/api/settings/contacts/contact_1", json=update_data)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Contact updated: {data.get('updated', False)}")
            print("   ✅ PASS")
        else:
            print(f"   ❌ FAIL - {response.text}")
        
        # Test 5: DELETE /api/settings/contacts/:id - Delete contact
        print("\n5. Testing DELETE /api/settings/contacts/contact_new")
        response = requests.delete(f"{base_url}/api/settings/contacts/contact_new")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Contact deleted: {data.get('deleted', False)}")
            print("   ✅ PASS")
        else:
            print(f"   ❌ FAIL - {response.text}")
        
        print("\n" + "=" * 60)
        print("Settings API Testing Complete!")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to API server")
        print("Please make sure the API server is running:")
        print("cd d:\\projects\\apps\\voice2eye\\backend")
        print("python api/server.py")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")

if __name__ == "__main__":
    test_settings_api_endpoints()