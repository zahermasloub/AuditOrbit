import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from ..middlewares.audit import audit_log_middleware
from .middlewares.rate_limit import limiter
from .middlewares.security import SecurityHeadersMiddleware
from .routers import (
  ai,
  audit,
  auditor,
  auth,
  checklists,
  compare,
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

app = FastAPI(title="AuditOrbit API", version="0.2.0", docs_url="/docs", redoc_url="/redoc")
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SecurityHeadersMiddleware)
app.middleware("http")(audit_log_middleware)

raw_origins = os.getenv("WEB_ORIGINS")
if raw_origins:
  origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
else:
  origins = [os.getenv("WEB_ORIGIN", "http://localhost:3000")]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(roles.router, prefix="/roles", tags=["roles"])
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
def health() -> dict[str, str]:
  return {"name": "AuditOrbit", "status": "ok"}
