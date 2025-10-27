# 🔗 دليل التكامل الشامل Backend ↔ Frontend

**المشروع:** AuditOrbit  
**الهدف:** ربط Backend (FastAPI) مع Frontend الجديد (Next.js)  
**التاريخ:** 27 أكتوبر 2025

---

## 📋 نظرة عامة

هذا الدليل الشامل يشرح كيفية إنشاء **تكامل قوي ومحكم** بين Backend و Frontend

### ما تم إنشاؤه:

#### Backend Files (API)
- ✅ `api/app/infrastructure/response_models.py` - نماذج الاستجابة الموحدة
- ✅ `api/app/infrastructure/exception_handlers.py` - معالجات الأخطاء
- ✅ `api/app/infrastructure/cors.py` - إعدادات CORS

#### Frontend Files (Web)
- ✅ `web/app/lib/api-client.ts` - عميل API موحد
- ✅ `web/app/lib/api-endpoints.ts` - جميع endpoints معرّفة

---

## 🎯 خطوات التكامل

### المرحلة 1: تحديث Backend (30 دقيقة)

#### الخطوة 1: تحديث main.py

```python
# api/app/presentation/main.py
from fastapi import FastAPI
from app.infrastructure.cors import setup_cors
from app.infrastructure.exception_handlers import setup_exception_handlers
from app.config import settings

app = FastAPI(
    title="AuditOrbit API",
    description="نظام إدارة المراجعة الداخلية",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# إعداد CORS للـ Frontend
setup_cors(app, settings)

# إعداد معالجات الأخطاء
setup_exception_handlers(app)

# استيراد Routers
# from app.presentation.routers import users, auth, engagements
# app.include_router(users.router)
# app.include_router(auth.router)
# app.include_router(engagements.router)
```

#### الخطوة 2: تحديث Router (مثال Users)

```python
# api/app/presentation/routers/users.py
from fastapi import APIRouter, Depends, Query
from app.infrastructure.response_models import (
    success_response,
    error_response,
    paginated_response,
    ErrorCodes
)
from app.infrastructure.exception_handlers import APIException

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/")
async def get_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    # current_user = Depends(get_current_user)
):
    """
    جلب قائمة المستخدمين مع pagination
    """
    try:
        # الحصول على البيانات من الـ Service
        users = await user_service.get_users(page, page_size)
        total = await user_service.count_users()
        
        return paginated_response(
            data=[user.dict() for user in users],
            page=page,
            page_size=page_size,
            total_items=total,
            message="تم جلب المستخدمين بنجاح"
        )
    except Exception as e:
        raise APIException(
            code=ErrorCodes.OPERATION_FAILED,
            message="فشل جلب المستخدمين",
            details={"error": str(e)}
        )

@router.get("/{user_id}")
async def get_user(user_id: int):
    """جلب مستخدم واحد"""
    user = await user_service.get_user(user_id)
    
    if not user:
        raise APIException(
            code=ErrorCodes.NOT_FOUND,
            message="المستخدم غير موجود",
            status_code=404,
            details={"user_id": user_id}
        )
    
    return success_response(
        data=user.dict(),
        message="تم جلب المستخدم بنجاح"
    )

@router.post("/")
async def create_user(user_data: CreateUserSchema):
    """إنشاء مستخدم جديد"""
    # التحقق من عدم وجود المستخدم
    existing = await user_service.get_by_email(user_data.email)
    if existing:
        raise APIException(
            code=ErrorCodes.ALREADY_EXISTS,
            message="البريد الإلكتروني مستخدم بالفعل",
            status_code=409,
            details={"email": user_data.email}
        )
    
    new_user = await user_service.create_user(user_data)
    
    return success_response(
        data=new_user.dict(),
        message="تم إنشاء المستخدم بنجاح"
    )
```

---

### المرحلة 2: إعداد Frontend (20 دقيقة)

#### الخطوة 1: تثبيت المكتبات

```powershell
cd web
pnpm add openapi-fetch
pnpm add -D openapi-typescript
```

#### الخطوة 2: إعداد متغيرات البيئة

```env
# web/.env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

#### الخطوة 3: توليد Types من OpenAPI

```powershell
# تأكد من تشغيل Backend أولاً
cd api
uvicorn app.presentation.main:app --reload

# ثم في terminal آخر
cd web
npx openapi-typescript http://localhost:8000/openapi.json -o app/lib/types.gen.ts
```

---

### المرحلة 3: الاستخدام في Components (15 دقيقة)

#### مثال 1: Login Form

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/app/lib/api-endpoints'
import { TokenManager } from '@/app/lib/api-client'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: apiError } = await login({ email, password })

    if (apiError) {
      setError(apiError.message)
      setLoading(false)
      return
    }

    if (data) {
      // حفظ التوكن
      TokenManager.setToken(data.access_token)
      TokenManager.setRefreshToken(data.refresh_token)
      
      // إعادة التوجيه حسب الدور
      const redirectPath = getRoleBasedRedirect(data.user.role)
      router.push(redirectPath)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {error}
        </div>
      )}
      
      <Input
        type="email"
        placeholder="البريد الإلكتروني"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <Input
        type="password"
        placeholder="كلمة المرور"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <Button type="submit" isLoading={loading} className="w-full">
        تسجيل الدخول
      </Button>
    </form>
  )
}

function getRoleBasedRedirect(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'manager':
      return '/manager'
    case 'auditor':
      return '/auditor'
    default:
      return '/'
  }
}
```

#### مثال 2: Users List مع React Query

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { getUsers, queryKeys } from '@/app/lib/api-endpoints'
import { DataTable } from '@/app/components/table/DataTable'
import { Button } from '@/app/components/ui/Button'

