"""
Backend Tests for Annual Plans API
Tests the complete approval workflow: Submit → CAE Approve → Committee Approve → Publish
"""
import pytest
from uuid import uuid4


def test_submit_plan_success(client, auth_headers_manager):
    """Test that a manager can submit a plan"""
    plan_id = uuid4()
    response = client.post(
        f"/api/v1/annual-plans/{plan_id}/submit",
        headers=auth_headers_manager
    )
    assert response.status_code == 200
    assert response.json()["status"] == "submitted"


def test_approve_plan_by_cae(client, auth_headers_cae):
    """Test that CAE can approve a plan"""
    plan_id = uuid4()
    response = client.post(
        f"/api/v1/annual-plans/{plan_id}/approve",
        params={"step": "cae", "notes": "Approved by CAE"},
        headers=auth_headers_cae
    )
    assert response.status_code == 200
    assert "approved_by_cae" in response.json()["status"]


def test_approve_plan_by_committee(client, auth_headers_committee):
    """Test that Committee can approve a plan"""
    plan_id = uuid4()
    response = client.post(
        f"/api/v1/annual-plans/{plan_id}/approve",
        params={"step": "committee", "notes": "Approved by Committee"},
        headers=auth_headers_committee
    )
    assert response.status_code == 200
    assert "approved_by_committee" in response.json()["status"]


def test_publish_requires_all_approvals(client, auth_headers_admin, auth_headers_cae, auth_headers_committee):
    """Test that publish requires both CAE and Committee approvals"""
    plan_id = uuid4()
    
    # محاولة نشر بدون موافقات → 400
    response = client.post(
        f"/api/v1/annual-plans/{plan_id}/publish",
        headers=auth_headers_admin
    )
    assert response.status_code == 400
    
    # موافقة CAE
    client.post(
        f"/api/v1/annual-plans/{plan_id}/approve",
        params={"step": "cae", "notes": "CAE approved"},
        headers=auth_headers_cae
    )
    
    # محاولة نشر بموافقة CAE فقط → 400
    response2 = client.post(
        f"/api/v1/annual-plans/{plan_id}/publish",
        headers=auth_headers_admin
    )
    assert response2.status_code == 400
    
    # موافقة اللجنة
    client.post(
        f"/api/v1/annual-plans/{plan_id}/approve",
        params={"step": "committee", "notes": "Committee approved"},
        headers=auth_headers_committee
    )
    
    # الآن يُسمح بالنشر
    response3 = client.post(
        f"/api/v1/annual-plans/{plan_id}/publish",
        headers=auth_headers_admin
    )
    assert response3.status_code == 200
    assert response3.json()["status"] == "published"


def test_complete_workflow(client, auth_headers_manager, auth_headers_cae, auth_headers_committee, auth_headers_admin):
    """Test complete workflow from draft to published"""
    plan_id = uuid4()
    
    # 1. Submit
    r1 = client.post(f"/api/v1/annual-plans/{plan_id}/submit", headers=auth_headers_manager)
    assert r1.status_code == 200
    
    # 2. CAE Approve
    r2 = client.post(
        f"/api/v1/annual-plans/{plan_id}/approve",
        params={"step": "cae"},
        headers=auth_headers_cae
    )
    assert r2.status_code == 200
    
    # 3. Committee Approve
    r3 = client.post(
        f"/api/v1/annual-plans/{plan_id}/approve",
        params={"step": "committee"},
        headers=auth_headers_committee
    )
    assert r3.status_code == 200
    
    # 4. Publish
    r4 = client.post(f"/api/v1/annual-plans/{plan_id}/publish", headers=auth_headers_admin)
    assert r4.status_code == 200
    assert r4.json()["status"] == "published"


def test_invalid_approval_step(client, auth_headers_cae):
    """Test that invalid approval step returns 400"""
    plan_id = uuid4()
    response = client.post(
        f"/api/v1/annual-plans/{plan_id}/approve",
        params={"step": "invalid_step"},
        headers=auth_headers_cae
    )
    assert response.status_code == 400
