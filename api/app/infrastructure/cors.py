"""
CORS Middleware Configuration
إعدادات CORS للسماح للـ Frontend بالاتصال
"""

from fastapi.middleware.cors import CORSMiddleware


def setup_cors(app, settings):
    """إعداد CORS للـ Frontend"""
    
    # قائمة Origins المسموح بها
    allowed_origins = [
        "http://localhost:3000",      # Next.js dev server
        "http://localhost:3001",      # احتياطي
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]
    
    # إضافة production URLs إذا كانت موجودة
    if hasattr(settings, 'FRONTEND_URL'):
        allowed_origins.append(settings.FRONTEND_URL)
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
