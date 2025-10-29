# 📋 تقرير المراجعة الشاملة للباك إند - AuditOrbit
## Backend Comprehensive Review & Documentation

---

## 🎯 نظرة عامة على المشروع
### Project Overview

**اسم المشروع:** AuditOrbit - منصة التدقيق الداخلي الذكية  
**النسخة:** 0.2.0  
**التقنيات المستخدمة:**
- **Backend Framework:** FastAPI (Python 3.13)
- **Database:** PostgreSQL 15+
- **ORM:** SQLAlchemy 2.0.36
- **Authentication:** JWT (python-jose) + bcrypt 4.2.1
- **Security:** RBAC (Role-Based Access Control)
- **API Documentation:** Swagger UI (`/docs`), ReDoc (`/redoc`)

---

## 📁 البنية المعمارية - Architecture Structure

```
api/
├── app/
│   ├── presentation/          # طبقة العرض - API Layer
│   │   ├── main.py           # التطبيق الرئيسي
│   │   ├── routers/          # جميع endpoints
│   │   └── middlewares/      # Rate limiting, Security
│   ├── application/          # طبقة التطبيق - Business Logic
│   │   └── dtos/            # Data Transfer Objects
│   ├── domain/               # طبقة النطاق - Domain Models
│   │   ├── entities/        # Business Entities
│   │   └── ports/           # Interfaces
│   ├── infrastructure/       # طبقة البنية التحتية
│   │   ├── db/              # Database Configuration
│   │   └── security/        # JWT, Passwords, RBAC
│   └── config/              # Configuration Files
└── alembic/                 # Database Migrations
```

**العمارة المتبعة:** Clean Architecture / Hexagonal Architecture
- **Separation of Concerns:** فصل واضح بين الطبقات
- **Dependency Inversion:** الاعتماد على Interfaces وليس Implementations
- **Testability:** سهولة اختبار كل طبقة بشكل مستقل

---

## 🔐 نظام المصادقة والأمان - Authentication & Security

### 1. Authentication Flow

```python
# ملف: api/app/presentation/routers/auth.py

@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    """
    تسجيل الدخول وإصدار JWT Token
    
    Input:
        - email: البريد الإلكتروني
        - password: كلمة المرور
    
    Output:
        - access_token: صالح لمدة 3600 ثانية (ساعة)
        - refresh_token: صالح لمدة 86400 ثانية (24 ساعة)
        - user: معلومات المستخدم (id, email, name, role, locale)
    """
```

**خطوات المصادقة:**
1. استلام البريد الإلكتروني وكلمة المرور
2. البحث عن المستخدم في قاعدة البيانات
3. التحقق من كلمة المرور باستخدام `bcrypt.checkpw()`
4. إنشاء JWT tokens (access + refresh)
5. إرجاع البيانات مع معلومات المستخدم

### 2. Password Security

```python
# ملف: api/app/infrastructure/security/passwords.py

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """تشفير كلمة المرور باستخدام bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    """التحقق من كلمة المرور"""
    return pwd_context.verify(plain, hashed)
```

**معايير الأمان:**
- ✅ استخدام bcrypt مع salt تلقائي
- ✅ Cost factor: 12 (آمن ضد brute force)
- ✅ عدم تخزين كلمات المرور بشكل نصي
- ✅ رسائل خطأ موحدة (لا تكشف وجود البريد من عدمه)

### 3. JWT Token Management

```python
# ملف: api/app/infrastructure/security/jwt.py

def create_token(user_id: str, expires_delta: int) -> str:
    """
    إنشاء JWT Token
    
    Payload:
        - sub: user_id (UUID)
        - exp: expiration timestamp
        - iat: issued at timestamp
    """

def decode_token(token: str) -> dict:
    """فك تشفير Token والتحقق من صلاحيته"""
```

### 4. RBAC System

```python
# ملف: api/app/infrastructure/security/rbac.py

def enforce(db: Session, user_id: str, resource: str, action: str):
    """
    التحقق من صلاحيات المستخدم
    
    Parameters:
        - user_id: معرف المستخدم
        - resource: المورد (users, engagements, reports, etc.)
        - action: الإجراء (read, create, update, delete)
    
    Raises:
        - HTTPException 403: إذا لم يكن لدى المستخدم الصلاحية
    """
```

