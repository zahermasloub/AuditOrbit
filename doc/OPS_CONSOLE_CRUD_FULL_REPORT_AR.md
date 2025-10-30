# تقرير التنفيذ الشامل لبوابة العمليات (CRUD + الإعدادات)

وثيقة مهنية عملية قابلة للرفع لأدوات الذكاء الاصطناعي – تغطي التصميم، العقود، وخطوات البناء والاختبار نهايةً لنهاية، مع أمثلة واضحة للواجهتين الخلفية والأمامية ضمن بيئة AuditOrbit (FastAPI + Next.js 15).

---

## 1) الهدف ونطاق العمل

تحويل لوحات العمليات إلى نظام تحكم كامل يسمح بالممارسات التالية من الواجهة:

- إنشاء/تعديل/حذف لجميع الكيانات ذات الصلة (Storage Objects, AI Jobs, Settings, Logs).
- مشاهدة رسائل الخطأ بشكل واضح ومهيكل.
- تحكم كامل بالخلفية عبر الواجهة مع بث لحظي (SSE) للتحديثات.
- خطة طرح مرحلية بقبول واضح لكل مرحلة.

التركيز في هذا الإصدار على:

- Backend Endpoints (FastAPI ops endpoints)
- صفحة CRUD رئيسية للتخزين Storage
- صفحة إدارة الإعدادات Settings

مع تمهيد بسيط للوظائف الأخرى (AI، Logs) لسهولة الإكمال لاحقًا.

---

## 2) البنية التقنية المستخدمة في AuditOrbit

- Backend: FastAPI (مفعل، يوجد router في `api/app/presentation/routers/ops.py`).
- Frontend: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind + shadcn/ui.
- State: TanStack React Query v5.
- Forms: react-hook-form + zod.
- Real-time: Server-Sent Events عبر `/ops/events`.
- تخزين: MinIO (S3-compatible)، متاح عبر متغيرات بيئية وحسابات Docker.
- Queue: Redis + RQ للمهام (AI).

ملاحظات تكامل:
 
 - إعادة الكتابة في `frontend/next.config.mjs` تربط مسارات الواجهة بـ FastAPI.
- تم إصلاح Redis decode_responses لاستخدام RQ (تم في هذا المستودع).

---

## 3) معيار الأخطاء الموحد

لتجربة UX ثابتة، تُرجع كافة نقاط /ops الأخطاء بالشكل التالي:

