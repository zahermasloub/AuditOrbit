"""
Exception Handler Middleware
معالج استثناءات موحد لجميع الأخطاء
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
import traceback
import logging

from app.infrastructure.response_models import ErrorCodes

logger = logging.getLogger(__name__)


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """معالج أخطاء Validation"""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"][1:]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": ErrorCodes.VALIDATION_ERROR,
                "message": "البيانات المدخلة غير صحيحة",
                "details": {"errors": errors}
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    )


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """معالج أخطاء قاعدة البيانات"""
    logger.error(f"Database error: {str(exc)}")
    logger.error(traceback.format_exc())
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": ErrorCodes.DATABASE_ERROR,
                "message": "حدث خطأ في قاعدة البيانات",
                "details": {"error": str(exc) if logger.level == logging.DEBUG else None}
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    )


async def general_exception_handler(request: Request, exc: Exception):
    """معالج عام لجميع الأخطاء"""
    logger.error(f"Unhandled exception: {str(exc)}")
    logger.error(traceback.format_exc())
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": ErrorCodes.INTERNAL_ERROR,
                "message": "حدث خطأ داخلي في الخادم",
                "details": {"error": str(exc) if logger.level == logging.DEBUG else None}
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    )


class APIException(Exception):
    """استثناء مخصص للـ API"""
    
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: dict = None
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


async def api_exception_handler(request: Request, exc: APIException):
    """معالج استثناءات API المخصصة"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    )


def setup_exception_handlers(app):
    """تسجيل معالجات الاستثناءات"""
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
    app.add_exception_handler(APIException, api_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