**الأدوار الموجودة:**
- `admin`: صلاحيات كاملة على كل الموارد
- `manager`: إدارة المهام والتقارير
- `auditor`: تنفيذ عمليات التدقيق
- `user`: عرض المعلومات فقط

---

## 🛣️ جميع API Endpoints - Complete API Reference

### 📍 Module 1: Authentication (`/auth`)

| Endpoint | Method | Description | RBAC | Request Body | Response |
|----------|--------|-------------|------|--------------|----------|
| `/auth/login` | POST | تسجيل الدخول | Public | `{email, password}` | `{access_token, refresh_token, user}` |
| `/auth/refresh` | POST | تجديد Token | Protected | Header: `Authorization: Bearer {token}` | `{access_token, refresh_token}` |

**مثال على الاستخدام:**
```bash
# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Admin#2025"}'

# Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": "4c64c2f5-bd64-4f67-a749-79ab5d3a3401",
    "email": "admin@example.com",
    "name": "Admin",
    "role": "admin",
    "locale": "ar"
  }
}
```

---

### 📍 Module 2: Users Management (`/users`)

| Endpoint | Method | Description | RBAC | Request | Response |
|----------|--------|-------------|------|---------|----------|
| `/users` | GET | قائمة المستخدمين | `users:read` | Query: `?page=1&size=20` | `{items[], page, size, total}` |
| `/users` | POST | إضافة مستخدم | `users:create` | `{email, name, password, role, locale}` | `UserOut` |
| `/users/{id}` | GET | تفاصيل مستخدم | `users:read` | - | `UserOut` |
| `/users/{id}` | PUT | تحديث مستخدم | `users:update` | `{name?, role?, locale?}` | `UserOut` |
| `/users/{id}` | DELETE | حذف مستخدم | `users:delete` | - | `204 No Content` |

**Schema - UserOut:**
```typescript
{
  id: string (UUID)
  email: string
  name: string
  role: "admin" | "manager" | "auditor" | "user"
  locale: "ar" | "en"
  timezone: string | null
  active: boolean
  created_at: string (ISO 8601)
  updated_at: string (ISO 8601)
}
```

**مثال - إنشاء مستخدم:**
```bash
curl -X POST http://localhost:8000/users \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "auditor@example.com",
    "name": "مدقق جديد",
    "password": "SecurePass123!",
    "role": "auditor",
    "locale": "ar"
  }'
```

---

### 📍 Module 3: Roles & Permissions (`/roles`)

| Endpoint | Method | Description | RBAC | Request | Response |
|----------|--------|-------------|------|---------|----------|
| `/roles` | GET | قائمة الأدوار | `roles:read` | - | `Role[]` |
| `/roles` | POST | إضافة دور | `roles:create` | `{name, permissions[]}` | `Role` |
| `/roles/{id}` | PUT | تحديث صلاحيات | `roles:update` | `{permissions[]}` | `Role` |

**جدول الأدوار الافتراضية:**

| Role | Permissions | Description |
|------|-------------|-------------|
| `admin` | `*:*` (all) | صلاحيات كاملة |
| `manager` | `engagements:*, reports:*, users:read` | إدارة المهام والتقارير |
| `auditor` | `engagements:read, evidence:*, findings:*` | تنفيذ التدقيق |
| `user` | `*:read` (read-only) | عرض البيانات فقط |

---

### 📍 Module 4: Dashboard Statistics (`/dashboard`)

| Endpoint | Method | Description | RBAC | Response |
|----------|--------|-------------|------|----------|
| `/dashboard/stats` | GET | إحصائيات عامة | Protected | `{active_engagements, open_findings, pending_reports, completion_rate}` |
| `/dashboard/engagements-by-status` | GET | توزيع المهام حسب الحالة | Protected | `[{status, count}]` |
| `/dashboard/findings-by-severity` | GET | توزيع النتائج حسب الخطورة | Protected | `[{severity, count}]` |
| `/dashboard/recent-engagements` | GET | أحدث المهام | Protected | `Engagement[]` (last 5) |

**مثال - Dashboard Stats:**
```json
{
  "active_engagements": 12,
  "open_findings": 45,
  "pending_reports": 8,
  "completion_rate": 73.5,
  "period": "current_month"
}
```

**استخدام في Frontend:**
```tsx
// web/app/dashboard/page.tsx
const { data: stats } = useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: () => apiFetch<DashboardStats>('/dashboard/stats')
})
```

