#!/usr/bin/env python3
"""Test engagement creation through API endpoint"""

import sys
sys.path.insert(0, 'D:/AuditOrbit/api')

from fastapi.testclient import TestClient
from app.presentation.main import app

client = TestClient(app)

def test_create_engagement():
    # Login first
    print("=" * 80)
    print("STEP 1: Login")
    print("=" * 80)
    
    login_response = client.post(
        "/auth/login",
        json={"email": "admin@example.com", "password": "Admin#2025"}
    )
    
    print(f"Status: {login_response.status_code}")
    if login_response.status_code != 200:
        print(f"Error: {login_response.text}")
        return
    
    data = login_response.json()
    token = data["access_token"]
    print(f"✅ Token received: {token[:50]}...")
    
    # Create engagement
    print("\n" + "=" * 80)
    print("STEP 2: Create Engagement")
    print("=" * 80)
    
    engagement_data = {
        "title": "مراجعة النظام المالي الجديد",
        "scope": "مراجعة شاملة للنظام المالي والمحاسبي",
        "risk_rating": "high",
        "annual_plan_year": 2025
    }
    
    print(f"Data: {engagement_data}")
    
    response = client.post(
        "/engagements",
        json=engagement_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    print(f"\nStatus: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("\n✅ SUCCESS!")
        result = response.json()
        print(f"  ID: {result.get('id')}")
        print(f"  Title: {result.get('title')}")
        print(f"  Status: {result.get('status')}")
    else:
        print("\n❌ FAILED!")

if __name__ == "__main__":
    test_create_engagement()
