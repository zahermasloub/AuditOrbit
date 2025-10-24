from datetime import datetime, timezone
from typing import Awaitable, Callable

from sqlalchemy import text
from starlette.requests import Request
from starlette.responses import Response

from ..infrastructure.db.session import SessionLocal
from ..infrastructure.security.jwt import try_get_user_id


async def audit_log_middleware(request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
  """Record a minimal audit trail for every request."""
  user_id = try_get_user_id(request.headers.get("Authorization"))
  response = await call_next(request)
  db = None
  try:
    db = SessionLocal()
    db.execute(
      text(
        """
        INSERT INTO audit_logs(actor_id, action, resource, resource_id, at, ip)
        VALUES (:actor_id, :action, :resource, NULL, :at, :ip)
        """
      ),
      {
        "actor_id": user_id,
        "action": request.method,
        "resource": request.url.path,
        "at": datetime.now(timezone.utc),
        "ip": request.client.host if request.client else None,
      },
    )
    db.commit()
  except Exception:
    if db is not None:
      db.rollback()
  finally:
    if db is not None:
      db.close()
  return response