---

### 📍 Module 5: Engagements (المهام/المشاريع) (`/engagements`)

| Endpoint | Method | Description | RBAC | Request | Response |
|----------|--------|-------------|------|---------|----------|
| `/engagements` | GET | قائمة المهام | `engagements:read` | `?page=1&size=10&status=IN_PROGRESS` | `PageOut<Engagement>` |
| `/engagements` | POST | إنشاء مهمة | `engagements:create` | `EngagementCreate` | `EngagementOut` |
| `/engagements/{id}` | GET | تفاصيل المهمة | `engagements:read` | - | `EngagementOut` |
| `/engagements/{id}` | PUT | تحديث المهمة | `engagements:update` | `EngagementUpdate` | `EngagementOut` |
| `/engagements/{id}` | DELETE | حذف المهمة | `engagements:delete` | - | `204` |

**Schema - EngagementCreate:**
```typescript
{
  annual_plan_year: number      // السنة (2024, 2025, etc.)
  title: string                 // عنوان المهمة
  scope?: string                // نطاق العمل
  risk_rating?: "low" | "medium" | "high"  // تصنيف المخاطر
  start_date?: string (YYYY-MM-DD)
  end_date?: string (YYYY-MM-DD)
}
```

**Schema - EngagementOut:**
```typescript
{
  id: string (UUID)
  annual_plan_id: string (UUID)
  title: string
  scope: string | null
  risk_rating: "low" | "medium" | "high"
  status: "PLANNING" | "IN_PROGRESS" | "FIELDWORK" | "REPORTING" | "COMPLETED"
  start_date: string | null
  end_date: string | null
  created_at: string (ISO 8601)
}
```

**دورة حياة المهمة (Lifecycle):**
```
PLANNING → IN_PROGRESS → FIELDWORK → REPORTING → COMPLETED
   ↓           ↓            ↓           ↓
CANCELLED ← ← ← ← ← ← ← ← ← ← ← ← (في أي مرحلة)
```

**مثال - إنشاء مهمة:**
```bash
curl -X POST http://localhost:8000/engagements \
  -H "Authorization: Bearer {token}" \
  -d '{
    "annual_plan_year": 2025,
    "title": "تدقيق الحسابات الدورية",
    "scope": "مراجعة العمليات المالية للربع الأول",
    "risk_rating": "medium",
    "start_date": "2025-01-01",
    "end_date": "2025-03-31"
  }'
```

---

### 📍 Module 6: Checklists (قوائم التحقق) (`/checklists`)

| Endpoint | Method | Description | RBAC | Request | Response |
|----------|--------|-------------|------|---------|----------|
| `/checklists` | GET | قائمة Checklists | `checklists:read` | - | `ChecklistOut[]` |
| `/checklists` | POST | إنشاء Checklist | `checklists:create` | `ChecklistCreate` | `ChecklistOut` |
| `/checklists/{id}` | GET | تفاصيل Checklist | `checklists:read` | - | `ChecklistOut` |
| `/checklists/{id}/items` | POST | إضافة بند | `checklists:update` | `ChecklistItemCreate` | `ChecklistItem` |

**الغرض:** قوالب قابلة لإعادة الاستخدام لعمليات التدقيق
**الاستخدام:** ربط Checklist بـ Engagement لتتبع التقدم

---

### 📍 Module 7: Evidence (الأدلة/الوثائق) (`/evidence`)

| Endpoint | Method | Description | RBAC | Request | Response |
|----------|--------|-------------|------|---------|----------|
| `/evidence` | GET | قائمة الأدلة | `evidence:read` | `?engagement_id={uuid}` | `EvidenceOut[]` |
| `/evidence/init` | POST | بدء رفع ملف | `evidence:create` | `{filename, engagement_id}` | `{presigned_url, evidence_id}` |
| `/evidence/{id}/confirm` | POST | تأكيد الرفع | `evidence:create` | - | `EvidenceOut` |
| `/evidence/{id}/download` | GET | تحميل ملف | `evidence:read` | - | Redirect to presigned URL |
| `/evidence/{id}` | DELETE | حذف دليل | `evidence:delete` | - | `204` |

**Storage:** MinIO/S3 (Object Storage)
**Flow:**
1. Frontend يطلب `init` → يحصل على `presigned_url`
2. Frontend يرفع الملف مباشرة إلى MinIO
3. Frontend يستدعي `confirm` لتسجيل الملف في DB

