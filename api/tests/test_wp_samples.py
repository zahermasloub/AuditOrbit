import os

import httpx
import pytest

API = os.getenv("API_URL", "http://api:8000")
ADMIN = {"email": "admin@example.com", "password": "Admin#2025"}


@pytest.fixture(scope="session")
def token() -> str:
    response = httpx.post(f"{API}/auth/login", json=ADMIN, timeout=30.0)
    response.raise_for_status()
    return response.json()["access_token"]


@pytest.fixture
def auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_wp_create_and_list(auth: dict[str, str]) -> None:
    engagements = httpx.get(f"{API}/engagements?page=1&size=1", headers=auth, timeout=30.0)
    engagements.raise_for_status()
    payload = engagements.json()
    assert payload["items"], "No engagements to test against"
    engagement_id = payload["items"][0]["id"]

    wp_payload = {
        "engagement_id": engagement_id,
        "wp_ref": "P2-03",
        "objective": "3-way match",
        "procedure": "AP voucher sampling",
    }
    create_response = httpx.post(f"{API}/wp", headers=auth, json=wp_payload, timeout=30.0)
    assert create_response.status_code in (201, 409)

    list_response = httpx.get(f"{API}/wp?engagement_id={engagement_id}", headers=auth, timeout=30.0)
    list_response.raise_for_status()
    data = list_response.json()
    assert isinstance(data.get("items"), list)


def test_samples_create_and_list(auth: dict[str, str]) -> None:
    engagements = httpx.get(f"{API}/engagements?page=1&size=1", headers=auth, timeout=30.0)
    engagements.raise_for_status()
    payload = engagements.json()
    assert payload["items"], "No engagements to test against"
    engagement_id = payload["items"][0]["id"]

    sample_payload = {"engagement_id": engagement_id, "method": "systematic", "size": 5}
    create_response = httpx.post(f"{API}/samples", headers=auth, json=sample_payload, timeout=30.0)
    assert create_response.status_code == 201

    list_response = httpx.get(f"{API}/samples?engagement_id={engagement_id}", headers=auth, timeout=30.0)
    list_response.raise_for_status()
    data = list_response.json()
    assert any(item.get("method") == "systematic" for item in data.get("items", []))
