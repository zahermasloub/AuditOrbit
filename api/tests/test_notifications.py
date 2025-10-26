from fastapi.testclient import TestClient

from app.presentation.main import app


def login(client: TestClient) -> tuple[str, str | None]:
  response = client.post("/auth/login", json={"email": "admin@example.com", "password": "Admin#2025"})
  assert response.status_code == 200
  data = response.json()
  token = data["access_token"]
  headers = {"Authorization": f"Bearer {token}"}
  users = client.get("/users?page=1&size=50", headers=headers)
  assert users.status_code == 200
  user_items = users.json().get("items", [])
  user_id = next((item["id"] for item in user_items if item["email"] == "admin@example.com"), None)
  assert user_id, "Admin user not found in /users response"
  return token, user_id


def test_notifications_crud_smoke() -> None:
  client = TestClient(app)
  token, user_id = login(client)
  headers = {"Authorization": f"Bearer {token}"}

  response = client.post(
    "/notifications",
    headers=headers,
    json={"user_id": user_id, "kind": "system", "title": "hello", "body": "world"},
  )
  if response.status_code != 200:
    print(f"DEBUG: status={response.status_code}, body={response.json()}")
  assert response.status_code == 200
  notification_id = response.json()["id"]

  response = client.get("/notifications?status=unread", headers=headers)
  assert response.status_code == 200

  response = client.post(f"/notifications/{notification_id}/mark-read", headers=headers)
  assert response.status_code == 200
  assert response.json()["ok"] is True
