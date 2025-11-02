# 📊 تقرير تطبيق AuditOrbit - شامل

**تاريخ التقرير:** 2 نوفمبر 2025  
**حالة التطبيق:** ✅ قيد التشغيل  
**الإصدار:** 1.0.0

---

## 📑 فهرس المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [بنية التطبيق](#بنية-التطبيق)
3. [الخدمات والمنافذ](#الخدمات-والمنافذ)
4. [الحسابات والمستخدمين](#الحسابات-والمستخدمين)
5. [الأدوار والصلاحيات](#الأدوار-والصلاحيات)
6. [صفحات التطبيق](#صفحات-التطبيق)
7. [قاعدة البيانات](#قاعدة-البيانات)
8. [API Endpoints](#api-endpoints)
9. [التكوينات](#التكوينات)
10. [تعليمات التشغيل](#تعليمات-التشغيل)

---

## 🎯 نظرة عامة

**AuditOrbit** هو نظام متكامل لإدارة التدقيق والمراجعة يتضمن:

- ✅ نظام إدارة المستخدمين والصلاحيات (RBAC)
- ✅ إدارة المشاريع التدقيقية (Engagements)
- ✅ قوائم التدقيق (Checklists)
- ✅ إدارة الأدلة والوثائق
- ✅ التقارير والموافقات
- ✅ نظام الإشعارات
- ✅ سجل التدقيق الكامل
- ✅ خدمة الذكاء الاصطناعي
- ✅ لوحة تحكم العمليات التقنية (Ops Console)

---

## 🏗️ بنية التطبيق

### التقنيات المستخدمة:

#### **Frontend:**
- **Framework:** Next.js 15.0.3
- **Language:** TypeScript 5.x
- **UI Library:** React 19.2.0
- **Styling:** Tailwind CSS 4.x
- **Components:** Radix UI
- **State Management:** TanStack Query 5.90.5
- **Forms:** React Hook Form + Zod

#### **Backend:**
- **Framework:** FastAPI 0.115.6
- **Language:** Python 3.12
- **ORM:** SQLAlchemy 2.0.36
- **Database:** PostgreSQL 16
- **Authentication:** JWT (python-jose)
- **Password Hashing:** bcrypt 4.2.1
- **Migrations:** Alembic 1.14.0

#### **Infrastructure:**
- **Database:** PostgreSQL 16 (Alpine)
- **Cache:** Redis 7 (Alpine)
- **Storage:** MinIO (S3-compatible)
- **Task Queue:** RQ (Redis Queue)
- **Containerization:** Docker & Docker Compose

---

## 🌐 الخدمات والمنافذ

| **الخدمة** | **المنفذ** | **الوصول** | **الحالة** |
|------------|-----------|------------|-----------|
| Frontend (Next.js) | 3000 | http://localhost:3000 | ✅ يعمل |
| Backend API (FastAPI) | 8000 | http://localhost:8000 | ✅ يعمل |
| API Documentation | 8000 | http://localhost:8000/docs | ✅ متاح |
| PostgreSQL Database | 5432 | localhost:5432 | ✅ صحي |
| Redis Cache | 6379 | localhost:6379 | ✅ يعمل |
| MinIO Storage | 9000 | http://localhost:9000 | ✅ يعمل |
| MinIO Console | 9001 | http://localhost:9001 | ✅ متاح |
| AI Worker | - | داخلي | ✅ يعمل |

### معلومات الاتصال:

```env
DATABASE_URL=postgresql+psycopg://audit:auditpw@db:5432/auditdb
REDIS_URL=redis://redis:6379/0
S3_ENDPOINT=http://minio:9000
S3_BUCKET=auditevidence
JWT_SECRET=devsecret
WEB_ORIGIN=http://localhost:3000
```

---

## 👥 الحسابات والمستخدمين

### الحساب الافتراضي (Admin):

| **الحقل** | **القيمة** |
|-----------|-----------|
| **البريد الإلكتروني** | `admin@example.com` |
| **كلمة المرور** | `Admin#2025` |
| **الاسم** | Admin |
| **الدور** | Admin |
| **الحالة** | نشط (active: true) |
| **المنطقة الزمنية** | Asia/Qatar |
| **اللغة** | ar (العربية) |

### إنشاء مستخدمين جدد:

يمكن إنشاء مستخدمين جدد من خلال:
1. الواجهة: `/admin/users`
2. API: `POST /api/users`

---

## 🎭 الأدوار والصلاحيات

### ملخص الأدوار:

| **الدور** | **ID** | **عدد الصلاحيات** | **الوصف** |
|-----------|--------|-------------------|----------|
| **Admin** | 1 | 30 | مدير النظام - وصول كامل |
| **Manager** | 2 | 10 | مدير المشاريع |
| **Auditor** | 3 | 6 | المدقق - تنفيذ المهام |

### تفاصيل صلاحيات كل دور:

#### 1. **Admin (30 صلاحية):**

**إدارة المستخدمين:**
- `users:read` - عرض المستخدمين
- `users:write` - إضافة/تعديل المستخدمين
- `users:delete` - حذف المستخدمين

**إدارة الأدوار:**
- `roles:read` - عرض الأدوار
- `roles:write` - إدارة الأدوار والصلاحيات

**إدارة المشاريع:**
- `engagements:read` - عرض المشاريع
- `engagements:write` - إنشاء/تعديل المشاريع
- `engagements:delete` - حذف المشاريع

**إدارة قوائم التدقيق:**
- `checklists:read`
- `checklists:write`
- `checklists:delete`

**إدارة الأدلة:**
- `evidence:read`
- `evidence:write`
- `evidence:delete`

**التقارير والموافقات:**
- `reports:read`
- `reports:write`
- `reports:approve`

**النظام:**
- `audit_logs:read` - عرض سجل التدقيق
- `notifications:read`
- `notifications:write`
- `settings:read`
- `settings:write`

**Ops Console:**
- `ops:full_access` - الوصول الكامل لإدارة النظام

#### 2. **Manager (10 صلاحيات):**

- `engagements:read`
- `engagements:write`
- `reports:read`
- `reports:write`
- `reports:approve`
- `findings:read`
- `findings:write`
- `checklists:read`
- `evidence:read`
- `users:read`

#### 3. **Auditor (6 صلاحيات):**

- `engagements:read`
- `checklists:read`
- `checklists:execute`
- `evidence:read`
- `evidence:write`
- `tasks:execute`

---

## 📄 صفحات التطبيق

### 🔓 الصفحات العامة (Public Routes):

```
/                          - الصفحة الرئيسية
/login                     - تسجيل الدخول
```

### 🔴 Admin فقط:

#### لوحة الإدارة:
```
/admin                     - لوحة تحكم المدير
/admin/users               - إدارة المستخدمين
/admin/roles               - إدارة الأدوار والصلاحيات
/admin/engagements         - إدارة المشاريع التدقيقية
/admin/checklists          - إدارة قوائم التدقيق
/admin/evidence            - إدارة الأدلة والمستندات
/admin/reports             - التقارير الإدارية
/admin/notifications       - إدارة الإشعارات
/admin/audit-log           - سجل التدقيق الكامل
/admin/ai-lab              - مختبر الذكاء الاصطناعي
```

#### Ops Console (العمليات التقنية):
```
/ops                       - نظرة عامة على حالة النظام
/ops/api                   - مستكشف API
/ops/ai                    - إدارة خدمة الذكاء الاصطناعي
/ops/storage               - إدارة التخزين (MinIO/S3)
/ops/logs                  - سجلات النظام
/ops/settings              - إعدادات النظام
```

### 🟠 Admin + Manager:

```
/manager                   - لوحة تحكم المدير
/manager/engagements       - إدارة المشاريع
/manager/findings          - النتائج والملاحظات
/manager/reports           - التقارير
```

### 🟢 Admin + Manager + Auditor:

```
/auditor                   - لوحة تحكم المدقق
/auditor/tasks             - المهام المعينة
/auditor/checklists        - قوائم التدقيق للتنفيذ
/auditor/archive           - الأرشيف والمهام المكتملة
```

### 🔵 جميع المستخدمين:

```
/dashboard                 - لوحة التحكم الرئيسية
/debug-token               - فحص Token (للتطوير)
```

---

## 🗄️ قاعدة البيانات

### اسم قاعدة البيانات:
- **Database:** `auditdb`
- **User:** `audit`
- **Password:** `auditpw`
- **Host:** `localhost`
- **Port:** `5432`

### الجداول الرئيسية:

#### جداول المصادقة والصلاحيات:
1. **users** - المستخدمين
   - الأعمدة: id, email, name, hashed_password, locale, tz, active, created_at

2. **roles** - الأدوار
   - الأعمدة: id, name

3. **permissions** - الصلاحيات
   - الأعمدة: id, name, resource, action

4. **user_roles** - ربط المستخدمين بالأدوار
   - الأعمدة: user_id, role_id

5. **role_permissions** - ربط الأدوار بالصلاحيات
   - الأعمدة: role_id, perm_id

#### جداول التدقيق:
6. **annual_plans** - الخطط السنوية
7. **engagements** - المشاريع التدقيقية
8. **engagement_assignments** - تعيين المدققين للمشاريع
9. **checklists** - قوائم التدقيق
10. **checklist_items** - بنود قوائم التدقيق
11. **evidence** - الأدلة والمستندات
12. **reports** - التقارير
13. **report_approvals** - موافقات التقارير
14. **findings** - النتائج والملاحظات
15. **follow_ups** - المتابعات
16. **follow_up_tests** - اختبارات المتابعة
17. **notifications** - الإشعارات
18. **audit_logs** - سجل التدقيق الكامل

#### جداول إضافية:
19. **working_papers** - أوراق العمل
20. **samples** - العينات
21. **regulations** - اللوائح والتشريعات
22. **scenarios** - السيناريوهات

### Migration Files (Alembic):

```
0001_auth_rbac_audit.py              - المصادقة والصلاحيات
0002_seed_core.py                    - البيانات الأولية
0003_planning_engagements.py         - التخطيط والمشاريع
0004_checklists_dispatch.py          - قوائم التدقيق
0005_evidence_and_extractions.py     - الأدلة
0006_regs_scenarios_findings.py      - اللوائح والنتائج
0007_reports_and_approvals.py        - التقارير
0008_notifications.py                - الإشعارات
0009_followups.py                    - المتابعات
0010_working_papers_and_samples.py   - أوراق العمل
0011_wp_samples_crud_and_indexes.py  - الفهارس
0012_req_cols_rbac.py                - أعمدة إضافية
```

---

## 🔌 API Endpoints

### المصادقة (Authentication):
```
POST   /api/auth/login          - تسجيل الدخول
POST   /api/auth/logout         - تسجيل الخروج
GET    /api/auth/me             - معلومات المستخدم الحالي
POST   /api/auth/refresh        - تجديد Token
```

### المستخدمين (Users):
```
GET    /api/users               - قائمة المستخدمين
POST   /api/users               - إضافة مستخدم جديد
GET    /api/users/{id}          - تفاصيل مستخدم
PUT    /api/users/{id}          - تحديث مستخدم
DELETE /api/users/{id}          - حذف مستخدم
```

### المشاريع (Engagements):
```
GET    /api/engagements         - قائمة المشاريع
POST   /api/engagements         - إنشاء مشروع
GET    /api/engagements/{id}    - تفاصيل مشروع
PUT    /api/engagements/{id}    - تحديث مشروع
DELETE /api/engagements/{id}    - حذف مشروع
```

### قوائم التدقيق (Checklists):
```
GET    /api/checklists          - قائمة القوائم
POST   /api/checklists          - إنشاء قائمة
GET    /api/checklists/{id}     - تفاصيل قائمة
PUT    /api/checklists/{id}     - تحديث قائمة
DELETE /api/checklists/{id}     - حذف قائمة
```

### الأدلة (Evidence):
```
GET    /api/evidence            - قائمة الأدلة
POST   /api/evidence            - رفع دليل
GET    /api/evidence/{id}       - تفاصيل دليل
DELETE /api/evidence/{id}       - حذف دليل
```

### التقارير (Reports):
```
GET    /api/reports             - قائمة التقارير
POST   /api/reports             - إنشاء تقرير
GET    /api/reports/{id}        - تفاصيل تقرير
PUT    /api/reports/{id}        - تحديث تقرير
POST   /api/reports/{id}/approve - الموافقة على تقرير
```

### الإشعارات (Notifications):
```
GET    /api/notifications       - قائمة الإشعارات
POST   /api/notifications       - إنشاء إشعار
PUT    /api/notifications/{id}  - تحديث حالة إشعار
```

### Health Check:
```
GET    /health                  - حالة النظام
```

### API Documentation:
```
GET    /docs                    - Swagger UI
GET    /redoc                   - ReDoc
GET    /openapi.json            - OpenAPI Schema
```

---

## ⚙️ التكوينات

### ملف .env:

```env
# Database
DATABASE_URL=postgresql+psycopg://audit:auditpw@db:5432/auditdb
POSTGRES_USER=audit
POSTGRES_PASSWORD=auditpw
POSTGRES_DB=auditdb

# Redis
REDIS_URL=redis://localhost:6379/0

# MinIO/S3
MINIO_ROOT_USER=auditorbit
MINIO_ROOT_PASSWORD=auditorbit123
S3_ENDPOINT=http://minio:9000
S3_BUCKET=auditevidence
S3_ACCESS_KEY=auditorbit
S3_SECRET_KEY=auditorbit123

# JWT
JWT_SECRET=devsecret

# Frontend
NEXT_PUBLIC_API_BASE=http://localhost:8000
WEB_ORIGIN=http://localhost:3000
```

### Frontend (package.json):

```json
{
  "name": "my-v0-project",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "eslint ."
  }
}
```

### Backend (requirements.txt):

```txt
alembic==1.14.0
fastapi==0.115.6
psycopg[binary]>=3.2.10
pydantic-settings==2.6.1
python-dotenv==1.0.1
python-jose[cryptography]==3.3.0
passlib==1.7.4
bcrypt==4.2.1
SQLAlchemy==2.0.36
uvicorn[standard]==0.32.1
email-validator==2.2.0
boto3==1.35.43
redis==5.0.8
rq==1.16.2
pytest==8.3.4
httpx==0.28.1
slowapi==0.1.9
```

---

## 🚀 تعليمات التشغيل

### 1. تشغيل الخدمات الخلفية (Backend Services):

```powershell
cd D:\AuditOrbit\infra
docker-compose up -d
```

**الخدمات التي سيتم تشغيلها:**
- PostgreSQL Database
- Redis Cache
- MinIO Storage
- FastAPI Backend
- AI Worker

### 2. التحقق من حالة الخدمات:

```powershell
docker-compose ps
```

### 3. تشغيل Frontend:

**في Terminal منفصل:**
```powershell
cd D:\AuditOrbit\frontend
pnpm install  # المرة الأولى فقط
pnpm dev
```

### 4. الوصول للتطبيق:

افتح المتصفح على:
- **Frontend:** http://localhost:3000
- **API Docs:** http://localhost:8000/docs

### 5. تسجيل الدخول:

- **البريد:** `admin@example.com`
- **كلمة المرور:** `Admin#2025`

---

## 🔍 الأوامر المفيدة

### Docker:

```powershell
# عرض السجلات
docker-compose logs -f [service_name]

# إعادة تشغيل خدمة
docker-compose restart [service_name]

# إيقاف جميع الخدمات
docker-compose down

# إيقاف وحذف البيانات
docker-compose down -v

# إعادة بناء الصور
docker-compose build
```

### قاعدة البيانات:

```powershell
# الاتصال بقاعدة البيانات
docker exec -it infra-db-1 psql -U audit -d auditdb

# عرض المستخدمين
docker exec infra-db-1 psql -U audit -d auditdb -c "SELECT * FROM users;"

# عرض الأدوار
docker exec infra-db-1 psql -U audit -d auditdb -c "SELECT * FROM roles;"
```

### Frontend:

```powershell
# تثبيت الحزم
pnpm install

# التشغيل (Development)
pnpm dev

# البناء (Production)
pnpm build

# التشغيل (Production)
pnpm start

# فحص الأخطاء
pnpm lint
```

### Backend:

```powershell
# تشغيل Migration جديدة
docker-compose exec api alembic upgrade head

# إنشاء Migration
docker-compose exec api alembic revision -m "description"

# التراجع عن Migration
docker-compose exec api alembic downgrade -1
```

---

## 📊 إحصائيات التطبيق

### حجم المشروع:

- **عدد ملفات Frontend:** 56+ صفحة
- **عدد ملفات Migration:** 12 ملف
- **عدد الجداول:** 22+ جدول
- **عدد الأدوار:** 3 أدوار
- **عدد الصلاحيات:** 30+ صلاحية
- **عدد الحزم (Frontend):** 362 حزمة
- **عدد الحزم (Backend):** 15+ مكتبة أساسية

### Dependencies:

#### Frontend:
- React & Next.js: 19.2.0 / 15.0.3
- TypeScript: 5.x
- Radix UI: 30+ components
- TanStack Query: 5.90.5
- Tailwind CSS: 4.x

#### Backend:
- FastAPI: 0.115.6
- SQLAlchemy: 2.0.36
- Alembic: 1.14.0
- PostgreSQL: 16

---

## 🛡️ الأمان (Security)

### المصادقة:
- ✅ JWT Tokens
- ✅ Password Hashing (bcrypt)
- ✅ Secure Cookies
- ✅ Role-Based Access Control (RBAC)

### الحماية:
- ✅ CORS Configuration
- ✅ Rate Limiting (SlowAPI)
- ✅ SQL Injection Protection (SQLAlchemy ORM)
- ✅ XSS Protection
- ✅ Environment Variables للمعلومات الحساسة

### التدقيق:
- ✅ Audit Logs لجميع العمليات
- ✅ User Activity Tracking
- ✅ Timestamp لجميع السجلات

---

## 📝 ملاحظات مهمة

1. **كلمة المرور الافتراضية** يجب تغييرها بعد أول تسجيل دخول
2. **JWT Secret** في الـ Production يجب أن يكون قوي ومعقد
3. **MinIO** للتطوير - في Production استخدم AWS S3 أو مزود آخر
4. **قاعدة البيانات** يجب عمل نسخ احتياطية دورية
5. **الإشعارات** تحتاج تكوين SMTP للإرسال الفعلي
6. **AI Worker** يحتاج API Keys للخدمات الخارجية

---

## 🔄 الإصدارات القادمة

### الميزات المخطط لها:
- [ ] Multi-tenant Support
- [ ] Advanced Reporting Dashboard
- [ ] Email Notifications
- [ ] Mobile App (React Native)
- [ ] Two-Factor Authentication (2FA)
- [ ] LDAP/Active Directory Integration
- [ ] Advanced AI Features
- [ ] Real-time Collaboration
- [ ] Export to PDF/Excel
- [ ] Calendar Integration

---

## 📞 الدعم والتواصل

للحصول على الدعم أو الإبلاغ عن مشاكل:

- **Repository:** AuditOrbit
- **Owner:** zahermasloub
- **Branch:** master

---

## ✅ قائمة التحقق (Checklist)

### تم إنجازه:
- [x] تثبيت وتشغيل جميع الخدمات
- [x] إصلاح مشاكل Database Migrations
- [x] إنشاء المستخدم الافتراضي
- [x] تكوين الأدوار والصلاحيات
- [x] تشغيل Frontend بنجاح
- [x] اختبار API endpoints
- [x] توثيق كامل للنظام

### قيد العمل:
- [ ] إضافة مستخدمين إضافيين
- [ ] تخصيص الإعدادات
- [ ] رفع بيانات تجريبية

---

**تاريخ آخر تحديث:** 2 نوفمبر 2025  
**الحالة:** ✅ النظام جاهز للاستخدام

---

## 🎉 الخلاصة

تم بنجاح:
1. ✅ تشغيل جميع الخدمات (PostgreSQL, Redis, MinIO, API, AI Worker)
2. ✅ إصلاح جميع مشاكل الـ Migrations
3. ✅ تكوين قاعدة البيانات بالكامل
4. ✅ إنشاء الأدوار والصلاحيات (Admin, Manager, Auditor)
5. ✅ تثبيت Frontend Dependencies (362 حزمة)
6. ✅ تشغيل التطبيق بنجاح

**التطبيق الآن جاهز للاستخدام الكامل!** 🚀