**مثال - Upload Flow:**
```typescript
// 1. Initialize upload
const initRes = await apiFetch('/evidence/init', {
  method: 'POST',
  body: JSON.stringify({
    filename: 'invoice.pdf',
    engagement_id: '...'
  })
})

// 2. Upload file to MinIO
await fetch(initRes.presigned_url, {
  method: 'PUT',
  body: fileBlob
})

// 3. Confirm upload
await apiFetch(`/evidence/${initRes.evidence_id}/confirm`, {
  method: 'POST'
})
```

---

### 📍 Module 8: Reports (التقارير) (`/reports`)

| Endpoint | Method | Description | RBAC | Request | Response |
|----------|--------|-------------|------|---------|----------|
| `/reports` | GET | قائمة التقارير | `reports:read` | `?page=1&size=10&status=DRAFT` | `PageOut<Report>` |
| `/reports` | POST | إنشاء تقرير | `reports:create` | `ReportCreate` | `ReportOut` |
| `/reports/{id}` | GET | تفاصيل التقرير | `reports:read` | - | `ReportOut` |
| `/reports/{id}` | PUT | تحديث التقرير | `reports:update` | `ReportUpdate` | `ReportOut` |
| `/reports/{id}/submit` | POST | تقديم للمراجعة | `reports:update` | - | `ReportActionOut` |
| `/reports/{id}/approve` | POST | اعتماد التقرير | `reports:approve` | `{approved_by}` | `ReportActionOut` |
| `/reports/{id}/publish` | POST | نشر التقرير | `reports:publish` | - | `ReportOut` |

**حالات التقرير (Status):**
```
DRAFT → SUBMITTED → REVIEWED → APPROVED → PUBLISHED
  ↓         ↓          ↓
REJECTED ← ← ← (يعود إلى DRAFT)
```

**Workflow:**
1. Auditor ينشئ تقرير (DRAFT)
2. Auditor يكمل المحتوى ويضغط Submit (SUBMITTED)
3. Manager يراجع ويوافق/يرفض (REVIEWED → APPROVED/REJECTED)
4. Admin ينشر التقرير (PUBLISHED)

---

### 📍 Module 9: AI Lab (مختبر الذكاء الاصطناعي) (`/ai`)

#### 9.1 OCR & Text Extraction
| Endpoint | Method | Description | RBAC | Request | Response |
|----------|--------|-------------|------|---------|----------|
| `/ai/ocr` | POST | استخراج نص من صورة | `ai:use` | `{image_base64}` | `{text, confidence}` |

#### 9.2 Legal Matcher (مقارنة الأنظمة)
| Endpoint | Method | Description | RBAC | Request | Response |
|----------|--------|-------------|------|---------|----------|
| `/ai/regulations` | POST | رفع نظام/تشريع | `ai:admin` | `{title, text}` | `{regulation_id}` |
| `/ai/regulations` | GET | قائمة الأنظمة | `ai:use` | - | `Regulation[]` |
| `/ai/scenarios` | POST | رفع سيناريو للمقارنة | `ai:use` | `{title, description}` | `{scenario_id}` |
| `/ai/scenarios` | GET | قائمة السيناريوهات | `ai:use` | - | `Scenario[]` |
| `/ai/compare` | POST | مقارنة سيناريو بنظام | `ai:use` | `{scenario_id, regulation_id}` | `{matches[], score}` |
| `/ai/findings` | GET | نتائج المقارنة | `ai:use` | `?scenario_id={id}` | `Finding[]` |

**تقنية:** Sentence Transformers + Vector Similarity
**الغرض:** التحقق من امتثال الممارسات للأنظمة واللوائح

---

### 📍 Module 10: Notifications (الإشعارات) (`/notifications`)

| Endpoint | Method | Description | RBAC | Request | Response |
|----------|--------|-------------|------|---------|----------|
| `/notifications` | GET | قائمة الإشعارات | Protected | `?unread_only=true` | `PageOut<Notification>` |
| `/notifications` | POST | إرسال إشعار | `notifications:create` | `NotificationCreate` | `NotificationOut` |
| `/notifications/{id}/mark-read` | POST | تمييز كمقروء | Protected | - | `{success: true}` |
| `/notification-channels` | GET | قنوات الإشعارات | `notifications:admin` | - | `Channel[]` |

