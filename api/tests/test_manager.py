import pytest
from fastapi.testclient import TestClient
from app.presentation.main import app

client = TestClient(app)


@pytest.fixture
def auth_headers():
    """
    تسجيل دخول وإرجاع headers للمصادقة
    يفترض وجود مستخدم admin@example.com / Admin#2025
    """
    response = client.post(
        "/auth/login",
        json={"email": "admin@example.com", "password": "Admin#2025"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def engagement_id(auth_headers):
    """
    إنشاء أو جلب engagement للاختبار
    """
    # جلب أول engagement موجود
    response = client.get("/engagements?page=1&size=1", headers=auth_headers)
    assert response.status_code == 200
    items = response.json()["items"]
    if items:
        return items[0]["id"]
    
    # إنشاء engagement جديد إذا لم يكن موجود
    response = client.post(
        "/engagements",
        json={
            "annual_plan_year": 2025,
            "title": "Test Engagement for Manager",
            "scope": "Testing manager endpoints",
            "risk_rating": "medium",
        },
        headers=auth_headers,
    )
    assert response.status_code == 200
    return response.json()["id"]


@pytest.fixture
def user_id(auth_headers):
    """
    جلب معرّف مستخدم للتعيين
    """
    response = client.get("/users?page=1&size=1", headers=auth_headers)
    assert response.status_code == 200
    items = response.json()["items"]
    assert len(items) > 0, "No users found"
    return items[0]["id"]


class TestManagerAssignment:
    """
    اختبارات لـ assign/unassign endpoints
    """

    def test_assign_auditor_success(self, auth_headers, engagement_id, user_id):
        """
        اختبار تعيين مدقق لمهمة
        """
        response = client.post(
            f"/manager/engagements/{engagement_id}/assign?auditor_id={user_id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is True
        assert data["engagement_id"] == engagement_id
        assert data["auditor_id"] == user_id

    def test_assign_auditor_duplicate(self, auth_headers, engagement_id, user_id):
        """
        اختبار تعيين نفس المدقق مرتين (يجب أن يعود created=False)
        """
        # التعيين الأول
        client.post(
            f"/manager/engagements/{engagement_id}/assign?auditor_id={user_id}",
            headers=auth_headers,
        )
        # التعيين الثاني (duplicate)
        response = client.post(
            f"/manager/engagements/{engagement_id}/assign?auditor_id={user_id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is True
        assert data["created"] is False  # لم يتم إنشاء تعيين جديد

    def test_assign_nonexistent_engagement(self, auth_headers, user_id):
        """
        اختبار تعيين لمهمة غير موجودة
        """
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.post(
            f"/manager/engagements/{fake_id}/assign?auditor_id={user_id}",
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_assign_nonexistent_user(self, auth_headers, engagement_id):
        """
        اختبار تعيين مستخدم غير موجود
        """
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.post(
            f"/manager/engagements/{engagement_id}/assign?auditor_id={fake_id}",
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_unassign_auditor_success(self, auth_headers, engagement_id, user_id):
        """
        اختبار إلغاء تعيين مدقق
        """
        # تعيين أولاً
        client.post(
            f"/manager/engagements/{engagement_id}/assign?auditor_id={user_id}",
            headers=auth_headers,
        )
        # إلغاء التعيين
        response = client.delete(
            f"/manager/engagements/{engagement_id}/assign?auditor_id={user_id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is True

    def test_assign_without_permission(self, engagement_id, user_id):
        """
        اختبار التعيين بدون صلاحية (بدون token)
        """
        response = client.post(
            f"/manager/engagements/{engagement_id}/assign?auditor_id={user_id}"
        )
        assert response.status_code == 401


class TestManagerFindings:
    """
    اختبارات لـ findings by engagement endpoint
    """

    def test_get_findings_success(self, auth_headers, engagement_id):
        """
        اختبار جلب النتائج لمهمة
        """
        response = client.get(
            f"/manager/findings/by-engagement?engagement_id={engagement_id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert isinstance(data["items"], list)

    def test_get_findings_empty_engagement(self, auth_headers):
        """
        اختبار جلب نتائج لمهمة بدون نتائج
        """
        # إنشاء engagement جديد بدون evidence/findings
        response = client.post(
            "/engagements",
            json={
                "annual_plan_year": 2025,
                "title": "Empty Engagement",
                "scope": "No findings",
                "risk_rating": "low",
            },
            headers=auth_headers,
        )
        empty_eng_id = response.json()["id"]

        response = client.get(
            f"/manager/findings/by-engagement?engagement_id={empty_eng_id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []

    def test_get_findings_without_permission(self, engagement_id):
        """
        اختبار جلب النتائج بدون صلاحية
        """
        response = client.get(
            f"/manager/findings/by-engagement?engagement_id={engagement_id}"
        )
        assert response.status_code == 401

    def test_get_findings_missing_engagement_id(self, auth_headers):
        """
        اختبار جلب النتائج بدون إرسال engagement_id
        """
        response = client.get(
            "/manager/findings/by-engagement",
            headers=auth_headers,
        )
        assert response.status_code == 422  # Validation error
