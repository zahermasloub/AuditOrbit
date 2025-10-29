# بوابة العمليات الموحدة (Ops Console) - تصميم وتنفيذ شامل (نسخة عربية)

هذا المستند يصف خطة متكاملة لإنشاء بوابة تشغيل وإدارة موحدة داخل مشروع الواجهة (Next.js) لعرض والتحكم في جميع خدمات البنية التالية من مكان واحد وباللغة العربية مع تحديثات تلقائية:

- API (FastAPI): \`/docs\` و \`/redoc\` و \`/health\`
- MinIO: الواجهة \`9001\` وواجهة API \`9000\`
- AI Worker: مراقبة طوابير المهام والتقدم والنتائج
- Redis + قاعدة البيانات + صحة النظام

الهدف: واجهة واحدة بعنوان \`/ops\` تقدّم نظرة عامة، استكشاف API، إدارة التخزين، مراقبة مهام الذكاء الاصطناعي، الإعدادات والسجلات والتنبيهات.

---

## 1) الأهداف ومعايير النجاح

- كل شيء في مكان واحد وباللغة العربية.
- اكتشاف تلقائي لأي Endpoints جديدة عبر قراءة \`/openapi.json\`.
- تحديثات لحظية عبر SSE/WebSocket لنتائج ملفات MinIO ومهام AI.
- سهولة استخدام: الوصول لأي مهمة في نقرتين.
- تعمل محلياً وعلى الإنتاج بنفس الخبرة تقريباً.

---

## 2) المعمارية المستهدفة (نظرة عليا)

- واجهة Next.js: صفحة \`/ops\` كمجلد رئيسي يحتوي أقسام:
  - نظرة عامة، مستكشف API، التخزين (MinIO)، مهام AI، الإعدادات، السجلات.
- Proxy/Rewrites تحت Next.js لتمرير الطلبات إلى الخدمات:
    - \`/ops/api/:path*\` → \`http://localhost:8000/:path*\`
    - \`/ops/minio/:path*\` → \`http://localhost:9000/:path*\`
    - \`/ops/minio-console/:path*\` → \`http://localhost:9001/:path*\`
- توسيع الـ API بإضافات خفيفة للـ Ops:
  - \`/ops/healthz-aggregate\`: صحة متجمعة Postgres/Redis/MinIO/AI
  - \`/ops/events\`: قناة SSE للأحداث اللحظية
  - \`/ops/minio/webhook\`: استقبال إشعارات من MinIO
  - \`/ops/ai/webhook\`: استقبال إشعارات تقدم/نتائج من الـ Worker

ملاحظة: محلياً تمر عبر المنافذ الحالية، إنتاجياً عبر Nginx/Ingress.

---

## 3) متطلبات البيئة

- في الواجهة (Next.js):
  - \`NEXT_PUBLIC_API_BASE=http://localhost:8000\`
  - \`NEXT_PUBLIC_OPS_BASE=/ops\`
- في الـ API: مفاتيح MinIO وRedis موجودة بالفعل في \`.env\` وتُقرأ من بيئة الحاوية.

---

## 4) إعداد Rewrites في Next.js

أضف القواعد التالية إلى \`frontend/next.config.mjs\` ضمن \`async rewrites()\`:

```js
export default {
  async rewrites() {
    return [
      // تمرير API
      {
        source: '/ops/api/:path*',
        destination: 'http://localhost:8000/:path*',
      },
      // تمرير MinIO API
      {
        source: '/ops/minio/:path*',
        destination: 'http://localhost:9000/:path*',
      },
      // تمرير MinIO Console
      {
        source: '/ops/minio-console/:path*',
        destination: 'http://localhost:9001/:path*',
      },
    ]
  },
}
```

ملاحظة: في الإنتاج استخدم نفس الفكرة مع Nginx/Ingress (انظر قسم النشر).

---

## 5) هيكل صفحات الواجهة (Next.js)

المقترح إضافة مجلد \`frontend/app/ops\` يحتوي:

- \`layout.tsx\`: تخطيط عام (Nav جانبي عربي + رأس + محتوى)
- \`page.tsx\`: نظرة عامة (Health + بطاقات الخدمات + آخر الأحداث)
- \`api/page.tsx\`: مستكشف API (تبويبين: Swagger وReDoc)
- \`storage/page.tsx\`: مدير ملفات مبسط + تضمين MinIO Console
- \`ai/page.tsx\`: مراقبة طوابير المهام + تقدم لحظي
- \`settings/page.tsx\`: إعدادات عرضية للقراءة فقط
- \`logs/page.tsx\`: سجلات مختصرة + تنبيهات

أ) تخطيط مشترك (layout):

```tsx
// frontend/app/ops/layout.tsx
import React from 'react'
import Link from 'next/link'

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">بوابة العمليات (Ops)</h1>
        <span className="text-sm text-gray-500">البيئة: محلية</span>
      </header>
      <div className="flex">
        <aside className="w-64 bg-white border-l p-4 space-y-3">
          <nav className="flex flex-col space-y-2">
            <Link href="/ops">نظرة عامة</Link>
            <Link href="/ops/api">مستكشف API</Link>
            <Link href="/ops/storage">التخزين (MinIO)</Link>
            <Link href="/ops/ai">مهام الذكاء الاصطناعي</Link>
            <Link href="/ops/settings">الإعدادات</Link>
            <Link href="/ops/logs">السجلات والتنبيهات</Link>
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
```

ب) نظرة عامة:

```tsx
// frontend/app/ops/page.tsx
'use client'
import React, { useEffect, useState } from 'react'

