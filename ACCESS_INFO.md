# 🚀 AuditOrbit - معلومات الوصول والتشغيل

## ✅ حالة المشروع: يعمل!

---

## 🌐 الروابط المتاحة

### 📱 Frontend (Next.js)
- **الصفحة الرئيسية**: http://localhost:3000
- **لوحة الإدارة**: http://localhost:3000/admin
- **مساحة المدير**: http://localhost:3000/manager
- **مساحة المراجع**: http://localhost:3000/auditor
- **تسجيل الدخول**: http://localhost:3000/auth/sign-in

### 📊 الصفحات الجديدة (Phase 11)
- **الإشعارات**: http://localhost:3000/admin/notifications
- **سجل التدقيق**: http://localhost:3000/admin/audit-log

### 🔧 Backend API (FastAPI)
- **API Base**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

---

## 🔑 معلومات تسجيل الدخول

### 👨‍💼 حساب المدير (Admin)
```
Email:    admin@example.com
Password: Admin#2025
```
**الصلاحيات**: وصول كامل لجميع الأنظمة

### 👔 حساب مدير التدقيق (IA Manager)
```
Email:    manager@example.com
Password: Manager#2025
```
**الصلاحيات**: إدارة المهام، التقارير، الإشعارات

### 🔍 حساب المراجع (Auditor)
```
Email:    auditor@example.com
Password: Auditor#2025
```
**الصلاحيات**: تنفيذ المهام، تحديث قوائم المراجعة

---

## 🗄️ خدمات Backend

### PostgreSQL Database
```
Host:     localhost:5432
Database: auditdb
User:     audit
Password: auditpw
```

### MinIO (S3 Storage)
```
Console:  http://localhost:9001
API:      http://localhost:9000
User:     minioadmin
Password: minioadmin
```

### Redis Cache
```
Host:     localhost:6379
Port:     6379
```

---

## 🎯 الميزات المتاحة

### Phase 10B - Auditor Workspace ✅
- مساحة عمل المراجع
- إدارة المهام المعينة
- تحديث قوائم المراجعة
- قبول/رفض المهام

### Phase 10C - UI Design System ✅
- مكتبة مكونات متكاملة (Button, Card, Input, Table, Badge, Tabs)
- Dark Mode مع localStorage
- RTL/LTR Toggle
- Design Tokens (CSS Variables)

### Phase 11 - Notifications & Audit Log ✅
- نظام الإشعارات (notifications + channels)
- سجل التدقيق مع الفلاتر
- فهارس محسّنة للأداء
- RBAC Permissions

---

## 🚀 كيفية التشغيل

### تشغيل Backend
```powershell
docker compose -f infra/docker-compose.yml up -d
```

### تشغيل Frontend
```powershell
cd web
pnpm dev
```

### إيقاف الخدمات
```powershell
docker compose -f infra/docker-compose.yml down
```

---

## 📦 التقنيات المستخدمة

### Frontend
- Next.js 14.2
- React Query (TanStack Query)
- Tailwind CSS
- TypeScript

### Backend
- FastAPI 0.2.0
- SQLAlchemy
- PostgreSQL 16
- Alembic (Migrations)

### Infrastructure
- Docker Compose
- Redis
- MinIO (S3)

---

## 🎉 آخر التحديثات

- ✅ Phase 10B: Auditor workspace with RLS
- ✅ Phase 10C: UI Design System (7 components)
- ✅ Phase 11: Notifications + Audit Log
- 🚀 Commit: 247da03
- 📅 Date: October 25, 2025

---

## 📝 ملاحظات

1. **تأكد من تشغيل Docker** قبل استخدام الـ Backend
2. **استخدم Chrome/Edge** للحصول على أفضل تجربة
3. **Dark Mode** متاح في الـ Navbar (أيقونة القمر)
4. **RTL/LTR** يمكن التبديل من الـ Navbar (أيقونة اللغة)

---

تم إنشاء هذا الملف تلقائياً 🤖