- 400 (Validation):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "حقل name مطلوب",
    "details": { "field": "name" }
  }
}
```

- 404 (Not Found):

```json
{ "error": { "code": "NOT_FOUND", "message": "العنصر غير موجود" } }
```

- 409 (Conflict):

```json
{ "error": { "code": "CONFLICT", "message": "الاسم مستخدم مسبقًا" } }
```

- 500 (Internal):

```json
{ "error": { "code": "INTERNAL_ERROR", "message": "خطأ غير متوقع" } }
```

تُعرض هذه الأخطاء عبر toast/dialog في الواجهة، وتُظهر الأخطاء الحقلية تحت الحقول عند استخدام zod.

---

## 4) عقود الواجهة الخلفية (FastAPI)

تُضاف/توسّع في `api/app/presentation/routers/ops.py`. أمثلة للكيانات الأهم:

### 4.1 التخزين Storage (MinIO)

- GET `/ops/storage/objects` – سرد الملفات مع فلترة وباجينيشن
  - Query: `prefix?` `q?` `limit?` `cursor?`
  - 200:

    ```json
    {
      "items": [
        {"key": "invoices/2025/jan.pdf", "size": 124567, "etag": "..", "lastModified": "2025-10-01T12:00:00Z", "contentType": "application/pdf"}
      ],
      "nextCursor": null
    }
    ```

- GET `/ops/storage/download-url?key=...` – رابط تحميل موقع مسبقًا (presigned)
  - 200: `{ "url": "https://..." }`

- POST `/ops/storage/upload-url` – إنشاء رابط رفع موقع
  - Body: `{ "key": "path/name.ext", "contentType": "image/png" }`
  - 200: `{ "url": "https://...", "headers": {"x-amz-acl": "..."} }`

- PUT `/ops/storage/objects/rename`
  - Body: `{ "source": "old.txt", "newKey": "new.txt" }`
  - 200: `{ "newKey": "new.txt" }`

- POST `/ops/storage/objects/move`
  - Body: `{ "items": [{"source":"a.txt","dest":"folder/a.txt"}], "mode": "move" | "copy" }`
  - 200: `{ "moved": 1 }` أو `{ "copied": 1 }`

- DELETE `/ops/storage/objects`
  - Body: `{ "keys": ["a.txt", "b.txt"] }`
  - 200: `{ "deleted": 2 }`

- (اختياري) إدارة الحاويات Buckets:
  - POST `/ops/storage/buckets` { name }
  - DELETE `/ops/storage/buckets/{name}`

ملاحظات:

- بث حدث SSE عند نجاح عمليات إنشاء/حذف/نقل/إعادة تسمية: `{ type: "storage", action: "delete|rename|move|copy|upload", data, ts }`.

### 4.2 الإعدادات Settings

- GET `/ops/settings` – جميع الإعدادات أو حسب مجموعة
  - Query: `category?`
  - 200: `{ "settings": [{"key","value","type","description","category","updated_at"}], "cached": false }`

- POST `/ops/settings` – إضافة إعداد جديد
  - Body: `{ "key", "value", "type", "description?", "category?" }`
  - 201: `{ "success": true }`

- PUT `/ops/settings` – تحديث جماعي
  - Body: `{ "settings": [{"key","value"}, ...] }`
  - 200: `{ "updated": 5 }`

- GET `/ops/settings/{key}` / PUT `/ops/settings/{key}` / DELETE `/ops/settings/{key}` (إزالة/إرجاع للوضع الافتراضي)

ملاحظات:
- التحقق بالحقل `type` (string|number|boolean|json) عند الحفظ.
- بث SSE عند أي تعديل: `{ type: "settings", action: "update|create|delete", key, ts }`.

### 4.3 (تمهيدي) وظائف الذكاء الاصطناعي AI Jobs

- GET `/ops/ai/jobs?status=&limit=&cursor=`
- POST `/ops/ai/jobs` { type, input }
- DELETE `/ops/ai/jobs/{id}` (إلغاء)
- PUT `/ops/ai/jobs/{id}/retry`
- GET `/ops/ai/jobs/{id}` (تفاصيل)
- GET `/ops/ai/events` (SSE) – موجود لديك؛ يتم توحيد رسائل الحدث.

### 4.4 (اختياري) السجلات Logs

- GET `/ops/logs?level=&source=&search=&limit=&cursor=`
- DELETE `/ops/logs?before=&level=`
- GET `/ops/logs/export`
- GET `/ops/logs/stream` (SSE)

---

## 5) تنفيذ الواجهة الأمامية (Next.js + React Query)

### 5.1 مبادئ مشتركة

- إنشاء عميل بيانات موحد `frontend/lib/ops-client.ts` يحتوي دوال fetch مع معالجة الأخطاء حسب معيار القسم (3).
- تهيئة React Query في root layout عبر QueryClientProvider.
- مكونات UI من shadcn/ui مع RTL.
- استخدام zod + react-hook-form للتحقق الحقلّي.
- الاشتراك بـ SSE باستخدام hook `useSse` وتوزيع التحديثات على الـ queries ذات الصلة (invalidateQueries).

### 5.2 صفحة CRUD للتخزين Storage (app/ops/storage/page.tsx)

الوظائف:
- عرض قائمة الملفات مع بحث/فلترة/Bulk selection.
- رفع ملفات (multi) عبر presigned PUT، مع progress.
- حذف فردي/جماعي، إعادة تسمية، نقل/نسخ.
- روابط تحميل مباشرة (presigned GET).
- توست نجاح/فشل واضح + تحديث فوري (optimistic + invalidate).

الهيكلة المقترحة:
- Components:
  - `FileUploadModal`, `RenameModal`, `MoveCopyModal`, `ConfirmDeleteDialog`, `BulkActionsBar`.
- Queries:
  - `useQuery(['storage','list', {prefix,q,cursor}], ...)`
- Mutations:
  - `useMutation(uploadUrl)`, `useMutation(deleteMany)`, `useMutation(rename)`, `useMutation(moveCopy)`.
- SSE:
  - عند استقبال حدث storage يتم `invalidateQueries(['storage','list'])` أو تحديث تفاضلي.

نماذج رسائل التوست:
- نجاح: "تم حذف 3 عناصر"، "تم الرفع بنجاح".
- فشل: تعرض `error.message` القادمة من الـ API.

### 5.3 صفحة الإعدادات Settings (app/ops/settings/page.tsx)
الوظائف:
- تحميل جميع الإعدادات/حسب المجموعة.
- تعديل فردي وجماعي (زر حفظ التغييرات) مع إظهار الحقول المتغيرة (dirty state).
- إضافة إعداد جديد + حذف/إرجاع للوضع الافتراضي.
- تحقق zod حسب type، وإظهار أخطاء تحت الحقول.

الهيكلة المقترحة:
- Components:
  - `SettingGroup`, `SettingEditRow`, `NewSettingModal`.
- Queries:
  - `useQuery(['settings', {category}], ...)`
- Mutations:
  - `useMutation(updateBulk)`, `useMutation(updateSingle)`, `useMutation(createSetting)`, `useMutation(deleteSetting)`.
- SSE:
  - عند حدث settings يتم تحديث الجدول تلقائيًا (invalidateQueries(['settings'])).

---

## 6) الأمان والصلاحيات

- جميع عمليات الكتابة (POST/PUT/DELETE) تتطلب دور "مدير النظام".
- CORS مضبوط للواجهة فقط (localhost:3000 أثناء التطوير).
- وضع معدل (Rate limit) خفيف على عمليات حساسة (تفريغ سجلات/حذف جماعي).
- التحقق من حجم ونوع الملفات عند الرفع.

---

## 7) خطوات التنفيذ العملية

### 7.1 Backend – FastAPI
1) توحيد الأخطاء في `ops.py` عبر دوال مساعدة:
   - `json_error(code: str, message: str, status: int, details?: dict)`
   - تغليف نقاط CRUD الجديدة بها.
2) إضافة مسارات التخزين المذكورة في (4.1) باستخدام boto3 أو minio SDK (المشروع يستخدم boto3 حاليًا)
   - إعادة استخدام `_get_s3_client()` و `_human_size()`.
3) إضافة مسارات الإعدادات من (4.2)، والربط مع DB (SessionLocal) مع استعلامات SQLAlchemy أو نصوص SQL.
4) بث SSE عبر `_broadcast({...})` في كل عملية كتابة.
5) حماية نقاط الكتابة بفحص الدور/الصلاحية.

قبول: تمرير استدعاءات curl/واجهة وتجربة الأخطاء بنجاح.

### 7.2 Frontend – Next.js
1) إنشاء `lib/ops-client.ts` لتغليف fetch:
   - `fetchJson(path, { method, body })` → يُرجع `{ data, error }` أو يرمي Error قياسي.
2) إعداد QueryClient في `app/layout.tsx` (إن لم يكن معدًا).
3) تحديث `app/ops/storage/page.tsx` لوصلات CRUD الكاملة والمودالات.
4) بناء `app/ops/settings/page.tsx` بمحرر صفوف + zod.
5) إضافة hook `useSse` للاشتراك بـ `/ops/events`.

قبول: تنفيذ CRUD بالكامل من الصفحة، مع رسائل خطأ واضحة.

---

## 8) الاختبار والتحقق (Windows PowerShell)

تشغيل الخدمات (تم إعداد docker-compose في `infra/`):
```powershell
cd d:/AuditOrbit/infra
docker-compose up -d api db redis minio
```

اختبار بعض النقاط يدويًا:
```powershell
# صحة مجمعة
curl http://localhost:8000/ops/healthz-aggregate | ConvertFrom-Json | ConvertTo-Json -Depth 5