export default function Overview() {
  const [health, setHealth] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/ops/api/health')
      .then(r => r.json())
      .then(setHealth)
      .catch(() => setError('تعذر الاتصال بالـ API'))
  }, [])

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">نظرة عامة</h2>
      {error && <div className="text-red-600">{error}</div>}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded border">
            <div className="text-gray-500">API</div>
            <div className="text-green-600">{health.status}</div>
          </div>
        </div>
      )}
    </div>
  )
}
```

ج) مستكشف API (Swagger + ReDoc بتبويب بسيط عبر iframe):

```tsx
// frontend/app/ops/api/page.tsx
'use client'
import React, { useState } from 'react'

export default function ApiExplorer() {
  const [tab, setTab] = useState<'swagger' | 'redoc'>('swagger')
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">مستكشف الـ API</h2>
      <div className="flex gap-2">
        <button className={`px-3 py-1 border rounded ${tab==='swagger'?'bg-gray-200':''}`} onClick={() => setTab('swagger')}>Swagger</button>
        <button className={`px-3 py-1 border rounded ${tab==='redoc'?'bg-gray-200':''}`} onClick={() => setTab('redoc')}>ReDoc</button>
      </div>
      <div className="border rounded overflow-hidden bg-white" style={{height: '75vh'}}>
        {tab === 'swagger' ? (
          <iframe src="/ops/api/docs" className="w-full h-full" />
        ) : (
          <iframe src="/ops/api/redoc" className="w-full h-full" />
        )}
      </div>
    </div>
  )
}
```

د) التخزين (MinIO): تضمين الـ Console + عارض ملفات بسيط (اختياري لاحقاً):

```tsx
// frontend/app/ops/storage/page.tsx
export default function StoragePage() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">التخزين (MinIO)</h2>
      <p className="text-sm text-gray-600">يمكن استخدام الواجهة المدمجة أدناه لإدارة الملفات (Console).</p>
      <div className="border rounded overflow-hidden bg-white" style={{height: '75vh'}}>
        <iframe src="/ops/minio-console" className="w-full h-full" />
      </div>
    </div>
  )
}
```

هـ) مهام الذكاء الاصطناعي (تدفق SSE حي + قائمة مهام):

```tsx
// frontend/app/ops/ai/page.tsx
'use client'
import React, { useEffect, useState } from 'react'

type EventMsg = { type: string; ts: string; payload: any }

