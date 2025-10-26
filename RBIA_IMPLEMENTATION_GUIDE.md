# RBIA Annual Planning - Implementation Guide

## ✅ المنفذ (Completed)

### 1. Database Migrations
- ✅ `backend/app/migrations/0012_rbia_core.sql` - تم إنشاؤه وتحديثه
  - `risk_universe` - جدول الكون الشامل للمخاطر
  - `risk_weights` - أوزان المخاطر
  - `annual_plan_items` - بنود الخطة السنوية
  - `annual_plan_approvals` - اعتمادات الخطط
  - `resource_allocations` - توزيع الموارد
  - Index للأداء على حساب المخاطر

### 2. Backend API
- ✅ `backend/app/api/routers/annual_plans.py` - Router للخطط السنوية
  - POST `/{plan_id}/submit` - تقديم الخطة
  - POST `/{plan_id}/approve` - اعتماد الخطة
  - POST `/{plan_id}/publish` - نشر الخطة
  
- ✅ `backend/app/services/annual_plans_service.py` - Service Layer
  - `submit()` - تقديم الخطة للمدير
  - `approve()` - اعتماد من (Manager/CAE/Committee)
  - `publish()` - نشر الخطة المعتمدة

### 3. Frontend Pages
- ✅ `frontend/src/app/planning/risk-universe/page.tsx` - جدول الكون الشامل للمخاطر
- ✅ `frontend/src/app/planning/scoring/page.tsx` - صفحة التقييم مع Heat Map
- ✅ `frontend/src/app/planning/plan-builder/page.tsx` - بناء الخطة
- ✅ `frontend/src/app/planning/approvals/page.tsx` - الاعتمادات
- ✅ `frontend/src/app/planning/calendar/page.tsx` - التقويم السنوي

### 4. Components
- ✅ `frontend/src/components/charts/HeatMap.tsx` - مكون Heat Map باستخدام ECharts

### 5. Build Status
- ✅ Frontend builds successfully
- ✅ All 11 routes compile without errors
- ✅ TypeScript type checking passes

---

## ⚙️ الخطوات المطلوبة لإكمال التكامل

### 1. RBAC - Permissions Setup

**الصلاحيات المطلوبة:**
```sql
-- إضافة الصلاحيات إلى جدول permissions
INSERT INTO permissions (id, name, description) VALUES
  (gen_random_uuid(), 'annual_plans:submit', 'Submit annual audit plan for approval'),
  (gen_random_uuid(), 'annual_plans:approve', 'Approve annual audit plan'),
  (gen_random_uuid(), 'annual_plans:publish', 'Publish approved annual audit plan');
```

**ربط الصلاحيات بالأدوار:**
```sql
-- Manager: يمكنه التقديم
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Manager' AND p.name = 'annual_plans:submit';

-- CAE: يمكنه الاعتماد
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'CAE' AND p.name = 'annual_plans:approve';

-- Committee: يمكنه الاعتماد النهائي
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Committee' AND p.name = 'annual_plans:approve';

-- Admin: يمكنه النشر
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Admin' AND p.name = 'annual_plans:publish';
```

### 2. Database Migration Execution

إذا كان المشروع يستخدم Alembic:

```bash
cd backend

# إنشاء revision جديدة
alembic revision -m "Add RBIA annual planning tables"

# نسخ محتوى 0012_rbia_core.sql إلى ملف الـ revision

# تطبيق الهجرة
alembic upgrade head
```

أو تنفيذ SQL مباشرة:
```bash
psql -U audituser -d auditdb -f backend/app/migrations/0012_rbia_core.sql
```

### 3. Backend Integration

**تسجيل Router في FastAPI:**
```python
# في backend/app/presentation/main.py أو app.py
from app.api.routers import annual_plans

app.include_router(annual_plans.router, prefix="/api/v1")
```

**التحقق من وجود جدول annual_plans الأساسي:**
```sql
-- تأكد من وجود الجدول الرئيسي
CREATE TABLE IF NOT EXISTS annual_plans (
  id UUID PRIMARY KEY,
  year INT NOT NULL,
  status TEXT CHECK (status IN ('draft','submitted','approved','rejected')) DEFAULT 'draft',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 4. Frontend API Integration

**توليد TypeScript Types من OpenAPI:**
```bash
cd frontend