# قائمة API
curl http://localhost:8000/ops/api-status | Out-String | Set-Content -Encoding utf8 api-status.json

# حالة التخزين
curl http://localhost:8000/ops/storage-status | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

تشغيل الواجهة:
```powershell
cd d:/AuditOrbit/frontend
pnpm dev
# افتح http://localhost:3000/ops
```

اختبارات قبول يدوية:
- رفع ملف ثم تنزيله ثم إعادة تسميته وحذفه، مع رؤية التوست والأحداث.
- تعديل إعداد/حفظ جماعي/إضافة جديد/حذف – وملاحظة التحديث اللحظي.

---

## 9) خطة طرح مرحلية ومؤشرات القبول

- المرحلة A: التخزين CRUD
  - قبول: رفع/تحميل/حذف/rename/move/copy + رسائل خطأ صحيحة + SSE يعمل + اختبارات curl ناجحة.
- المرحلة B: الإعدادات CRUD
  - قبول: تعديل فردي/جماعي + إضافة/حذف + تحقق zod + SSE تحديث.
- المرحلة C: AI Jobs
  - قبول: إنشاء/إلغاء/Retry + فلاتر + SSE.
- المرحلة D: Logs
  - قبول: فلاتر + tail + تفريغ + تصدير CSV.

زمن تقريبي: 2–3 أيام لكل مرحلة (بما يشمل اختبار وصقل واجهة المستخدم).

---

## 10) ملحق – نماذج Zod مختصرة

```ts
import { z } from 'zod'

export const RenameSchema = z.object({
  source: z.string().min(1),
  newKey: z.string().min(1)
})

export const MoveCopySchema = z.object({
  items: z.array(z.object({ source: z.string(), dest: z.string() })),
  mode: z.enum(["move", "copy"]) 
})

export const NewSettingSchema = z.object({
  key: z.string().min(2),
  type: z.enum(["string","number","boolean","json"]),
  value: z.union([z.string(), z.number(), z.boolean(), z.record(z.any())]),
  description: z.string().optional(),
  category: z.string().optional()
})
```

---

## 11) ملاحظات ختامية

- الوثيقة مصممة لتكون قابلة للاستهلاك الآلي من أدوات الذكاء الاصطناعي: عقود واضحة، أمثلة JSON، وخطوات عملية.
- التنفيذ يراعي بيئة AuditOrbit الحالية (FastAPI backend + Next.js frontend) ويستفيد من البنية القائمة (ops router، rewrites، SSE).
- بعد إتمام مرحلتي التخزين والإعدادات، يصبح تعميم نفس النمط على AI/Logs مباشرًا.
