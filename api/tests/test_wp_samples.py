import atexit
import os
from typing import Any

import httpx
import pytest

API = os.getenv("API", os.getenv("API_URL", "http://testserver"))
ADMIN = {"email": "admin@example.com", "password": "Admin#2025"}

if API == "http://testserver":
    os.environ.setdefault("AUTH_BYPASS_PERMISSIONS", "1")
    from app.presentation.main import app

    transport = httpx.ASGITransport(app=app)
    _client = httpx.Client(transport=transport, base_url=API, timeout=30.0)  # type: ignore[arg-type]
    atexit.register(_client.close)

    def _post(url: str, **kw: Any) -> httpx.Response:
        return _client.post(url, **kw)

    def _get(url: str, **kw: Any) -> httpx.Response:
        return _client.get(url, **kw)

    def _delete(url: str, **kw: Any) -> httpx.Response:
        return _client.delete(url, **kw)

    def _patch(url: str, **kw: Any) -> httpx.Response:
        return _client.patch(url, **kw)
else:
    def _post(url: str, **kw: Any) -> httpx.Response:
        return httpx.post(url, **kw)

    def _get(url: str, **kw: Any) -> httpx.Response:
        return httpx.get(url, **kw)

    def _delete(url: str, **kw: Any) -> httpx.Response:
        return httpx.delete(url, **kw)

    def _patch(url: str, **kw: Any) -> httpx.Response:
        return httpx.patch(url, **kw)


@pytest.fixture(scope="session")
def token() -> str:
    response = _post(f"{API}/auth/login", json=ADMIN, timeout=30.0)
    response.raise_for_status()
    return response.json()["access_token"]


@pytest.fixture
def auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_wp_create_and_list(auth: dict[str, str]) -> None:
    engagements = _get(f"{API}/engagements?page=1&size=1", headers=auth, timeout=30.0)
    engagements.raise_for_status()
    payload = engagements.json()
    assert payload["items"], "No engagements to test against"
    engagement_id = payload["items"][0]["id"]

    wp_payload: dict[str, object] = {
        "engagement_id": engagement_id,
        "wp_ref": "P2-03",
        "objective": "3-way match",
        "procedure": "AP voucher sampling",
    }
    create_response = _post(f"{API}/wp", headers=auth, json=wp_payload, timeout=30.0)
    assert create_response.status_code in (201, 409)

    list_response = _get(f"{API}/wp?engagement_id={engagement_id}", headers=auth, timeout=30.0)
    list_response.raise_for_status()
    data = list_response.json()
    assert isinstance(data.get("items"), list)


def test_samples_create_and_list(auth: dict[str, str]) -> None:
    engagements = _get(f"{API}/engagements?page=1&size=1", headers=auth, timeout=30.0)
    engagements.raise_for_status()
    payload = engagements.json()
    assert payload["items"], "No engagements to test against"
    engagement_id = payload["items"][0]["id"]

    sample_payload: dict[str, object] = {
        "engagement_id": engagement_id,
        "method": "systematic",
        "size": 5,
    }
    create_response = _post(f"{API}/samples", headers=auth, json=sample_payload, timeout=30.0)
    assert create_response.status_code == 201

    list_response = _get(f"{API}/samples?engagement_id={engagement_id}", headers=auth, timeout=30.0)
    list_response.raise_for_status()
    data = list_response.json()
    assert any(item.get("method") == "systematic" for item in data.get("items", []))


def test_wp_update_and_delete(auth: dict[str, str]) -> None:
    engagements = _get(f"{API}/engagements?page=1&size=1", headers=auth, timeout=30.0)
    engagements.raise_for_status()
    engagement_id = engagements.json()["items"][0]["id"]

    # Create working paper
    wp_payload: dict[str, object] = {
        "engagement_id": engagement_id,
        "wp_ref": "TEST-WP-01",
        "objective": "Test update/delete",
        "procedure": "Initial procedure",
    }
    create_resp = _post(f"{API}/wp", headers=auth, json=wp_payload, timeout=30.0)
    assert create_resp.status_code == 201
    wp_id = create_resp.json()["id"]

    # Update working paper
    update_payload = {"objective": "Updated objective"}
    update_resp = _patch(f"{API}/wp/{wp_id}", headers=auth, json=update_payload, timeout=30.0)
    assert update_resp.status_code == 200
    assert update_resp.json()["objective"] == "Updated objective"

    # Delete working paper
    delete_resp = _delete(f"{API}/wp/{wp_id}", headers=auth, timeout=30.0)
    assert delete_resp.status_code == 204


def test_samples_update_and_delete(auth: dict[str, str]) -> None:
    engagements = _get(f"{API}/engagements?page=1&size=1", headers=auth, timeout=30.0)
    engagements.raise_for_status()
    engagement_id = engagements.json()["items"][0]["id"]

    # Create sample
    sample_payload: dict[str, object] = {
        "engagement_id": engagement_id,
        "method": "random",
        "size": 10,
    }
    create_resp = _post(f"{API}/samples", headers=auth, json=sample_payload, timeout=30.0)
    assert create_resp.status_code == 201
    sample_id = create_resp.json()["id"]

    # Update sample
    update_payload = {"size": 20}
    update_resp = _patch(f"{API}/samples/{sample_id}", headers=auth, json=update_payload, timeout=30.0)
    assert update_resp.status_code == 200
    assert update_resp.json()["size"] == 20

    # Delete sample
    delete_resp = _delete(f"{API}/samples/{sample_id}", headers=auth, timeout=30.0)
    assert delete_resp.status_code == 204
