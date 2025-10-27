"""
نماذج الاستجابة الموحدة - Unified Response Schemas
Backend API Response Models
"""

from typing import Generic, TypeVar, Optional, List, Any
from pydantic import BaseModel, Field
from datetime import datetime

T = TypeVar('T')


class SuccessResponse(BaseModel, Generic[T]):
    """استجابة نجاح موحدة"""
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
    """استجابة خطأ موحدة"""
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
                    "details": {"field": "email"}
                },
                "timestamp": "2025-10-27T10:30:00Z"
            }
        }


class PaginatedResponse(BaseModel, Generic[T]):
    """استجابة مع pagination"""
    success: bool = True
    data: List[T]
    pagination: dict[str, int]
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ListResponse(BaseModel, Generic[T]):
    """استجابة قائمة بسيطة"""
    success: bool = True
    data: List[T]
    count: int
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# Helper Functions

def success_response(data: Any, message: Optional[str] = None) -> dict:
    """إنشاء استجابة نجاح"""
    return SuccessResponse(data=data, message=message).model_dump()


def error_response(code: str, message: str, details: Optional[dict] = None) -> dict:
    """إنشاء استجابة خطأ"""
    return ErrorResponse(
        error={"code": code, "message": message, "details": details or {}}
    ).model_dump()


def paginated_response(
    data: List[Any],
    page: int,
    page_size: int,
    total_items: int,
    message: Optional[str] = None
) -> dict:
    """إنشاء استجابة مع pagination"""
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


def list_response(data: List[Any], message: Optional[str] = None) -> dict:
    """إنشاء استجابة قائمة"""
    return ListResponse(data=data, count=len(data), message=message).model_dump()


# Error Codes

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
