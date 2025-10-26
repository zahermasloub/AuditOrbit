# RBIA Annual Planning - Integration Steps

## ✅ ما تم إنجازه

### Core Implementation (100% Complete)
- ✅ Database migrations with `published` status
- ✅ Enhanced AnnualPlansService with validation logic
- ✅ RBAC permissions SQL script
- ✅ Interactive Approvals page with test buttons
- ✅ API endpoint functions uncommented
- ✅ Backend tests
- ✅ Frontend E2E tests

---

## 🚀 خطوات التكامل (Integration Steps)

### 1. تطبيق Database Migrations

```bash
cd backend

# Option A: Using Alembic (Recommended)
alembic upgrade head

# Option B: Direct SQL execution
psql -U audituser -d auditdb -f app/migrations/0012_rbia_core.sql
psql -U audituser -d auditdb -f app/migrations/0012_rbia_rbac.sql
```

**تحقق من النجاح:**
```sql
-- Check tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
AND tablename IN ('risk_universe', 'annual_plans', 'annual_plan_approvals');

-- Check status constraint includes 'published'
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'annual_plans_status_check';
```

---

### 2. تسجيل Router في FastAPI

**ملف: `backend/app/presentation/main.py`**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import annual_plans  # ← إضافة هذا السطر

app = FastAPI(
    title="AuditOrbit API",
    version="1.0.0",
    description="Internal Audit Management System"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(annual_plans.router, prefix="/api/v1", tags=["annual-plans"])  # ← إضافة هذا السطر

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

**تحقق من التسجيل:**
```bash
# Start backend
cd backend
uvicorn app.presentation.main:app --reload

# Check OpenAPI docs
curl http://localhost:8000/docs
# يجب أن ترى endpoints الثلاثة:
# - POST /api/v1/annual-plans/{plan_id}/submit
# - POST /api/v1/annual-plans/{plan_id}/approve
# - POST /api/v1/annual-plans/{plan_id}/publish
```

---

### 3. توليد TypeScript Types

```bash
cd frontend

# Make sure backend is running on localhost:8000
npm run api:gen

# Verify types.gen.ts was updated
ls -lh src/lib/api/types.gen.ts
```

**إذا واجهت خطأ:**
```bash
# Check backend is running
curl http://localhost:8000/openapi.json

# Manual generation
npx openapi-typescript http://localhost:8000/openapi.json -o src/lib/api/types.gen.ts
```

---

### 4. اختبار الـ Backend

```bash
cd backend

# Install test dependencies if not already installed
pip install -r requirements-dev.txt

# Run annual plans tests
pytest app/tests/test_annual_plans.py -v

# Expected output:
# test_submit_plan_success PASSED
# test_approve_plan_by_cae PASSED
# test_approve_plan_by_committee PASSED
# test_publish_requires_all_approvals PASSED
# test_complete_workflow PASSED
# test_invalid_approval_step PASSED
```

---

### 5. اختبار الـ Frontend

```bash
cd frontend

# Run E2E tests
npx playwright test tests/e2e/annual-planning.spec.ts

# Run with UI
npx playwright test tests/e2e/annual-planning.spec.ts --ui

# Expected: All tests pass
# ✓ complete approval workflow - happy path
# ✓ publish fails without approvals
# ✓ approval stages are displayed correctly
# ✓ buttons are properly labeled
# ✓ activity log shows operations in order
# ✓ risk universe page loads
# ✓ scoring page loads with heatmap
# ✓ plan builder page loads
# ✓ calendar page loads with months
```

---

### 6. الاختبار اليدوي (Manual Testing)

**A. تجهيز بيانات الاختبار:**
```sql
-- Create a test user for each role
INSERT INTO users (id, email, role_id) VALUES
  (gen_random_uuid(), 'manager@test.com', (SELECT id FROM roles WHERE name='Manager')),
  (gen_random_uuid(), 'cae@test.com', (SELECT id FROM roles WHERE name='CAE')),
  (gen_random_uuid(), 'committee@test.com', (SELECT id FROM roles WHERE name='Committee')),
  (gen_random_uuid(), 'admin@test.com', (SELECT id FROM roles WHERE name='Admin'));

-- Create a test plan
INSERT INTO annual_plans (id, year, status, created_by) VALUES
  ('12345678-1234-1234-1234-123456789012', 2025, 'draft', 
   (SELECT id FROM users WHERE email='manager@test.com'));
```

**B. اختبار من الواجهة:**
1. افتح `http://localhost:3000/planning/approvals`
2. أدخل UUID الخطة: `12345678-1234-1234-1234-123456789012`
3. اضغط الأزرار بالترتيب:
   - ✅ Submit (Manager)
   - ✅ Approve (CAE)
   - ✅ Approve (Committee)
   - ✅ Publish (Admin)
4. تأكد من ظهور ✅ لكل عملية في Activity Log

**C. التحقق من قاعدة البيانات:**
```sql
-- Check plan status
SELECT id, year, status FROM annual_plans 
WHERE id = '12345678-1234-1234-1234-123456789012';
-- Expected: status = 'published'

-- Check approvals trail
SELECT step, decision, decided_at FROM annual_plan_approvals
WHERE annual_plan_id = '12345678-1234-1234-1234-123456789012'
ORDER BY decided_at;
-- Expected: 3 rows (manager→submitted, cae→approved, committee→approved)
```

---

## 📋 Checklist النهائي

### Database
- [ ] Migration 0012_rbia_core.sql applied
- [ ] Migration 0012_rbia_rbac.sql applied
- [ ] Tables verified: `risk_universe`, `annual_plans`, `annual_plan_approvals`, etc.
- [ ] Status constraint includes 'published'
- [ ] RBAC permissions created
- [ ] Role bindings created

### Backend
- [ ] Router registered in main.py
- [ ] Backend starts without errors
- [ ] OpenAPI docs show 3 new endpoints
- [ ] All backend tests pass (6/6)
- [ ] Service logic validates approvals correctly

### Frontend
- [ ] types.gen.ts generated successfully
- [ ] No TypeScript errors in endpoints.ts
- [ ] Frontend builds successfully
- [ ] All E2E tests pass (9/9)
- [ ] Manual testing works end-to-end

### Integration
- [ ] Frontend can call backend APIs
- [ ] CORS configured correctly
- [ ] Authentication working
- [ ] Complete workflow tested: Draft → Submit → CAE → Committee → Publish

---

## 🐛 استكشاف الأخطاء (Troubleshooting)

### خطأ: "Cannot find module 'app.core.auth'"
```python
# Check auth module exists
ls backend/app/core/auth.py

# If missing, create stub:
# backend/app/core/auth.py
from fastapi import Depends, HTTPException

def require(permission: str):
    def dependency(user=None):  # Replace with actual auth logic
        # TODO: Check if user has permission
        return user
    return Depends(dependency)
```

### خطأ: "Cannot find module 'app.core.db'"
```python
# Check db module exists
ls backend/app/core/db.py

# If missing, create stub:
# backend/app/core/db.py
from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://user:pass@localhost/dbname"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

@contextmanager
def session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### خطأ: "CORS policy: No 'Access-Control-Allow-Origin'"
```python
# في main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### خطأ: "Cannot POST /api/v1/annual-plans/..."
- تأكد من تسجيل Router بـ prefix صحيح: `prefix="/api/v1"`
- تأكد من تشغيل Backend على المنفذ 8000
- راجع `http://localhost:8000/docs` للتأكد من الـ endpoints

---

## 📊 ملخص الملفات المُنشأة/المُحدّثة

### Backend (6 files)
1. ✅ `backend/app/migrations/0012_rbia_core.sql` - Updated
2. ✅ `backend/app/migrations/0012_rbia_rbac.sql` - New
3. ✅ `backend/app/api/routers/annual_plans.py` - New
4. ✅ `backend/app/services/annual_plans_service.py` - Updated
5. ✅ `backend/app/tests/test_annual_plans.py` - New
6. ⚠️ `backend/app/presentation/main.py` - Needs manual update

### Frontend (3 files)
1. ✅ `frontend/src/app/planning/approvals/page.tsx` - Updated
2. ✅ `frontend/src/lib/api/endpoints.ts` - Updated
3. ✅ `frontend/tests/e2e/annual-planning.spec.ts` - New

### Total: 9 files (8 complete, 1 pending manual update)

---

## 🎉 النتيجة المتوقعة

بعد إكمال جميع الخطوات:

✅ **Workflow كامل يعمل:**
```
Draft Plan
   ↓
Manager submits (status: submitted)
   ↓
CAE approves (record in approvals)
   ↓
Committee approves (status: committee_approved)
   ↓
Admin publishes (status: published)
   ↓
✅ Plan is Live!
```

✅ **RBAC فعّال:**
- Manager: يمكنه Submit فقط
- CAE: يمكنه Approve فقط
- Committee: يمكنه Approve فقط
- Admin: يمكنه Publish فقط

✅ **Validation تعمل:**
- لا يمكن Publish بدون موافقة CAE
- لا يمكن Publish بدون موافقة Committee
- لا يمكن Approve بـ step غير صحيح

✅ **Tests جاهزة:**
- 6 اختبارات Backend
- 9 اختبارات Frontend E2E

---

**تاريخ:** October 26, 2025  
**الحالة:** ✅ Ready for Integration
