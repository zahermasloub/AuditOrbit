# 🔧 دليل تصحيح أخطاء إنشاء المستخدمين

## المشكلة
عند محاولة إضافة مستخدم جديد من لوحة الإدارة، تظهر رسالة خطأ: **"Unauthorized"**

## الحلول المطبقة

### 1. تحسين معالجة التوكن
- ✅ تحديث `use-admin.ts` لفحص وجود التوكن قبل إرسال الطلب
- ✅ إضافة رسائل خطأ واضحة عند عدم وجود التوكن
- ✅ إضافة console.log لتتبع الأخطاء

### 2. تحديث صفحة الإدارة
- ✅ فحص التوكن قبل محاولة إنشاء المستخدم
- ✅ إعادة توجيه تلقائية لصفحة تسجيل الدخول إذا لم يكن التوكن موجوداً

## خطوات التصحيح

### الخطوة 1: تحقق من تسجيل الدخول
1. افتح `http://localhost:3000/login`
2. سجل الدخول باستخدام:
   - **Email**: `admin@example.com`
   - **Password**: `Admin#2025`

### الخطوة 2: تحقق من التوكن
1. افتح Console في المتصفح (F12)
2. اكتب: `localStorage.getItem('auth_token')`
3. يجب أن ترى توكن JWT يبدأ بـ `eyJ...`

### الخطوة 3: افتح لوحة الإدارة
1. انتقل إلى `http://localhost:3000/admin`
2. يجب أن ترى البيانات محملة بنجاح

### الخطوة 4: جرب إضافة مستخدم
1. انقر على "إضافة مستخدم"
2. املأ النموذج
3. انقر على "إضافة"
4. راقب Console للحصول على معلومات مفصلة

## رسائل الخطأ المحتملة

### ❌ "غير مصرح. الرجاء تسجيل الدخول مرة أخرى"
**السبب**: التوكن غير موجود أو منتهي الصلاحية
**الحل**: 
1. سجل الخروج
2. سجل الدخول مرة أخرى
3. تأكد من حفظ التوكن في localStorage

### ❌ "فشل في إنشاء المستخدم"
**السبب**: خطأ في البيانات أو في الخادم
**الحل**:
1. تحقق من صحة البيانات المدخلة
2. تأكد من أن البريد الإلكتروني غير مستخدم مسبقاً
3. راجع سجلات الخادم

## اختبار مباشر عبر API

يمكنك اختبار إنشاء المستخدم مباشرة:

```powershell
# 1. تسجيل الدخول
$login = Invoke-RestMethod -Uri "http://127.0.0.1:8000/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"email":"admin@example.com","password":"Admin#2025"}'

$token = $login.access_token

# 2. إنشاء مستخدم
$newUser = @{
  name = "Test User"
  email = "test@example.com"
  password = "TestPass123!"
  role = "User"
  locale = "ar"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/users" `
  -Method Post `
  -ContentType "application/json" `
  -Headers @{Authorization="Bearer $token"} `
  -Body $newUser
```

## ملف الاختبار

تم إنشاء ملف HTML للاختبار: `frontend/public/test-token.html`

افتحه في المتصفح:
```
http://localhost:3000/test-token.html
```

يتيح لك هذا الملف:
- ✅ فحص التوكن المحفوظ
- ✅ تسجيل الدخول
- ✅ إنشاء مستخدم
- ✅ رؤية الأخطاء بوضوح

## التحقق من الخادم

تأكد من أن خادم API يعمل:

```powershell
# فحص حالة الحاوية
docker ps --filter "name=api"

# عرض السجلات
docker logs infra-api-1 --tail 50

# إعادة تشغيل إذا لزم الأمر
cd d:\AuditOrbit\infra
docker-compose restart api
```

## معلومات إضافية

### بيانات تسجيل الدخول المتاحة:

**الحساب الأول:**
- Email: `admin@example.com`
- Password: `Admin#2025`
- Role: Admin

**الحساب الثاني:**
- Email: `admin@audit.com`
- Password: `admin123`
- Role: Admin

### نقاط النهاية المتاحة:
- `POST /auth/login` - تسجيل الدخول
- `GET /users` - قائمة المستخدمين
- `POST /users` - إنشاء مستخدم جديد
- `GET /admin/kpis` - إحصائيات لوحة الإدارة

## تم التحديث
التاريخ: 30 أكتوبر 2025
الإصدار: 1.0
