from fastapi import FastAPI

from ..middlewares.audit import audit_log_middleware
from .routers import auth, roles, users

app = FastAPI(title="AuditOrbit API", version="0.1.0", docs_url="/docs", redoc_url="/redoc")
app.middleware("http")(audit_log_middleware)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(roles.router, prefix="/roles", tags=["roles"])


@app.get("/health", tags=["ops"])
def health() -> dict[str, str]:
  return {"name": "AuditOrbit", "status": "ok"}