export default function AiPage() {
  const [events, setEvents] = useState<EventMsg[]>([])

  useEffect(() => {
    const es = new EventSource('/ops/api/ops/events')
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        setEvents(prev => [data, ...prev].slice(0, 200))
      } catch {}
    }
    es.onerror = () => {
      // سيعاد الاتصال تلقائياً
    }
    return () => es.close()
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">مهام الذكاء الاصطناعي</h2>
      <div className="text-sm text-gray-600">تدفق أحداث حي (SSE)</div>
      <div className="bg-white border rounded divide-y">
        {events.map((ev, i) => (
          <div key={i} className="p-3">
            <div className="text-xs text-gray-500">{ev.ts} • {ev.type}</div>
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(ev.payload, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}
```

و) الإعدادات والسجلات: صفحات بسيطة (عرض فقط) تُبنى لاحقاً.

---

## 6) إضافات الـ API (FastAPI) المساعدة للـ Ops

أضف Router جديد \`ops.py\` ضمن \`api/app/presentation/routers/ops.py\`:

```py
# api/app/presentation/routers/ops.py
from datetime import datetime
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
import json
import asyncio
import boto3
import os
import redis
from sqlalchemy import text
from .. import __init__  # للتوافق مع المسارات النسبية إن لزم
from ...infrastructure.db.session import SessionLocal

router = APIRouter()

# قناة بسيطة للأحداث (SSE) في الذاكرة - يمكن استبدالها بـ Redis PubSub
_subscribers: list[asyncio.Queue] = []

async def _broadcast(event: dict):
    for q in list(_subscribers):
        await q.put(event)

@router.get("/ops/healthz-aggregate")
async def health_aggregate():
    ok = True
    details = {}

    # DB
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        details['db'] = 'ok'
    except Exception as e:
        ok = False
        details['db'] = f'error: {e}'

    # Redis
    try:
        r = redis.from_url(os.getenv('REDIS_URL', 'redis://redis:6379/0'))
        r.ping()
        details['redis'] = 'ok'
    except Exception as e:
        ok = False
        details['redis'] = f'error: {e}'

    # MinIO (S3 compatible)
    try:
        s3 = boto3.client(
            's3',
            endpoint_url=os.getenv('S3_ENDPOINT', 'http://minio:9000'),
            aws_access_key_id=os.getenv('S3_ACCESS_KEY', 'auditorbit'),
            aws_secret_access_key=os.getenv('S3_SECRET_KEY', 'auditorbit123'),
        )
        s3.list_buckets()
        details['minio'] = 'ok'
    except Exception as e:
        ok = False
        details['minio'] = f'error: {e}'

    # AI Worker (مؤشر مبسط: اتصال Redis قائم)
    details['ai_worker'] = 'ok' if details.get('redis') == 'ok' else 'unknown'

    return { 'status': 'ok' if ok else 'degraded', 'details': details }

@router.get('/ops/events')
async def sse_events(request: Request):
    queue: asyncio.Queue = asyncio.Queue()
    _subscribers.append(queue)

    async def event_gen():
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=15)
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    # نبقي الاتصال حياً
                    yield ": keep-alive\n\n"
        finally:
            _subscribers.remove(queue)

    return StreamingResponse(event_gen(), media_type='text/event-stream')

@router.post('/ops/minio/webhook')
async def minio_webhook(payload: dict):
    event = {
        'type': 'file_event',
        'ts': datetime.utcnow().isoformat(),
        'payload': payload,
    }
    await _broadcast(event)
    return {'ok': True}

@router.post('/ops/ai/webhook')
async def ai_webhook(payload: dict):
    event = {
        'type': 'ai_job_event',
        'ts': datetime.utcnow().isoformat(),
        'payload': payload,
    }
    await _broadcast(event)
    return {'ok': True}
```

ثم سجّل هذا الراوتر في \`api/app/presentation/main.py\`:

```py
# ضمن بقية include_router
from .routers import ops
app.include_router(ops.router, prefix="/", tags=["ops"])  # يعرّف /ops/*
```

ملاحظة: يمكنك تقييد الوصول لـ Ops عبر دور المشرف.

---

## 7) ربط الـ AI Worker بالأحداث (Webhook)

في نهاية كل مهمة (نجاح/فشل/تقدم)، أرسل POST إلى \`/ops/ai/webhook\`:

```py
# مثال مبسط داخل ai/worker
import requests
import os

OPS_BASE = os.getenv('OPS_BASE', 'http://api:8000')

def notify(event_type: str, payload: dict):
    try:
        requests.post(f"{OPS_BASE}/ops/ai/webhook", json={
            'event': event_type,
            **payload,
        }, timeout=2)
    except Exception:
        pass

# مثال: عند اكتمال مهمة
notify('job_done', {'job_id': job.id, 'result': {...}})
```

بدلاً من ذلك، يمكن استخدام Redis PubSub وتستهلكه واجهة الـ API لبث SSE.

---

## 8) إشعارات MinIO (Bucket Notifications)

للحصول على حدث عند رفع/حذف الملفات، فعّل إشعار HTTP إلى \`/ops/minio/webhook\`:

- عبر MinIO Console: إعداد Notifications → HTTP Endpoint → URL: \`http://api:8000/ops/minio/webhook\` (داخل docker network)
- أو عبر CLI (mc):

```bash
# اختياري للتوثيق فقط
mc admin config set myminio notify_webhook:ops endpoint="http://api:8000/ops/minio/webhook" queue_limit="1000"
mc event add myminio/auditevidence arn:minio:sqs::ops:webhook --event put,delete
```

ملاحظة: بدّل المضيف حسب الشبكة (محلياً من خارج الحاوية سيكون \`http://localhost:8000/ops/minio/webhook\`).

---

## 9) الأمن والصلاحيات

- حماية مسار \`/ops/*\` للمشرفين فقط (Role: Admin أو DevOps).
- لا تعرض مفاتيح MinIO/Redis في الواجهة؛ استخدم الخادم وسيطاً للعمليات الحساسة.
- CSRF/CORS: كل شيء على نفس الأصل بفضل rewrites.
- سجّل كل عمليات الإدارة في Audit Log.

---

## 10) النشر والتشغيل

- محلياً: تعتمد rewrites على \`next dev\` أو \`next start\`.
- إنتاجياً: استخدم Nginx لإعادة الكتابة:

```nginx
location /ops/api/ {
  proxy_pass http://api:8000/;
}
location /ops/minio/ {
  proxy_pass http://minio:9000/;
}
location /ops/minio-console/ {
  proxy_pass http://minio:9001/;
}
```

- المراقبة: استهلك \`/ops/healthz-aggregate\` في Prometheus/Grafana أو أدوات خارجية.

---

## 11) خطة تنفيذ مرحلية (MVP → موسّع)

1) MVP (أسبوعان):
   - Rewrites + صفحات /ops الأساسية (نظرة عامة + API Explorer عبر iframe) + SSE بسيط + Health Aggregate.
2) ملفات MinIO:
   - تضمين Console أولاً، ثم تطوير مدير ملفات مبسط عبر S3 SDK.
3) مهام AI:
   - Webhook للأحداث من الـ Worker + جدول مهام حي + إجراءات (إلغاء/إعادة).
4) الأمان والصلاحيات:
   - حصر الوصول للمشرفين + تسجيل عمليات الإدارة.
5) السجلات والتنبيهات:
   - عرض آخر N أسطر من سجلات API/Worker + تنبيهات مرئية.

---

## 12) تجربة سريعة (Quick Try)

1) أضف rewrites في \`frontend/next.config.mjs\` كما ورد أعلاه.
2) أنشئ صفحات \`/ops\` وفق الهياكل المقترحة.
3) أضف \`ops.py\` إلى الـ API وسجّله في \`main.py\`.
4) أعد تشغيل docker-compose.
5) افتح \`http://localhost:3000/ops\`، وتابع:
   - \"نظرة عامة\" تعرض حالة API.
   - \"مستكشف API\" يضمّن Swagger/ReDoc.
   - \"التخزين\" يضمّن MinIO Console.
   - \"مهام AI\" تستقبل أحداث SSE فور صدورها.

---

## 13) ملاحظات ختامية

- تم تصميم هذا المستند ليكون \"ملفاً واحداً\" يجمع الهيكل، التعليمات، وأكواد الربط الأساسية الجاهزة للنسخ.
- يمكنك البدء بـ iframe (التضمين) لأنه الأسرع، ثم لاحقاً تطوير تكامل أعمق (SDKs، واجهات تفاعلية).
- باستخدام SSE + Webhooks ستحصل على تجربة لحظية حقيقية بدون تحديث الصفحة.

بالتوفيق—وعند جاهزيتك يمكنني تولّي إنشاء الملفات الفعلية في \`frontend\` و\`api\` طبقاً لهذا التصميم وتشغيلها فوراً.