**قنوات الإشعارات:**
- `in_app`: داخل المنصة (الافتراضي)
- `email`: بريد إلكتروني
- `sms`: رسائل نصية (مستقبلي)
- `push`: إشعارات push (مستقبلي)

---

### 📍 Module 11: Audit Log (سجل التدقيق) (`/audit`)

| Endpoint | Method | Description | RBAC | Request | Response |
|----------|--------|-------------|------|---------|----------|
| `/audit-logs` | GET | سجل الأحداث | `audit:read` | `?user_id=&action=&from=&to=` | `PageOut<AuditLog>` |

**ما يتم تسجيله:**
- ✅ تسجيل الدخول/الخروج
- ✅ إنشاء/تعديل/حذف المستخدمين
- ✅ إنشاء/تعديل المهام
- ✅ رفع/حذف الأدلة
- ✅ تغيير حالة التقارير
- ✅ تعديل الصلاحيات

**Schema - AuditLog:**
```typescript
{
  id: string (UUID)
  user_id: string (UUID)
  action: string              // "login", "create_user", "delete_evidence", etc.
  resource_type: string       // "user", "engagement", "report", etc.
  resource_id: string | null  // UUID of affected resource
  details: object | null      // Additional metadata
  ip_address: string | null
  user_agent: string | null
  created_at: string (ISO 8601)
}
```

---

### 📍 Module 12: Manager Operations (`/manager`)

| Endpoint | Method | Description | RBAC | Request | Response |
|----------|--------|-------------|------|---------|----------|
| `/manager/engagements/{id}/assign` | POST | تعيين مدقق لمهمة | `manager` | `{auditor_id}` | `Assignment` |
| `/manager/engagements/{id}/assign` | DELETE | إلغاء تعيين | `manager` | - | `{success: true}` |
| `/manager/findings/by-engagement` | GET | النتائج حسب المهمة | `manager` | - | `{[engagement_id]: Finding[]}` |

---

### 📍 Module 13: Auditor Operations (`/auditor`)

| Endpoint | Method | Description | RBAC | Request | Response |
|----------|--------|-------------|------|---------|----------|
| `/auditor/my-engagements` | GET | مهامي المعينة | `auditor` | - | `Engagement[]` |
| `/auditor/findings` | POST | إضافة نتيجة | `auditor` | `FindingCreate` | `FindingOut` |
| `/auditor/working-papers` | POST | إنشاء ورقة عمل | `auditor` | `WPCreate` | `WPOut` |

---

### 📍 Module 14: Working Papers (أوراق العمل) (`/wp`)

| Endpoint | Method | Description | RBAC | Request | Response |
|----------|--------|-------------|------|---------|----------|
| `/wp` | GET | قائمة أوراق العمل | `wp:read` | `?engagement_id={uuid}` | `PageOut<WP>` |
| `/wp` | POST | إنشاء ورقة عمل | `wp:create` | `WPCreate` | `WPOut` |
| `/wp/{id}` | PATCH | تحديث ورقة عمل | `wp:update` | `WPUpdate` | `WPOut` |
| `/wp/{id}` | DELETE | حذف ورقة عمل | `wp:delete` | - | `204` |

**Schema - WorkingPaper:**
```typescript
{
  id: string
  engagement_id: string
  title: string
  content: string           // JSON/Markdown
  version: number
  status: "draft" | "final"
  created_by: string
  created_at: string
  updated_at: string
}
```

---

### 📍 Module 15: Samples (العينات) (`/samples`)

| Endpoint | Method | Description | RBAC | Request | Response |
|----------|--------|-------------|------|---------|----------|
| `/samples` | GET | قائمة العينات | `samples:read` | `?engagement_id={uuid}` | `PageOut<Sample>` |
| `/samples` | POST | إنشاء عينة | `samples:create` | `SampleCreate` | `SampleOut` |
| `/samples/{id}` | PATCH | تحديث نتيجة العينة | `samples:update` | `{result, notes}` | `SampleOut` |
| `/samples/{id}` | DELETE | حذف عينة | `samples:delete` | - | `204` |

**الغرض:** إدارة عينات الاختبار (Sampling) في عمليات التدقيق

---

### 📍 Module 16: Follow-ups (المتابعات) (`/followups`)

