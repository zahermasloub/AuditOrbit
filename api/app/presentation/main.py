import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ..middlewares.audit import audit_log_middleware
from .routers import auth, checklists, engagements, evidence, roles, users

app = FastAPI(title="AuditOrbit API", version="0.2.0", docs_url="/docs", redoc_url="/redoc")
app.middleware("http")(audit_log_middleware)

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


@app.get("/health", tags=["ops"])
def health() -> dict[str, str]:
  return {"name": "AuditOrbit", "status": "ok"}