# تأكد من تشغيل Backend على localhost:8000
# ثم قم بتوليد الأنواع
npm run api:gen
```

**تفعيل الدوال المعلقة في endpoints.ts:**
```typescript
// في frontend/src/lib/api/endpoints.ts
// قم بإزالة التعليقات من:
// - submitAnnualPlan()
// - approveAnnualPlan()
// - publishAnnualPlan()
```

### 5. End-to-End Testing

**سيناريو الاختبار الكامل (Happy Path):**

```typescript
// في frontend/tests/e2e/annual-planning.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Annual Planning E2E', () => {
  test('complete approval workflow', async ({ page }) => {
    // 1. Manager creates draft plan
    await page.goto('/planning/plan-builder');
    // ... create plan actions
    
    // 2. Manager submits plan
    await page.click('[data-testid="submit-plan"]');
    await expect(page.locator('.status')).toHaveText('submitted');
    
    // 3. CAE approves
    // Login as CAE user
    await page.click('[data-testid="approve-as-cae"]');
    await expect(page.locator('.approval-step')).toContainText('approved by CAE');
    
    // 4. Committee approves
    // Login as Committee member
    await page.click('[data-testid="approve-as-committee"]');
    await expect(page.locator('.approval-step')).toContainText('approved by Committee');
    
    // 5. Admin publishes
    // Login as Admin
    await page.click('[data-testid="publish-plan"]');
    await expect(page.locator('.status')).toHaveText('approved');
    
    // 6. Verify approvals trail
    await page.goto('/planning/approvals');
    await expect(page.locator('.approval-trail')).toContainText('Manager → CAE → Committee');
  });
});
```

**اختبارات Backend:**
```python
# في backend/app/tests/test_annual_plans.py
import pytest
from uuid import uuid4

def test_submit_plan_success(client, auth_headers_manager):
    plan_id = uuid4()
    response = client.post(
        f"/api/v1/annual-plans/{plan_id}/submit",
        headers=auth_headers_manager
    )
    assert response.status_code == 200
    assert response.json()["status"] == "submitted"

def test_approve_plan_by_cae(client, auth_headers_cae):
    plan_id = uuid4()
    response = client.post(
        f"/api/v1/annual-plans/{plan_id}/approve",
        params={"step": "cae", "notes": "Approved by CAE"},
        headers=auth_headers_cae
    )
    assert response.status_code == 200
    assert "approved_by_cae" in response.json()["status"]

def test_publish_requires_all_approvals(client, auth_headers_admin):
    plan_id = uuid4()
    # Try to publish without approvals
    response = client.post(
        f"/api/v1/annual-plans/{plan_id}/publish",
        headers=auth_headers_admin
    )
    assert response.status_code == 400
```

---

## 📊 Routes Available

### Frontend Routes (11 total):
1. `/` - Home
2. `/follow-up` - Follow-up
3. `/reports` - Reports
4. **`/planning/risk-universe`** ⭐ NEW - Risk Universe
5. **`/planning/scoring`** ⭐ NEW - Scoring & Heat Map
6. **`/planning/plan-builder`** ⭐ NEW - Plan Builder
7. **`/planning/approvals`** ⭐ NEW - Approvals
8. **`/planning/calendar`** ⭐ NEW - Calendar
9. `/playground/ui` - Component Playground
10. `/_not-found` - 404 Page

### Backend API Endpoints:
- `POST /api/v1/annual-plans/{plan_id}/submit`
- `POST /api/v1/annual-plans/{plan_id}/approve?step={manager|cae|committee}`
- `POST /api/v1/annual-plans/{plan_id}/publish`

---

## 🔄 Workflow Summary

```
┌─────────────┐
│   Manager   │ Creates draft → Submits plan
└──────┬──────┘
       │ POST /submit
       ▼
┌─────────────┐
│     CAE     │ Reviews → Approves
└──────┬──────┘
       │ POST /approve?step=cae
       ▼
┌─────────────┐
│  Committee  │ Final review → Approves
└──────┬──────┘
       │ POST /approve?step=committee
       ▼
┌─────────────┐
│    Admin    │ Publishes plan
└──────┬──────┘
       │ POST /publish
       ▼
┌─────────────┐
│  Published  │ ✅ Plan is live
└─────────────┘
```

---

## ✅ Checklist

- [x] Database tables created
- [x] Backend API endpoints implemented
- [x] Frontend pages created
- [x] HeatMap chart component
- [x] Build passes successfully
- [ ] **Apply database migration**
- [ ] **Add RBAC permissions**
- [ ] **Register router in FastAPI**
- [ ] **Generate OpenAPI types**
- [ ] **Uncomment endpoints.ts functions**
- [ ] **Write E2E tests**
- [ ] **Test complete workflow**

---

## 🚀 Next Steps

1. **Apply Migration**: Run Alembic or execute SQL directly
2. **Setup RBAC**: Add permissions and role bindings
3. **Start Backend**: Ensure FastAPI includes the new router
4. **Generate Types**: Run `npm run api:gen` in frontend
5. **Test E2E**: Write and run complete workflow tests
6. **Commit & PR**: `feat(rbia): annual planning (risk universe, scoring, approvals, calendar)`

---

## 📝 Notes

- All frontend pages use RTL for Arabic support
- HeatMap uses ECharts for interactive visualization
- Backend uses SQLAlchemy text() for direct SQL execution
- API follows REST conventions with proper HTTP status codes
- Approval workflow is sequential: Manager → CAE → Committee
- Each approval step creates a record in `annual_plan_approvals` table

---

**Status**: ✅ Core implementation complete, pending integration steps
**Date**: October 26, 2025
