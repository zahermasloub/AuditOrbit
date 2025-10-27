# 🎯 بطاقة الوصول السريع - AuditOrbit

---

## 🌐 روابط النظام

### Frontend (الواجهة)
```
الصفحة الرئيسية:     http://localhost:3000
صفحة تسجيل الدخول:   http://localhost:3000/login
لوحة التحكم:         http://localhost:3000/dashboard
```

### Backend (API)
```
API الرئيسي:          http://localhost:8000
توثيق API:           http://localhost:8000/docs
OpenAPI Schema:      http://localhost:8000/openapi.json
```

---

## 👤 بيانات تسجيل الدخول

### المدير الرئيسي (Admin)
```
البريد الإلكتروني:   admin@example.com
كلمة المرور:         Admin#2025
الصلاحيات:           جميع الصلاحيات (Full Access)
```

---

## 🗄️ قاعدة البيانات PostgreSQL

```
المضيف:              localhost
المنفذ:               5432
اسم القاعدة:         auditdb
المستخدم:            audit
كلمة المرور:         auditpw
```

**سلسلة الاتصال:**
```
postgresql://audit:auditpw@localhost:5432/auditdb
```

---

## 📦 الخدمات الإضافية

### MinIO (Object Storage)
```
API Endpoint:        http://localhost:9000
Console:             http://localhost:9001
المستخدم:            auditorbit
كلمة المرور:         auditorbit123
Bucket:              auditevidence
```

### Redis (Cache & Queue)
```
المضيف:              localhost:6379
كلمة المرور:         (لا يوجد)
```

---

## 🚀 أوامر التشغيل

### تشغيل Backend
```powershell
cd d:\AuditOrbit\api
D:/AuditOrbit/.venv/Scripts/python.exe -m uvicorn app.presentation.main:app --reload --host 0.0.0.0 --port 8000
```

### تشغيل Frontend
```powershell
cd d:\AuditOrbit\web
pnpm dev
```

---

## 🔧 أوامر الصيانة

### إعادة توليد TypeScript Types
```powershell
cd d:\AuditOrbit\web
npx openapi-typescript http://localhost:8000/openapi.json -o lib/types.gen.ts
```

### تشغيل Database Migrations
```powershell
cd d:\AuditOrbit\api
D:/AuditOrbit/.venv/Scripts/python.exe -m alembic upgrade head
```

### Backup قاعدة البيانات
```powershell
pg_dump -U audit -h localhost -d auditdb > backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql
```

---

## 📁 الملفات المهمة

### Backend
```
api/app/infrastructure/response_models.py     - نماذج الاستجابة
api/app/infrastructure/exception_handlers.py  - معالجة الأخطاء
api/app/infrastructure/cors.py                - إعدادات CORS
api/app/config/settings.py                    - الإعدادات العامة
```

### Frontend
```
web/lib/api-client.ts      - API Client مع Type Safety
web/lib/types.gen.ts       - TypeScript Types
web/.env.local             - متغيرات البيئة
```

### الوثائق
```
DEPLOYMENT_REPORT.md       - التقرير الكامل
QUICK_ACCESS.md            - الوصول السريع
INTEGRATION_SUCCESS.md     - دليل التكامل
```

---

## 🛡️ معلومات الأمان

### JWT Settings
```
Algorithm:           HS256
Secret Key:          devsecret (للتطوير فقط)
Access Token TTL:    30 دقيقة
Refresh Token TTL:   7 أيام
```

### Password Hashing
```
Algorithm:           bcrypt
Rounds:              12
```

---

## 📊 التقنيات المستخدمة

### Backend Stack
```
• FastAPI 0.115.6
• SQLAlchemy 2.0.36
• PostgreSQL 16
• Pydantic 2.12.2
• python-jose (JWT)
• Redis 5.0.8
```

### Frontend Stack
```
• Next.js 16.0.0
• React 19.2.0
• TypeScript 5.x
• Tailwind CSS 3.x
• Shadcn UI (60+ Components)
• openapi-fetch 0.15.0
```

---

## 🎯 الحالة الحالية

```
✅ Backend:        يعمل على http://localhost:8000
✅ Frontend:       يعمل على http://localhost:3000
✅ Database:       متصلة وجاهزة
✅ Types:          مولدة ومحدثة
✅ Integration:    مكتمل وجاهز
```

---

## 🆘 الدعم والمساعدة

### للحصول على المساعدة:
1. راجع `DEPLOYMENT_REPORT.md` للتفاصيل الكاملة
2. تحقق من قسم "استكشاف الأخطاء" في التقرير الرئيسي
3. تأكد من تشغيل جميع الخدمات (Backend, Frontend, Database)

### أخطاء شائعة:
- **401 Unauthorized**: أعد تسجيل الدخول
- **Connection Refused**: تحقق من تشغيل الخدمة
- **Type Errors**: أعد توليد Types من OpenAPI

---

**تاريخ الإنشاء:** 27 أكتوبر 2025  
**الإصدار:** 1.0.0  
**الحالة:** 🚀 جاهز للإنتاج

---

## 📝 ملاحظات مهمة

⚠️ **للإنتاج:**
- غيّر `JWT_SECRET` في settings.py
- غيّر كلمات المرور الافتراضية
- فعّل HTTPS
- حدّث CORS للـ domain الفعلي
- فعّل Backup التلقائي

✅ **للتطوير:**
- جميع الإعدادات جاهزة
- يمكن البدء بالتطوير مباشرة
- استخدم Swagger Docs للاختبار

---

**طُبعت في:** ____________________

**ملاحظات إضافية:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
