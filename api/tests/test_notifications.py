from fastapi.testclient import TestClient

from app.presentation.main import app


def login(client: TestClient) -> tuple[str, str | None]:
  response = client.post("/auth/login", json={"email": "admin@example.com", "password": "Admin#2025"})
  assert response.status_code == 200
  data = response.json()
  return data["access_token"], data.get("user_id")


def test_notifications_crud_smoke() -> None:
  client = TestClient(app)
  token, user_id = login(client)
  headers = {"Authorization": f"Bearer {token}"}

  response = client.post(
    "/notifications",
    headers=headers,
    json={"user_id": user_id, "kind": "system", "title": "hello", "body": "world"},
  )
  assert response.status_code == 200
  notification_id = response.json()["id"]

  response = client.get("/notifications?status=unread", headers=headers)
  assert response.status_code == 200

  response = client.post(f"/notifications/{notification_id}/mark-read", headers=headers)
  assert response.status_code == 200
  assert response.json()["ok"] is True