| Endpoint | Method | Description | RBAC | Request | Response |
|----------|--------|-------------|------|---------|----------|
| `/followups` | GET | قائمة المتابعات | `followups:read` | `?status=open` | `PageOut<Followup>` |
| `/followups` | POST | إنشاء متابعة | `followups:create` | `FollowupCreate` | `FollowupOut` |
| `/followups/{id}` | PATCH | تحديث حالة | `followups:update` | `{status, notes}` | `FollowupOut` |
| `/followups/management-response` | POST | رد الإدارة | `manager` | `{followup_id, response}` | `ResponseOut` |
| `/followups/tests` | POST | تسجيل اختبار متابعة | `auditor` | `TestCreate` | `TestOut` |

**حالات المتابعة:**
```
OPEN → IN_PROGRESS → MANAGEMENT_RESPONSE → VERIFIED → CLOSED
  ↓
ESCALATED (إذا لم يتم الرد في الوقت المحدد)
```

---

## 🔗 ربط Backend مع Frontend - API Integration

### Frontend Structure (E:\PROGRAMS\AuditOrbit\web)

```
web/
├── app/
│   ├── admin/                # صفحات الإدارة
│   │   ├── users/           # إدارة المستخدمين
│   │   ├── roles/           # إدارة الأدوار
│   │   ├── engagements/     # إدارة المهام
│   │   ├── checklists/      # إدارة القوائم
│   │   ├── evidence/        # إدارة الأدلة
│   │   ├── reports/         # إدارة التقارير
│   │   ├── notifications/   # إدارة الإشعارات
│   │   ├── audit-log/       # سجل التدقيق
│   │   └── ai-lab/          # مختبر AI
│   ├── manager/             # صفحات المدير
│   ├── auditor/             # صفحات المدقق
│   ├── dashboard/           # لوحة المعلومات
│   └── login/               # تسجيل الدخول
├── components/              # مكونات قابلة لإعادة الاستخدام
└── lib/
    ├── api-client.ts        # API Client (fetch wrapper)
    └── types.gen.ts         # TypeScript types
```

### API Client Implementation

```typescript
// lib/api-client.ts

export class TokenManager {
  static getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  }
  
  static setTokens(access: string, refresh: string) {
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
  }
  
  static clearTokens() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
}

export async function apiFetch<T>(
  path: string, 
  init: RequestInit = {}
): Promise<T> {
  const token = TokenManager.getToken()
  const headers = new Headers(init.headers)
  
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000'
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store'
  })
  
  if (!response.ok) {
    if (response.status === 401) {
      TokenManager.clearTokens()
      window.location.href = '/login'
    }
    throw new Error(await response.text())
  }
  
  return response.json()
}
```

### Example: Login Page Integration

```tsx
// app/login/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch, TokenManager } from '@/lib/api-client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const res = await apiFetch<{
        access_token: string
        refresh_token: string
        user: { role: string }
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
      
      TokenManager.setTokens(res.access_token, res.refresh_token)
      
      // Redirect based on role
      if (res.user.role === 'admin') {
        router.push('/admin')
      } else if (res.user.role === 'manager') {
        router.push('/manager')
      } else if (res.user.role === 'auditor') {
        router.push('/auditor')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('خطأ في البريد الإلكتروني أو كلمة المرور')
    }
  }
  
  return (
    <form onSubmit={handleLogin}>
      {/* UI components */}
    </form>
  )
}
```

### Example: Engagements List

