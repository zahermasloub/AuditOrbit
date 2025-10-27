# 🔗 دليل التكامل الكامل Backend ↔ Frontend

**المشروع:** AuditOrbit  
**الهدف:** ربط Backend (FastAPI) مع Frontend الجديد (Next.js)  
**التاريخ:** 27 أكتوبر 2025

---

## 📋 نظرة عامة

هذا الدليل يوضح كيفية إنشاء **تكامل قوي ومحكم** بين:
- **Backend:** FastAPI + PostgreSQL (الموجود حالياً)
- **Frontend:** Next.js 14 + React 19 (الواجهات الجديدة)

---

## 🏗️ البنية المعمارية

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 14)                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         UI Components (الواجهات الجديدة)            │  │
│  └───────────────┬─────────────────────────────────────┘  │
│                  │                                          │
│  ┌───────────────▼─────────────────────────────────────┐  │
│  │         API Client (Type-Safe)                       │  │
│  │  • openapi-fetch                                     │  │
│  │  • Auto-generated Types                              │  │
│  │  • Error Handling                                    │  │
│  └───────────────┬─────────────────────────────────────┘  │
└──────────────────┼─────────────────────────────────────────┘
                   │
                   │ HTTP/REST (JSON)
                   │ + JWT Authentication
                   │
┌──────────────────▼─────────────────────────────────────────┐
│                Backend (FastAPI)                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │         API Layer (Routers)                           │ │
│  │  • /api/auth      - المصادقة                         │ │
│  │  • /api/users     - المستخدمين                       │ │
│  │  • /api/admin     - الإدارة                          │ │
│  │  • /api/manager   - المدير                           │ │
│  │  • /api/auditor   - المراجع                          │ │
│  └───────────────┬─────────────────────────────────────┘ │
│                  │                                         │
│  ┌───────────────▼─────────────────────────────────────┐ │
│  │         Service Layer (Business Logic)               │ │
│  └───────────────┬─────────────────────────────────────┘ │
│                  │                                         │
│  ┌───────────────▼─────────────────────────────────────┐ │
│  │         Repository Layer (Database)                  │ │
│  │  • SQLAlchemy ORM                                    │ │
│  │  • PostgreSQL 16                                     │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 أهداف التكامل

### 1. Type Safety - أمان الأنواع
- ✅ توليد TypeScript types من OpenAPI تلقائياً
- ✅ استدعاءات API آمنة بالكامل
- ✅ اكتشاف الأخطاء في وقت التطوير

### 2. Unified Response Format - تنسيق موحد للردود
- ✅ جميع الردود بنفس البنية
- ✅ معالجة أخطاء موحدة
- ✅ سهولة التعامل في Frontend

### 3. Authentication & Authorization - المصادقة والصلاحيات
- ✅ JWT Tokens
- ✅ Role-Based Access Control (RBAC)
- ✅ Token refresh آلي

### 4. Real-time Updates - التحديثات الفورية (اختياري)
- ✅ WebSockets للإشعارات
- ✅ Server-Sent Events للتحديثات

---

## 📦 الخطوة 1: تحديث Backend - Response Models

class SuccessResponse(BaseModel, Generic[T]):
    """
    استجابة نجاح موحدة
    
    مثال:
    {
        "success": true,
        "data": {...},
        "message": "تمت العملية بنجاح",
        "timestamp": "2025-10-27T10:30:00Z"
    }
    """
    success: bool = True
    data: T
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "data": {"id": 1, "name": "Example"},
                "message": "تمت العملية بنجاح",
                "timestamp": "2025-10-27T10:30:00Z"
            }
        }


class ErrorResponse(BaseModel):
    """
    استجابة خطأ موحدة
    
    مثال:
    {
        "success": false,
        "error": {
            "code": "VALIDATION_ERROR",
            "message": "البيانات المدخلة غير صحيحة",
            "details": {...}
        },
        "timestamp": "2025-10-27T10:30:00Z"
    }
    """
    success: bool = False
    error: dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "البيانات المدخلة غير صحيحة",
                    "details": {"field": "email", "issue": "invalid format"}
                },
                "timestamp": "2025-10-27T10:30:00Z"
            }
        }


class PaginatedResponse(BaseModel, Generic[T]):
    """
    استجابة مع pagination
    
    مثال:
    {
        "success": true,
        "data": [...],
        "pagination": {
            "page": 1,
            "page_size": 20,
            "total_items": 100,
            "total_pages": 5
        },
        "timestamp": "2025-10-27T10:30:00Z"
    }
    """
    success: bool = True
    data: List[T]
    pagination: dict[str, int]
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "data": [{"id": 1}, {"id": 2}],
                "pagination": {
                    "page": 1,
                    "page_size": 20,
                    "total_items": 100,
                    "total_pages": 5
                },
                "timestamp": "2025-10-27T10:30:00Z"
            }
        }


class ListResponse(BaseModel, Generic[T]):
    """
    استجابة قائمة بسيطة
    """
    success: bool = True
    data: List[T]
    count: int
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ================================
# Helper Functions
# ================================

def success_response(
    data: Any,
    message: Optional[str] = None
) -> dict:
    """
    إنشاء استجابة نجاح
    
    Usage:
        return success_response(user, "تم إنشاء المستخدم بنجاح")
    """
    return SuccessResponse(
        data=data,
        message=message
    ).model_dump()


def error_response(
    code: str,
    message: str,
    details: Optional[dict] = None
) -> dict:
    """
    إنشاء استجابة خطأ
    
    Usage:
        return error_response(
            "NOT_FOUND",
            "المستخدم غير موجود",
            {"user_id": 123}
        )
    """
    return ErrorResponse(
        error={
            "code": code,
            "message": message,
            "details": details or {}
        }
    ).model_dump()


def paginated_response(
    data: List[Any],
    page: int,
    page_size: int,
    total_items: int,
    message: Optional[str] = None
) -> dict:
    """
    إنشاء استجابة مع pagination
    
    Usage:
        return paginated_response(
            data=users,
            page=1,
            page_size=20,
            total_items=100
        )
    """
    total_pages = (total_items + page_size - 1) // page_size
    
    return PaginatedResponse(
        data=data,
        pagination={
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages
        },
        message=message
    ).model_dump()


def list_response(
    data: List[Any],
    message: Optional[str] = None
) -> dict:
    """
    إنشاء استجابة قائمة
    
    Usage:
        return list_response(users, "تم جلب المستخدمين")
    """
    return ListResponse(
        data=data,
        count=len(data),
        message=message
    ).model_dump()


# ================================
# Error Codes
# ================================

class ErrorCodes:
    """أكواد الأخطاء الموحدة"""
    
    # Authentication & Authorization
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
    
    # Validation
    VALIDATION_ERROR = "VALIDATION_ERROR"
    INVALID_INPUT = "INVALID_INPUT"
    MISSING_FIELD = "MISSING_FIELD"
    
    # Resources
    NOT_FOUND = "NOT_FOUND"
    ALREADY_EXISTS = "ALREADY_EXISTS"
    CONFLICT = "CONFLICT"
    
    # Business Logic
    OPERATION_FAILED = "OPERATION_FAILED"
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS"
    INVALID_STATE = "INVALID_STATE"
    
    # Server
    INTERNAL_ERROR = "INTERNAL_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    DATABASE_ERROR = "DATABASE_ERROR"
