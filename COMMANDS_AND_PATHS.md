# 📋 دليل المسارات والأوامر - AuditOrbit

## 📁 هيكل المشروع

```
D:\AuditOrbit\
├── api/                    # Backend FastAPI
├── frontend/              # Frontend Next.js (قديم)
├── web/                   # Frontend Next.js (الحالي - المستخدم) ✅
├── ai/                    # AI Worker Service
├── backend/              # Backend إضافي
├── infra/                # Docker Compose
└── doc/                  # Documentation
```

## 🎯 المسار الرئيسي للعمل

**المجلد النشط**: `D:\AuditOrbit\web`

## 📦 أوامر NPM/PNPM

### 1️⃣ التطوير (Development)

```powershell
# تشغيل dev server
pnpm --dir web dev

# أو من داخل المجلد
cd D:\AuditOrbit\web
pnpm dev

# النتيجة: http://localhost:3000
```

### 2️⃣ البناء (Build)

```powershell
# بناء production من المجلد الرئيسي
pnpm --dir web build

# أو من داخل المجلد
cd D:\AuditOrbit\web
pnpm build
```

### 3️⃣ فحص الأخطاء (Linting)

```powershell
# فحص ESLint من المجلد الرئيسي
pnpm --dir web lint

# أو من داخل المجلد
cd D:\AuditOrbit\web
pnpm lint
```

### 4️⃣ تشغيل Production

```powershell
# بعد البناء
pnpm --dir web start

# أو
cd D:\AuditOrbit\web
pnpm start
```

### 5️⃣ تثبيت Dependencies

```powershell
# تثبيت الحزم
pnpm --dir web install

# أو
cd D:\AuditOrbit\web
pnpm install
```

## 🐳 Docker & Infrastructure

### تشغيل Backend + Database

```powershell
# الانتقال لمجلد infra
cd D:\AuditOrbit\infra

# تشغيل جميع الخدمات
docker-compose up -d

# إيقاف الخدمات
docker-compose down

# عرض حالة الخدمات
docker-compose ps

# عرض logs
docker-compose logs -f
```

### الخدمات المتاحة بعد تشغيل Docker

- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **MinIO (S3)**: `localhost:9000`
- **FastAPI Backend**: `localhost:8000`
- **API Docs**: `http://localhost:8000/docs`

## 🔧 ملفات التكوين

### web/.env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### web/package.json - Scripts

```json
{
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "lint": "eslint .",
    "start": "next start"
  }
}
```

## 📂 المسارات الهامة في الكود

### Frontend (web/)

```
D:\AuditOrbit\web\
├── src/
│   └── app/
│       ├── dashboard/
│       │   └── page.tsx          # صفحة Dashboard الرئيسية
│       ├── login/
│       │   └── page.tsx          # صفحة تسجيل الدخول
│       └── layout.tsx            # Layout رئيسي
│
├── components/
│   ├── evidence-section.tsx      # قسم الأدلة ✅ (تم إصلاحه)
│   ├── engagements-section.tsx   # قسم المهام التدقيقية
│   ├── findings-section.tsx      # قسم الملاحظات
│   ├── reports-section.tsx       # قسم التقارير
│   ├── annual-plans-section.tsx  # قسم الخطط السنوية
│   ├── checklists-section.tsx    # قسم قوائم المراجعة
│   ├── followup-section.tsx      # قسم المتابعة
│   └── ui/                       # مكونات UI (shadcn/ui)
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ...
│
├── lib/
│   ├── api/
│   │   ├── client.ts             # API Client أساسي
│   │   ├── evidence.ts           # Evidence API ✅ (تم تحديثه)
│   │   ├── engagements.ts        # Engagements API
│   │   ├── findings.ts           # Findings API
│   │   └── dashboard.ts          # Dashboard API
│   │
│   └── hooks/
│       ├── useEvidence.ts        # Evidence Hook ✅ (تم إصلاحه)
│       ├── useEngagements.ts     # Engagements Hook
│       └── useAuth.ts            # Authentication Hook
│
├── .env.local                    # متغيرات البيئة (مهم!)
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript Config
├── tailwind.config.ts            # Tailwind Config
└── next.config.js                # Next.js Config
```

### Backend (api/)

