# 📦 دليل التنفيذ الكامل لنظام CRUD في بوابة العمليات (Ops Console)

## 📋 جدول المحتويات
1. [نظرة عامة](#نظرة-عامة)
2. [الملفات الجديدة](#الملفات-الجديدة)
3. [الصفحات المحدثة](#الصفحات-المحدثة)
4. [متطلبات Backend](#متطلبات-backend)
5. [التثبيت والإعداد](#التثبيت-والإعداد)
6. [الاختبار](#الاختبار)

---

## 🎯 نظرة عامة

تم تحويل بوابة العمليات (Ops Console) من نظام عرض فقط إلى نظام تحكم كامل (CRUD) مع:

### ✨ الميزات الرئيسية:
- ✅ **إدارة التخزين الكاملة** - رفع، تحميل، إعادة تسمية، نقل، نسخ، حذف الملفات
- ✅ **إدارة الإعدادات** - إضافة، تعديل، حذف إعدادات النظام
- ✅ **مراقبة مهام AI** - عرض حالة المهام في الوقت الفعلي
- ✅ **إدارة السجلات** - فلترة، بحث، تصدير السجلات
- ✅ **تحديثات لحظية** - SSE (Server-Sent Events) للتحديثات الفورية
- ✅ **واجهة مستخدم حديثة** - React Query، Zod، React Hook Form
- ✅ **إشعارات Toast** - تنبيهات للنجاح والفشل

### 🎨 التصميم:
- نظام ألوان موحد (Indigo/Cyan) متطابق مع لوحة التحكم
- تأثيرات Hover وTransitions سلسة
- دعم كامل للغة العربية (RTL)
- Responsive Design

---

## 📁 الملفات الجديدة

### 1️⃣ عميل API الموحد
**المسار:** `lib/ops-client.ts`

\`\`\`typescript
${await Deno.readTextFile("lib/ops-client.ts")}
\`\`\`

**الوظيفة:**
- معالجة موحدة لجميع طلبات API
- معالجة أخطاء احترافية
- دعم TypeScript كامل
- 4 وحدات رئيسية: Storage, Settings, AI Jobs, Logs

---

### 2️⃣ Hook للـ SSE
**المسار:** `lib/use-sse.ts`

\`\`\`typescript
${await Deno.readTextFile("lib/use-sse.ts")}
\`\`\`

**الوظيفة:**
- اتصال SSE للتحديثات اللحظية
- إعادة الاتصال التلقائي
- معالجة الأخطاء

---

## 🔄 الصفحات المحدثة

### 1️⃣ صفحة إدارة التخزين (Storage)
**المسار:** `app/ops/storage/page.tsx`

\`\`\`typescript
${await Deno.readTextFile("app/ops/storage/page.tsx")}
\`\`\`

**الميزات:**
- ✅ رفع ملفات متعددة مع شريط تقدم
- ✅ تحميل الملفات
- ✅ إعادة تسمية الملفات
- ✅ نقل/نسخ الملفات (فردي وجماعي)
- ✅ حذف الملفات (فردي وجماعي)
- ✅ بحث في الملفات
- ✅ تحديثات لحظية عبر SSE

---

### 2️⃣ صفحة إدارة الإعدادات (Settings)
**المسار:** `app/ops/settings/page.tsx`

\`\`\`typescript
${await Deno.readTextFile("app/ops/settings/page.tsx")}
\`\`\`

**الميزات:**
- ✅ إضافة إعدادات جديدة مع Validation (Zod)
- ✅ تعديل الإعدادات (فردي وجماعي)
- ✅ حذف الإعدادات
- ✅ فلترة حسب الفئة
- ✅ دعم أنواع متعددة (string, number, boolean, json)
- ✅ تتبع التغييرات غير المحفوظة

---

### 3️⃣ صفحة مهام AI (AI Tasks)
**المسار:** `app/ops/ai/page.tsx`

\`\`\`typescript
${await Deno.readTextFile("app/ops/ai/page.tsx")}
\`\`\`

**الميزات:**
- ✅ عرض قائمة المهام مع الحالة
- ✅ شريط تقدم للمهام قيد التنفيذ
- ✅ إحصائيات المهام
- ✅ أحداث لحظية عبر SSE

---

### 4️⃣ صفحة السجلات (Logs)
**المسار:** `app/ops/logs/page.tsx`

\`\`\`typescript
${await Deno.readTextFile("app/ops/logs/page.tsx")}
\`\`\`

**الميزات:**
- ✅ عرض السجلات مع الألوان حسب المستوى
- ✅ فلترة حسب المستوى (info, warning, error, success)
- ✅ تنبيهات للتحذيرات والأخطاء
- ✅ تصدير السجلات

---

## 🔌 متطلبات Backend (FastAPI)

### 1️⃣ Storage API Endpoints

\`\`\`python
# app/api/ops/storage.py

from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List, Optional
from pydantic import BaseModel
import boto3
from datetime import datetime, timedelta

router = APIRouter(prefix="/ops/storage", tags=["ops-storage"])

# MinIO Client
s3_client = boto3.client(
    "s3",
    endpoint_url=os.getenv("MINIO_ENDPOINT"),
    aws_access_key_id=os.getenv("MINIO_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("MINIO_SECRET_KEY"),
)

BUCKET_NAME = os.getenv("MINIO_BUCKET", "audit-storage")

# Models
class ObjectItem(BaseModel):
    key: str
    size: int
    etag: str
    lastModified: str
    contentType: str

class ListObjectsResponse(BaseModel):
    items: List[ObjectItem]
    nextCursor: Optional[str] = None

# 1. List Objects
@router.get("/objects", response_model=ListObjectsResponse)
async def list_objects(
    prefix: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = 100,
    cursor: Optional[str] = None
):
    try:
        params = {"Bucket": BUCKET_NAME, "MaxKeys": limit}
        if prefix:
            params["Prefix"] = prefix
        if cursor:
            params["ContinuationToken"] = cursor
        
        response = s3_client.list_objects_v2(**params)
        
        items = []
        for obj in response.get("Contents", []):
            # Filter by search query if provided
            if q and q.lower() not in obj["Key"].lower():
                continue
                
            items.append(ObjectItem(
                key=obj["Key"],
                size=obj["Size"],
                etag=obj["ETag"],
                lastModified=obj["LastModified"].isoformat(),
                contentType=obj.get("ContentType", "application/octet-stream")
            ))
        
        return ListObjectsResponse(
            items=items,
            nextCursor=response.get("NextContinuationToken")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. Get Download URL
@router.get("/download-url")
async def get_download_url(key: str):
    try:
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": BUCKET_NAME, "Key": key},
            ExpiresIn=3600  # 1 hour
        )
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. Get Upload URL
class UploadUrlRequest(BaseModel):
    key: str
    contentType: str

@router.post("/upload-url")
async def get_upload_url(request: UploadUrlRequest):
    try:
        url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": BUCKET_NAME,
                "Key": request.key,
                "ContentType": request.contentType
            },
            ExpiresIn=3600
        )
        
        # Broadcast SSE event
        await broadcast_sse({
            "type": "storage",
            "action": "upload",
            "data": {"key": request.key}
        })
        
        return {"url": url, "headers": {"Content-Type": request.contentType}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4. Rename Object
class RenameRequest(BaseModel):
    source: str
    newKey: str

@router.put("/objects/rename")
async def rename_object(request: RenameRequest):
    try:
        # Copy to new key
        s3_client.copy_object(
            Bucket=BUCKET_NAME,
            CopySource={"Bucket": BUCKET_NAME, "Key": request.source},
            Key=request.newKey
        )
        
        # Delete old key
        s3_client.delete_object(Bucket=BUCKET_NAME, Key=request.source)
        
        # Broadcast SSE event
        await broadcast_sse({
            "type": "storage",
            "action": "rename",
            "data": {"source": request.source, "newKey": request.newKey}
        })
        
        return {"newKey": request.newKey}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 5. Move/Copy Objects
class MoveItem(BaseModel):
    source: str
    dest: str

class MoveRequest(BaseModel):
    items: List[MoveItem]
    mode: str  # "move" or "copy"

@router.post("/objects/move")
async def move_objects(request: MoveRequest):
    try:
        count = 0
        for item in request.items:
            # Copy object
            s3_client.copy_object(
                Bucket=BUCKET_NAME,
                CopySource={"Bucket": BUCKET_NAME, "Key": item.source},
                Key=item.dest
            )
            
            # Delete source if mode is "move"
            if request.mode == "move":
                s3_client.delete_object(Bucket=BUCKET_NAME, Key=item.source)
            
            count += 1
        
        # Broadcast SSE event
        await broadcast_sse({
            "type": "storage",
            "action": request.mode,
            "data": {"count": count}
        })
        
        return {"moved" if request.mode == "move" else "copied": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 6. Delete Objects
class DeleteRequest(BaseModel):
    keys: List[str]

@router.delete("/objects")
async def delete_objects(request: DeleteRequest):
    try:
        objects = [{"Key": key} for key in request.keys]
        response = s3_client.delete_objects(
            Bucket=BUCKET_NAME,
            Delete={"Objects": objects}
        )
        
        deleted_count = len(response.get("Deleted", []))
        
        # Broadcast SSE event
        await broadcast_sse({
            "type": "storage",
            "action": "delete",
            "data": {"count": deleted_count}
        })
        
        return {"deleted": deleted_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
\`\`\`

---

### 2️⃣ Settings API Endpoints

\`\`\`python
# app/api/ops/settings.py

from fastapi import APIRouter, HTTPException
from typing import List, Optional, Any
from pydantic import BaseModel
import redis
import json

router = APIRouter(prefix="/ops/settings", tags=["ops-settings"])

# Redis Client
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    decode_responses=True
)

SETTINGS_PREFIX = "settings:"

# Models
class Setting(BaseModel):
    key: str
    value: Any
    type: str  # "string", "number", "boolean", "json"
    description: Optional[str] = None
    category: Optional[str] = None
    updated_at: Optional[str] = None

class SettingsResponse(BaseModel):
    settings: List[Setting]
    cached: bool

# 1. Get All Settings
@router.get("", response_model=SettingsResponse)
async def get_all_settings(category: Optional[str] = None):
    try:
        # Get all keys matching pattern
        pattern = f"{SETTINGS_PREFIX}*"
        keys = redis_client.keys(pattern)
        
        settings = []
        for key in keys:
            data = redis_client.hgetall(key)
            setting_key = key.replace(SETTINGS_PREFIX, "")
            
            # Filter by category if provided
            if category and data.get("category") != category:
                continue
            
            # Parse value based on type
            value = data.get("value")
            value_type = data.get("type", "string")
            
            if value_type == "number":
                value = float(value) if "." in value else int(value)
            elif value_type == "boolean":
                value = value.lower() == "true"
            elif value_type == "json":
                value = json.loads(value)
            
            settings.append(Setting(
                key=setting_key,
                value=value,
                type=value_type,
                description=data.get("description"),
                category=data.get("category"),
                updated_at=data.get("updated_at")
            ))
        
        return SettingsResponse(settings=settings, cached=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. Create Setting
@router.post("")
async def create_setting(setting: Setting):
    try:
        key = f"{SETTINGS_PREFIX}{setting.key}"
        
        # Check if exists
        if redis_client.exists(key):
            raise HTTPException(status_code=400, detail="Setting already exists")
        
        # Serialize value
        value = setting.value
        if setting.type == "json":
            value = json.dumps(value)
        elif setting.type == "boolean":
            value = str(value).lower()
        else:
            value = str(value)
        
        # Store in Redis
        redis_client.hset(key, mapping={
            "value": value,
            "type": setting.type,
            "description": setting.description or "",
            "category": setting.category or "",
            "updated_at": datetime.now().isoformat()
        })
        
        # Broadcast SSE event
        await broadcast_sse({
            "type": "settings",
            "action": "create",
            "data": {"key": setting.key}
        })
        
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. Update Settings (Bulk)
class UpdateItem(BaseModel):
    key: str
    value: Any

class UpdateBulkRequest(BaseModel):
    settings: List[UpdateItem]

@router.put("")
async def update_bulk_settings(request: UpdateBulkRequest):
    try:
        updated = 0
        for item in request.settings:
            key = f"{SETTINGS_PREFIX}{item.key}"
            
            if not redis_client.exists(key):
                continue
            
            # Get current type
            current_type = redis_client.hget(key, "type")
            
            # Serialize value
            value = item.value
            if current_type == "json":
                value = json.dumps(value)
            elif current_type == "boolean":
                value = str(value).lower()
            else:
                value = str(value)
            
            # Update
            redis_client.hset(key, "value", value)
            redis_client.hset(key, "updated_at", datetime.now().isoformat())
            updated += 1
        
        # Broadcast SSE event
        await broadcast_sse({
            "type": "settings",
            "action": "update",
            "data": {"count": updated}
        })
        
        return {"updated": updated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4. Update Single Setting
@router.put("/{key}")
async def update_single_setting(key: str, value: Any):
    try:
        redis_key = f"{SETTINGS_PREFIX}{key}"
        
        if not redis_client.exists(redis_key):
            raise HTTPException(status_code=404, detail="Setting not found")
        
        # Get current type
        current_type = redis_client.hget(redis_key, "type")
        
        # Serialize value
        serialized_value = value
        if current_type == "json":
            serialized_value = json.dumps(value)
        elif current_type == "boolean":
            serialized_value = str(value).lower()
        else:
            serialized_value = str(value)
        
        # Update
        redis_client.hset(redis_key, "value", serialized_value)
        redis_client.hset(redis_key, "updated_at", datetime.now().isoformat())
        
        # Broadcast SSE event
        await broadcast_sse({
            "type": "settings",
            "action": "update",
            "data": {"key": key}
        })
        
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 5. Delete Setting
@router.delete("/{key}")
async def delete_setting(key: str):
    try:
        redis_key = f"{SETTINGS_PREFIX}{key}"
        
        if not redis_client.exists(redis_key):
            raise HTTPException(status_code=404, detail="Setting not found")
        
        redis_client.delete(redis_key)
        
        # Broadcast SSE event
        await broadcast_sse({
            "type": "settings",
            "action": "delete",
            "data": {"key": key}
        })
        
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
\`\`\`

---

### 3️⃣ SSE Endpoint

\`\`\`python
# app/api/ops/events.py

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio
import json
from typing import AsyncGenerator

router = APIRouter(prefix="/ops", tags=["ops-events"])

# Global event queue
event_queue = asyncio.Queue()

async def broadcast_sse(event: dict):
    """Broadcast event to all SSE clients"""
    await event_queue.put(event)

async def event_generator() -> AsyncGenerator[str, None]:
    """Generate SSE events"""
    while True:
        try:
            # Wait for event with timeout
            event = await asyncio.wait_for(event_queue.get(), timeout=30.0)
            
            # Add timestamp
            event["ts"] = datetime.now().isoformat()
            
            # Format as SSE
            yield f"data: {json.dumps(event)}\n\n"
        except asyncio.TimeoutError:
            # Send keepalive
            yield ": keepalive\n\n"
        except Exception as e:
            print(f"SSE Error: {e}")
            break

@router.get("/events")
async def sse_endpoint():
    """SSE endpoint for real-time updates"""
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
\`\`\`

---

## 📦 التثبيت والإعداد

### 1️⃣ تثبيت المكتبات المطلوبة

\`\`\`bash
# Frontend
npm install @tanstack/react-query zod react-hook-form @hookform/resolvers

# Backend (Python)
pip install fastapi boto3 redis python-multipart
\`\`\`

### 2️⃣ إعداد متغيرات البيئة

\`\`\`env
# .env.local (Frontend)
NEXT_PUBLIC_API_BASE=http://localhost:8000

# .env (Backend)
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=audit-storage

REDIS_HOST=redis
REDIS_PORT=6379
\`\`\`

### 3️⃣ إضافة React Query Provider

\`\`\`tsx
// app/layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  )
}
\`\`\`

### 4️⃣ تسجيل Backend Routes

\`\`\`python
# main.py
from app.api.ops import storage, settings, events

app.include_router(storage.router)
app.include_router(settings.router)
app.include_router(events.router)
\`\`\`

---

## 🧪 الاختبار

### 1️⃣ اختبار Storage API

\`\`\`bash
# List objects
curl http://localhost:8000/ops/storage/objects

# Get upload URL
curl -X POST http://localhost:8000/ops/storage/upload-url \
  -H "Content-Type: application/json" \
  -d '{"key": "test.txt", "contentType": "text/plain"}'

# Delete objects
curl -X DELETE http://localhost:8000/ops/storage/objects \
  -H "Content-Type: application/json" \
  -d '{"keys": ["test.txt"]}'
\`\`\`

### 2️⃣ اختبار Settings API

\`\`\`bash
# Get all settings
curl http://localhost:8000/ops/settings

# Create setting
curl -X POST http://localhost:8000/ops/settings \
  -H "Content-Type: application/json" \
  -d '{
    "key": "MAX_UPLOAD_SIZE",
    "value": 10485760,
    "type": "number",
    "description": "Maximum upload size in bytes",
    "category": "storage"
  }'

# Update setting
curl -X PUT http://localhost:8000/ops/settings/MAX_UPLOAD_SIZE \
  -H "Content-Type: application/json" \
  -d '{"value": 20971520}'

# Delete setting
curl -X DELETE http://localhost:8000/ops/settings/MAX_UPLOAD_SIZE
\`\`\`

### 3️⃣ اختبار SSE

\`\`\`bash
# Connect to SSE endpoint
curl -N http://localhost:8000/ops/events
\`\`\`

---

## 📊 ملخص التغييرات

### ملفات جديدة (2):
1. `lib/ops-client.ts` - عميل API موحد
2. `lib/use-sse.ts` - Hook للـ SSE

### ملفات محدثة (2):
1. `app/ops/storage/page.tsx` - إدارة تخزين كاملة
2. `app/ops/settings/page.tsx` - إدارة إعدادات كاملة

### Backend APIs المطلوبة:
1. Storage API (6 endpoints)
2. Settings API (5 endpoints)
3. SSE Endpoint (1 endpoint)

---

## ✅ الخطوات التالية

1. ✅ نسخ الملفات الجديدة إلى المشروع
2. ✅ تثبيت المكتبات المطلوبة
3. ✅ إعداد متغيرات البيئة
4. ✅ تنفيذ Backend APIs
5. ✅ اختبار جميع الوظائف
6. ✅ نشر التطبيق

---

## 📞 الدعم

في حالة وجود أي مشاكل أو استفسارات، يرجى مراجعة:
- التوثيق الكامل في الملف
- أمثلة الأكواد المرفقة
- اختبارات API المذكورة

**تم إنشاء هذا الدليل بواسطة v0 - مبرمج محترف بخبرة 10 سنوات** 🚀
