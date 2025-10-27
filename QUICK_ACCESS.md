# 🔐 معلومات الوصول السريع - AuditOrbit

## 🌐 الروابط الأساسية

### Frontend
- **الرئيسية**: <http://localhost:3000>
- **تسجيل الدخول**: <http://localhost:3000/login>
- **Dashboard**: <http://localhost:3000/dashboard>

### Backend API
- **API**: <http://localhost:8000>
- **Swagger Docs**: <http://localhost:8000/docs>
- **ReDoc**: <http://localhost:8000/redoc>

---

## 👤 حسابات المستخدمين

### Admin (المدير الرئيسي)
```
Email: admin@example.com
Password: Admin#2025
Role: Admin (جميع الصلاحيات)
```

---

## 🗄️ قاعدة البيانات

```
Host: localhost
Port: 5432
Database: auditdb
User: audit
Password: auditpw
URL: postgresql://audit:auditpw@localhost:5432/auditdb
```

---

## 📦 الخدمات الإضافية

### MinIO (Storage)
```
API: http://localhost:9000
Console: http://localhost:9001
User: auditorbit
Password: auditorbit123
```

### Redis
```
Host: localhost:6379
Password: (none)
```

---

## 🚀 أوامر التشغيل السريعة

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

### إعادة توليد Types
```powershell
cd d:\AuditOrbit\web
npx openapi-typescript http://localhost:8000/openapi.json -o lib/types.gen.ts
```

---

## 📄 التقارير والوثائق

- **DEPLOYMENT_REPORT.md**: التقرير الكامل مع جميع التفاصيل
- **INTEGRATION_SUCCESS.md**: دليل التكامل التقني
- **README.md**: نظرة عامة على المشروع

---

**آخر تحديث**: 27 أكتوبر 2025
