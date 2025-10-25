from __future__ import annotations

from typing import Any, Dict, Generator, List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from ...infrastructure.db.session import SessionLocal
from ...infrastructure.security.jwt import try_get_user_id
from ...infrastructure.security.rbac import enforce

router = APIRouter()


def get_db() -> Generator[Session, None, None]:
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()


def current_user_id(authorization: Optional[str] = Header(default=None)) -> str:
  uid = try_get_user_id(authorization)
  if not uid:
    raise HTTPException(status_code=401, detail="Unauthorized")
  return uid


@router.get("/audit-logs", response_model=Dict[str, Any])
def list_audit_logs(
  actor_id: Optional[str] = Query(default=None),
  action: Optional[str] = Query(default=None),
  resource_like: Optional[str] = Query(default=None),
  page: int = Query(default=1, ge=1),
  size: int = Query(default=20, ge=1, le=100),
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> Dict[str, Any]:
  enforce(db, uid, "audit_logs", "read")

  where_clauses: List[str] = ["1=1"]
  params: Dict[str, Any] = {"lim": size, "off": (page - 1) * size}

  if actor_id:
    where_clauses.append("actor_id = :actor")
    params["actor"] = actor_id

  if action:
    where_clauses.append("action = :act")
    params["act"] = action

  if resource_like:
    where_clauses.append("resource ILIKE :res")
    params["res"] = f"%{resource_like}%"

  where_sql = " AND ".join(where_clauses)

  total = db.execute(text(f"SELECT COUNT(*) FROM audit_logs WHERE {where_sql}"), params).scalar()

  rows = db.execute(
    text(
      f"""
      SELECT id, actor_id, action, resource, meta, at
      FROM audit_logs
      WHERE {where_sql}
      ORDER BY at DESC
      LIMIT :lim OFFSET :off
      """
    ),
    params,
  ).mappings()

  items: List[Dict[str, Any]] = []
  for row in rows:
    payload = dict(row)
    payload["id"] = int(payload["id"])
    payload["actor_id"] = str(payload["actor_id"]) if payload["actor_id"] else None
    payload["at"] = payload["at"].isoformat()
    items.append(payload)

  return {
    "items": items,
    "total": int(total or 0),
    "page": page,
    "size": size,
  }
