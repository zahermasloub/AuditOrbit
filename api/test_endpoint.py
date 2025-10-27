"""Test FastAPI endpoint directly"""
import sys
sys.path.insert(0, 'd:/AuditOrbit/api')

from fastapi.testclient import TestClient
from app.presentation.main import app

client = TestClient(app)

print("🔍 Testing /auth/login endpoint...")

payload = {
    "email": "admin@example.com",
    "password": "Admin#2025"
}

print(f"\n📤 Sending POST request to /auth/login")
print(f"   Payload: {payload}")

try:
    response = client.post("/auth/login", json=payload)
    
    print(f"\n📥 Response:")
    print(f"   Status Code: {response.status_code}")
    print(f"   Headers: {dict(response.headers)}")
    print(f"   Content: {response.text[:500]}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ Login successful!")
        print(f"   Access token: {data.get('access_token', 'N/A')[:40]}...")
    else:
        print(f"\n❌ Login failed!")
        print(f"   Response: {response.json()}")
        
except Exception as e:
    print(f"\n❌ Exception occurred: {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()