```tsx
// app/admin/engagements/page.tsx

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-client'

type Engagement = {
  id: string
  title: string
  status: string
  start_date: string
  end_date: string
}

export default function EngagementsPage() {
  const queryClient = useQueryClient()
  
  // Fetch engagements
  const { data, isLoading } = useQuery({
    queryKey: ['engagements', { page: 1, size: 10 }],
    queryFn: () => apiFetch<{
      items: Engagement[]
      total: number
    }>('/engagements?page=1&size=10')
  })
  
  // Create engagement mutation
  const createMutation = useMutation({
    mutationFn: (payload: {
      annual_plan_year: number
      title: string
      risk_rating: string
    }) => apiFetch('/engagements', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engagements'] })
    }
  })
  
  return (
    <div>
      {isLoading ? (
        <div>جاري التحميل...</div>
      ) : (
        <div>
          {data?.items.map(eng => (
            <div key={eng.id}>
              <h3>{eng.title}</h3>
              <span>{eng.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 🛡️ صلاحيات الأدمن - Admin Permissions

### Admin Dashboard (`/admin`)

**الصفحات المتاحة للأدمن:**

1. **إدارة المستخدمين** (`/admin/users`)
   - عرض جميع المستخدمين
   - إضافة مستخدم جديد
   - تعديل بيانات المستخدمين
   - تعيين الأدوار
   - تفعيل/تعطيل الحسابات
   - **API:** `/users` (GET, POST, PUT, DELETE)

2. **إدارة الأدوار** (`/admin/roles`)
   - عرض جميع الأدوار
   - إنشاء أدوار مخصصة
   - تعديل الصلاحيات لكل دور
   - **API:** `/roles` (GET, POST, PUT)

3. **إدارة المهام** (`/admin/engagements`)
   - عرض جميع المهام (كل الحالات)
   - إنشاء مهمة جديدة
   - تعديل أي مهمة
   - حذف المهام
   - تعيين المدققين للمهام
   - **API:** `/engagements`, `/manager/engagements/{id}/assign`

4. **إدارة القوائم** (`/admin/checklists`)
   - إنشاء قوالب Checklist
   - تعديل البنود
   - ربط القوائم بالمهام
   - **API:** `/checklists`

5. **إدارة الأدلة** (`/admin/evidence`)
   - عرض جميع الأدلة المرفوعة
   - تحميل/حذف أي دليل
   - إدارة MinIO Storage
   - **API:** `/evidence`

6. **إدارة التقارير** (`/admin/reports`)
   - عرض جميع التقارير
   - مراجعة التقارير
   - اعتماد التقارير
   - نشر التقارير
   - **API:** `/reports`, `/reports/{id}/approve`, `/reports/{id}/publish`

7. **إدارة الإشعارات** (`/admin/notifications`)
   - إرسال إشعارات للمستخدمين
   - إدارة قنوات الإشعارات
   - جدولة الإشعارات
   - **API:** `/notifications`, `/notification-channels`

8. **سجل التدقيق** (`/admin/audit-log`)
   - عرض جميع الأحداث
   - تصفية حسب المستخدم/الإجراء/التاريخ
   - تصدير السجلات
   - **API:** `/audit-logs`

9. **مختبر الذكاء الاصطناعي** (`/admin/ai-lab`)
   - رفع الأنظمة واللوائح
   - إدارة السيناريوهات
   - تشغيل المقارنات
   - عرض النتائج
   - **API:** `/ai/regulations`, `/ai/scenarios`, `/ai/compare`

### Admin Role Definition

```sql
-- في قاعدة البيانات
INSERT INTO roles (id, name, description) VALUES
  (uuid_generate_v4(), 'admin', 'مدير النظام - صلاحيات كاملة');

INSERT INTO permissions (role_id, resource, action) VALUES
  ((SELECT id FROM roles WHERE name = 'admin'), '*', '*');
```

**RBAC Middleware:**
```python
# api/app/infrastructure/security/rbac.py

def enforce(db: Session, user_id: str, resource: str, action: str):
    # Check if user has admin role
    user_role = db.execute(
        text("SELECT r.name FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON ur.role_id = r.id WHERE u.id = :user_id"),
        {"user_id": user_id}
    ).scalar_one_or_none()
    
    if user_role == 'admin':
        return  # Admin has all permissions
    
    # Check specific permission
    has_permission = db.execute(
        text("SELECT 1 FROM permissions p JOIN user_roles ur ON p.role_id = ur.role_id WHERE ur.user_id = :user_id AND p.resource = :resource AND p.action = :action"),
        {"user_id": user_id, "resource": resource, "action": action}
    ).scalar_one_or_none()
    
    if not has_permission:
        raise HTTPException(status_code=403, detail="Forbidden")
```

---

## 📊 Database Schema - جداول قاعدة البيانات

### جدول Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  locale VARCHAR(10) DEFAULT 'ar',
  tz VARCHAR(50),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### جدول Roles
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### جدول User_Roles (Many-to-Many)
```sql
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);
```

### جدول Permissions
```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  resource VARCHAR(50) NOT NULL,  -- 'users', 'engagements', 'reports', '*'
  action VARCHAR(50) NOT NULL,    -- 'read', 'create', 'update', 'delete', '*'
  UNIQUE (role_id, resource, action)
);
```

### جدول Engagements
```sql
CREATE TABLE engagements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  annual_plan_id UUID REFERENCES annual_plans(id),
  title VARCHAR(500) NOT NULL,
  scope TEXT,
  risk_rating VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'PLANNING',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### جدول Evidence
