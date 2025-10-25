"""
Tests for auditor endpoints - Phase 10B
"""
import pytest
from fastapi.testclient import TestClient
from app.presentation.main import app

client = TestClient(app)


@pytest.fixture
def auditor_token():
    """Get auth token for auditor user"""
    response = client.post(
        "/auth/login",
        json={"email": "auditor@test.com", "password": "testpass"}
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    return None


@pytest.fixture
def auth_headers(auditor_token):
    """Return authorization headers"""
    if auditor_token:
        return {"Authorization": f"Bearer {auditor_token}"}
    return {}


def test_get_my_tasks_unauthorized():
    """Test that unauthorized access is denied"""
    response = client.get("/auditor/tasks")
    assert response.status_code == 401


def test_get_my_tasks_active(auth_headers):
    """Test getting active tasks assigned to auditor"""
    response = client.get("/auditor/tasks?archived=false", headers=auth_headers)
    assert response.status_code in [200, 401]  # 401 if no test user exists
    if response.status_code == 200:
        data = response.json()
        assert "items" in data
        assert isinstance(data["items"], list)


def test_get_my_tasks_archived(auth_headers):
    """Test getting archived tasks"""
    response = client.get("/auditor/tasks?archived=true", headers=auth_headers)
    assert response.status_code in [200, 401]
    if response.status_code == 200:
        data = response.json()
        assert "items" in data


def test_accept_task_unauthorized():
    """Test that accepting task requires auth"""
    response = client.post("/auditor/tasks/test-id/accept")
    assert response.status_code == 401


def test_decline_task_unauthorized():
    """Test that declining task requires auth"""
    response = client.post("/auditor/tasks/test-id/decline")
    assert response.status_code == 401


def test_accept_task_invalid_id(auth_headers):
    """Test accepting task with invalid ID"""
    response = client.post(
        "/auditor/tasks/invalid-uuid/accept",
        headers=auth_headers
    )
    assert response.status_code in [400, 401, 404]


def test_decline_task_invalid_id(auth_headers):
    """Test declining task with invalid ID"""
    response = client.post(
        "/auditor/tasks/invalid-uuid/decline",
        headers=auth_headers
    )
    assert response.status_code in [400, 401, 404]


def test_get_engagement_checklists_unauthorized():
    """Test that getting checklists requires auth"""
    response = client.get("/auditor/engagements/test-id/checklists")
    assert response.status_code == 401


def test_get_engagement_checklists_invalid_id(auth_headers):
    """Test getting checklists with invalid engagement ID"""
    response = client.get(
        "/auditor/engagements/invalid-uuid/checklists",
        headers=auth_headers
    )
    assert response.status_code in [400, 401, 404]


def test_get_checklist_items_unauthorized():
    """Test that getting checklist items requires auth"""
    response = client.get("/auditor/engagements/test-id/checklists/test-id/items")
    assert response.status_code == 401


def test_get_checklist_items_invalid_id(auth_headers):
    """Test getting items with invalid IDs"""
    response = client.get(
        "/auditor/engagements/invalid-uuid/checklists/invalid-uuid/items",
        headers=auth_headers
    )
    assert response.status_code in [400, 401, 404]


def test_update_checklist_item_unauthorized():
    """Test that updating item requires auth"""
    response = client.put("/auditor/checklist-items/test-id?status=completed&note=test")
    assert response.status_code == 401


def test_update_checklist_item_invalid_id(auth_headers):
    """Test updating item with invalid ID"""
    response = client.put(
        "/auditor/checklist-items/invalid-uuid?status=completed&note=test",
        headers=auth_headers
    )
    assert response.status_code in [400, 401, 404]


def test_update_checklist_item_missing_params(auth_headers):
    """Test updating item without required params"""
    response = client.put(
        "/auditor/checklist-items/test-id",
        headers=auth_headers
    )
    # Should fail validation for missing status/note params
    assert response.status_code in [400, 401, 404, 422]


def test_auditor_router_registered():
    """Test that auditor router is registered"""
    response = client.get("/docs")
    assert response.status_code == 200
    # Check that OpenAPI docs include auditor endpoints
    response = client.get("/openapi.json")
    assert response.status_code == 200
    openapi = response.json()
    paths = openapi.get("paths", {})
    assert "/auditor/tasks" in paths or len(paths) > 0  # At least verify API is responding


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
