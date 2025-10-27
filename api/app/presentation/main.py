import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# from ..middlewares.audit import audit_log_middleware  # Temporarily disabled
from .middlewares.rate_limit import limiter
from .middlewares.security import SecurityHeadersMiddleware
from ..infrastructure.exception_handlers import setup_exception_handlers
from .routers import (
  ai,
  audit,
  auditor,
  auth,
  checklists,
  compare,
  dashboard,
  engagements,
  evidence,
  followups,
  manager,
  notifications,
  reports,
  samples,
  roles,
  users,
  wp,
)

app = FastAPI(title="AuditOrbit API", version="0.2.0", docs_url="/docs", redoc_url="/redoc", debug=True)
app.state.limiter = limiter

# Debug middleware removed (Unicode emoji issue on Windows)
# @app.middleware("http")
# async def debug_middleware(request: Request, call_next):
#   print(f"Incoming: {request.method} {request.url.path}")
#   response = await call_next(request)
#   print(f"Response: {response.status_code}")
#   return response

# app.add_middleware(SlowAPIMiddleware)  # DISABLED FOR DEBUG
# app.add_middleware(SecurityHeadersMiddleware)  # DISABLED FOR DEBUG
# app.middleware("http")(audit_log_middleware)  # DISABLED TEMPORARILY FOR LOGIN FIX

# إعداد معالجات الأخطاء الموحدة
setup_exception_handlers(app)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*" # Wildcard for debugging - NOT FOR PRODUCTION
]

# origins = [
#   origin.strip()
#   for origin in os.getenv("WEB_ORIGINS", os.getenv("WEB_ORIGIN", "http://localhost:3000")).split(",")
#   if origin.strip()
# ]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc) -> JSONResponse:  # type: ignore[no-untyped-def]
  return JSONResponse(status_code=429, content={"detail": "Too Many Requests"})

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(roles.router, prefix="/roles", tags=["roles"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
app.include_router(engagements.router, prefix="/engagements", tags=["engagements"])
app.include_router(checklists.router, prefix="/checklists", tags=["checklists"])
app.include_router(evidence.router, prefix="/evidence", tags=["evidence"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])
app.include_router(compare.router, prefix="/ai", tags=["ai-compare"])
app.include_router(reports.router, prefix="/reports", tags=["reports"])
app.include_router(manager.router, prefix="/manager", tags=["manager"])
app.include_router(auditor.router, prefix="/auditor", tags=["auditor"])
app.include_router(notifications.router, tags=["notifications"])
app.include_router(wp.router)
app.include_router(samples.router)
app.include_router(followups.router)
app.include_router(audit.router, tags=["audit"])


@app.get("/health", tags=["ops"])
@limiter.exempt
def health() -> dict[str, str]:
  return {"name": "AuditOrbit", "status": "ok"}