```
D:\AuditOrbit\api\
├── app/
│   ├── routers/
│   │   ├── evidence.py           # Evidence endpoints
│   │   ├── engagements.py        # Engagements endpoints
│   │   ├── auth.py               # Authentication
│   │   └── dashboard.py          # Dashboard stats
│   │
│   ├── models/
│   │   ├── evidence.py           # Evidence model
│   │   ├── engagement.py         # Engagement model
│   │   └── user.py               # User model
│   │
│   └── main.py                   # FastAPI app
│
├── alembic/                      # Database migrations
├── requirements.txt              # Python dependencies
└── Dockerfile                    # Docker config
```

## 🎬 السيناريو الكامل للتشغيل

### خطوة 1: تشغيل Infrastructure

```powershell
# الانتقال لمجلد infra
cd D:\AuditOrbit\infra

# تشغيل Docker Compose
docker-compose up -d

# التحقق من تشغيل الخدمات
docker-compose ps
```

### خطوة 2: تشغيل Frontend

```powershell
# العودة للمجلد الرئيسي
cd D:\AuditOrbit

# تشغيل dev server
pnpm --dir web dev
```

### خطوة 3: الوصول للتطبيق

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **MinIO Console**: http://localhost:9001

## 🔍 أوامر PowerShell الأكثر استخداماً

```powershell
# التنقل السريع
cd D:\AuditOrbit
cd D:\AuditOrbit\web
cd D:\AuditOrbit\infra

# تشغيل سريع
pnpm --dir web dev              # Dev server
pnpm --dir web build            # Build
pnpm --dir web lint             # Lint check

# Docker
docker-compose -f infra/docker-compose.yml up -d     # تشغيل
docker-compose -f infra/docker-compose.yml down      # إيقاف
docker-compose -f infra/docker-compose.yml logs -f   # Logs

# Git
git status                      # حالة التغييرات
git add .                       # إضافة جميع التغييرات
git commit -m "message"         # Commit
git push                        # Push to remote
```

## 📊 الحالة الحالية للمشروع

### ✅ تم الإنجاز

- ✅ Evidence Section - إصلاح infinite loop
- ✅ Evidence API - مواءمة مع Backend
- ✅ Evidence Hook - استخدام useCallback
- ✅ Build ناجح
- ✅ Lint بدون أخطاء

### ⏳ قيد العمل

- ⏳ Engagements Section - مراجعة وإصلاح
- ⏳ End-to-end Testing
- ⏳ AI Extraction Integration

### 📝 ملاحظات تقنية

## 💡 نصائح مهمة

### 1. استخدام PNPM بدلاً من NPM

```powershell
# ❌ خطأ
npm run dev

# ✅ صحيح
pnpm dev
# أو
pnpm --dir web dev
```

### 2. المنافذ (Ports)

- Port **3000**: Frontend (Next.js)
- Port **8000**: Backend API (FastAPI)
- Port **5432**: PostgreSQL
- Port **6379**: Redis
- Port **9000**: MinIO (S3)

### 3. متغيرات البيئة

تأكد دائماً من وجود `.env.local` في مجلد `web/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### 4. التقنيات المستخدمة

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: FastAPI, Python, PostgreSQL
- **Styling**: Tailwind CSS, shadcn/ui
- **State**: React Hooks, Custom Hooks
- **Build**: Turbopack (Next.js 16)

## 🆘 حل المشاكل الشائعة

### المشكلة: Port مستخدم

```powershell
# إيقاف process على port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### المشكلة: Dependencies قديمة

```powershell
cd D:\AuditOrbit\web
pnpm install
```

### المشكلة: Docker لا يعمل

```powershell
# إعادة تشغيل Docker
docker-compose -f infra/docker-compose.yml restart

# حذف وإعادة البناء
docker-compose -f infra/docker-compose.yml down
docker-compose -f infra/docker-compose.yml up -d --build
```

### المشكلة: Build فاشل

```powershell
# حذف cache
cd D:\AuditOrbit\web
Remove-Item -Recurse -Force .next
pnpm build
```

## 📞 جهات الاتصال والموارد

- **المستودع**: https://github.com/zahermasloub/AuditOrbit
- **الفرع الحالي**: master
- **Next.js Docs**: https://nextjs.org/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com

---

**آخر تحديث**: 28 أكتوبر 2025
**الحالة**: نشط ✅