export default function UsersPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => {
      const result = await getUsers(1, 20)
      if (result.error) throw result.error
      return result.data
    },
  })

  if (isLoading) return <div>جاري التحميل...</div>
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded">
        <p className="text-red-700">حدث خطأ: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-2">
          إعادة المحاولة
        </Button>
      </div>
    )
  }

  const columns = [
    { accessorKey: 'id', header: 'الرقم' },
    { accessorKey: 'full_name', header: 'الاسم' },
    { accessorKey: 'email', header: 'البريد' },
    { accessorKey: 'role', header: 'الدور' },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">إدارة المستخدمين</h1>
      
      <DataTable
        data={data || []}
        columns={columns}
        searchKey="full_name"
      />
    </div>
  )
}
```

#### مثال 3: Create Form مع معالجة الأخطاء

```typescript
'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createUser, queryKeys } from '@/app/lib/api-endpoints'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { ErrorCodes } from '@/app/lib/api-client'

export default function CreateUserForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'auditor',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // تحديث cache
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      onSuccess?.()
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = await mutation.mutateAsync(formData)

    if (result.error) {
      // معالجة أخطاء مختلفة
      switch (result.error.code) {
        case ErrorCodes.VALIDATION_ERROR:
          // عرض أخطاء الحقول
          const validationErrors: Record<string, string> = {}
          result.error.details?.errors?.forEach((err: any) => {
            validationErrors[err.field] = err.message
          })
          setErrors(validationErrors)
          break
          
        case ErrorCodes.ALREADY_EXISTS:
          setErrors({ email: 'البريد الإلكتروني مستخدم بالفعل' })
          break
          
        default:
          setErrors({ general: result.error.message })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="bg-red-50 p-3 rounded text-red-700">
          {errors.general}
        </div>
      )}

      <div>
        <Input
          placeholder="الاسم الكامل"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
        />
        {errors.full_name && (
          <p className="text-red-600 text-sm mt-1">{errors.full_name}</p>
        )}
      </div>

      <div>
        <Input
          type="email"
          placeholder="البريد الإلكتروني"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        {errors.email && (
          <p className="text-red-600 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <Input
          type="password"
          placeholder="كلمة المرور"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        {errors.password && (
          <p className="text-red-600 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      <select
        value={formData.role}
        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        className="w-full p-2 border rounded"
      >
        <option value="auditor">مراجع</option>
        <option value="manager">مدير</option>
        <option value="admin">مسؤول</option>
      </select>

      <Button type="submit" isLoading={mutation.isPending} className="w-full">
        إنشاء مستخدم
      </Button>
    </form>
  )
}
```

---

## 🔒 Authentication Flow

### الخطوة 1: Login

```typescript
// 1. المستخدم يدخل بياناته
const { data, error } = await login({ email, password })

// 2. Backend يتحقق ويرسل tokens
if (data) {
  TokenManager.setToken(data.access_token)
  TokenManager.setRefreshToken(data.refresh_token)
}
```

### الخطوة 2: Protected Routes

```typescript
// app/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/manager/:path*', '/auditor/:path*']
}
```

### الخطوة 3: Auto Token Refresh

```typescript
// تم تنفيذه في api-client.ts
// يحدث تلقائياً عند انتهاء التوكن
```

---

## 📊 Pagination Example

```typescript
const [page, setPage] = useState(1)
const PAGE_SIZE = 20

const { data, isLoading } = useQuery({
  queryKey: [...queryKeys.users, page],
  queryFn: async () => {
    const result = await getUsers(page, PAGE_SIZE)
    if (result.error) throw result.error
    return result.data
  },
})

// في Component
<div className="flex items-center gap-2 mt-4">
  <Button 
    onClick={() => setPage(p => Math.max(1, p - 1))}
    disabled={page === 1}
  >
    السابق
  </Button>
  
  <span>صفحة {page}</span>
  
  <Button 
    onClick={() => setPage(p => p + 1)}
    disabled={!data || data.length < PAGE_SIZE}
  >
    التالي
  </Button>
</div>
```

---

## 🧪 الاختبار

### اختبار Backend

```powershell
cd api

# تشغيل الخادم
uvicorn app.presentation.main:app --reload

# فتح Swagger Docs
# http://localhost:8000/docs

# اختبار endpoint
curl -X POST http://localhost:8000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","full_name":"Test User","password":"123456","role":"auditor"}'
```

### اختبار Frontend

```powershell
cd web

# تشغيل Dev Server
pnpm dev

# فتح المتصفح
# http://localhost:3000
```

---

## 📝 قائمة المراجعة

### Backend Setup
- [ ] تثبيت response_models.py
- [ ] تثبيت exception_handlers.py
- [ ] تثبيت cors.py
- [ ] تحديث main.py
- [ ] تحديث جميع Routers
- [ ] اختبار في Swagger Docs

### Frontend Setup
- [ ] تثبيت openapi-fetch
- [ ] إنشاء api-client.ts
- [ ] إنشاء api-endpoints.ts
- [ ] توليد types.gen.ts
- [ ] إعداد .env.local
- [ ] تحديث المكونات

### Testing
- [ ] اختبار Login
- [ ] اختبار Protected Routes
- [ ] اختبار CRUD Operations
- [ ] اختبار Error Handling
- [ ] اختبار Pagination
- [ ] اختبار Token Refresh

---

## 🚀 الخلاصة

الآن لديك نظام تكامل كامل:

✅ **Backend:** استجابات موحدة + معالجة أخطاء احترافية  
✅ **Frontend:** عميل API آمن + إدارة tokens تلقائية  
✅ **Type Safety:** TypeScript types مولدة من OpenAPI  
✅ **Error Handling:** معالجة شاملة لجميع الأخطاء  
✅ **Authentication:** JWT + Auto refresh  

**جاهز للاستخدام!** 🎉