```sql
CREATE TABLE evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  engagement_id UUID REFERENCES engagements(id) ON DELETE CASCADE,
  filename VARCHAR(500) NOT NULL,
  file_path VARCHAR(1000) NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  uploaded_by UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### جدول Reports
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  engagement_id UUID REFERENCES engagements(id),
  title VARCHAR(500) NOT NULL,
  content JSONB,
  version INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'DRAFT',
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### جدول Audit_Logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔧 Middleware & Security

### 1. Rate Limiting
```python
# api/app/presentation/middlewares/rate_limit.py

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# Usage in endpoints:
@router.post("/login")
@limiter.limit("5/minute")  # Max 5 attempts per minute
def login(...):
    pass
```

### 2. Security Headers
```python
# api/app/presentation/middlewares/security.py

class SecurityHeadersMiddleware:
    async def __call__(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000"
        return response
```

### 3. CORS Configuration
```python
# api/app/presentation/main.py

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 4. Exception Handling
```python
# api/app/infrastructure/exception_handlers.py

def setup_exception_handlers(app: FastAPI):
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request, exc):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )
    
    @app.exception_handler(Exception)
    async def generic_exception_handler(request, exc):
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error"}
        )
```

---

## 📈 Performance Optimization

### 1. Database Indexing
```sql
-- Indexes للأداء الأفضل
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_engagements_status ON engagements(status);
CREATE INDEX idx_evidence_engagement_id ON evidence(engagement_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

### 2. Query Optimization
```python
# استخدام pagination دائماً
@router.get("/engagements")
def list_engagements(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100)
):
    offset = (page - 1) * size
    # OFFSET/LIMIT للتحكم في حجم النتائج
```

### 3. Caching (مستقبلي)
```python
# استخدام Redis للـ caching
from redis import Redis

redis_client = Redis(host='localhost', port=6379)

@router.get("/dashboard/stats")
def get_stats(db: Session = Depends(get_db)):
    cache_key = "dashboard:stats"
    cached = redis_client.get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    stats = calculate_stats(db)
    redis_client.setex(cache_key, 300, json.dumps(stats))  # Cache for 5 minutes
    return stats
```

---

## 🧪 Testing

### API Testing with Swagger
```
http://localhost:8000/docs
```

**ميزات Swagger UI:**
- ✅ اختبار جميع endpoints مباشرة
- ✅ عرض schemas و examples
- ✅ تجربة authentication
- ✅ عرض response codes

### Example Test Script
```python
# api/tests/test_auth.py

import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_login_success():
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.post("/auth/login", json={
            "email": "admin@example.com",
            "password": "Admin#2025"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data

@pytest.mark.asyncio
async def test_login_wrong_password():
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.post("/auth/login", json={
            "email": "admin@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
```

---

## 📝 API Response Standards

### Success Response
```json
{
  "data": {...},
  "status": "success"
}
```

### Error Response
```json
{
  "detail": "رسالة الخطأ بالعربية",
  "status": "error",
  "code": "ERROR_CODE"
}
```

### Pagination Response
```json
{
  "items": [...],
  "page": 1,
  "size": 10,
  "total": 156,
  "pages": 16
}
```

---

## 🚀 Deployment Checklist

### البيئة Production
- [ ] تغيير `DEBUG = False`
- [ ] إزالة CORS wildcard (`*`)
- [ ] تفعيل HTTPS
- [ ] تفعيل Rate Limiting
- [ ] إضافة Monitoring (Sentry, DataDog)
- [ ] Backup Database يومي
- [ ] استخدام Environment Variables للـ secrets
- [ ] إعداد Load Balancer
- [ ] إعداد CDN للملفات الثابتة

---

## 📞 Support & Maintenance

**التحديثات المستقبلية:**
- 🔄 Alembic migrations للتغييرات في DB
- 📊 إضافة Analytics و Reporting
- 🔔 تحسين نظام الإشعارات (WebSockets)
- 🤖 توسيع مختبر AI
- 📱 تطوير Mobile App

---

**تاريخ المراجعة:** 29 أكتوبر 2025  
**الإصدار:** 0.2.0  
**المراجع:** مبرمج خبير 10+ سنوات  

