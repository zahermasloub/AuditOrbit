from __future__ import annotations

from typing import Any, Dict, Generator, List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from ...application.dtos.notifications import (
  ChannelCreate,
  NotificationCreate,
  NotificationOut,
)
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


@router.get("/notifications", response_model=Dict[str, Any])
def list_my_notifications(
  status: Optional[str] = Query(default=None, pattern=r"^(unread|read)$"),
  page: int = Query(default=1, ge=1),
  size: int = Query(default=20, ge=1, le=100),
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> Dict[str, Any]:
  where_clauses: List[str] = ["user_id = :u"]
  params: Dict[str, Any] = {"u": uid, "lim": size, "off": (page - 1) * size}

  if status:
    where_clauses.append("status = :s")
    params["s"] = status

  where_sql = " AND ".join(where_clauses)
  total = db.execute(text(f"SELECT COUNT(*) FROM notifications WHERE {where_sql}"), params).scalar()

  rows = db.execute(
    text(
      f"""
      SELECT id, user_id, kind, title, body, meta, status, created_at
      FROM notifications
      WHERE {where_sql}
      ORDER BY created_at DESC
      LIMIT :lim OFFSET :off
      """
    ),
    params,
  ).mappings()

  items: List[Dict[str, Any]] = []
  for row in rows:
    payload = dict(row)
    payload["id"] = str(payload["id"])
    payload["user_id"] = str(payload["user_id"])
    payload["created_at"] = payload["created_at"].isoformat()
    items.append(payload)

  return {
    "items": items,
    "total": int(total or 0),
    "page": page,
    "size": size,
  }


@router.post("/notifications", response_model=NotificationOut)
def create_notification(
  payload: NotificationCreate,
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> Dict[str, Any]:
  enforce(db, uid, "notifications", "create")

  row = db.execute(
    text(
      """
      INSERT INTO notifications (user_id, kind, title, body, meta)
      VALUES (:user_id, :kind, :title, :body, :meta)
      RETURNING id, user_id, kind, title, body, meta, status, created_at
      """
    ),
    {
      "user_id": payload.user_id,
      "kind": payload.kind,
      "title": payload.title,
      "body": payload.body,
      "meta": payload.meta,
    },
  ).mappings().first()
  if not row:
    db.rollback()
    raise HTTPException(status_code=500, detail="Failed to create notification")

  db.commit()

  result = dict(row)
  result["id"] = str(result["id"])
  result["user_id"] = str(result["user_id"])
  result["created_at"] = result["created_at"].isoformat()
  return result


@router.post("/notifications/{notification_id}/mark-read", response_model=Dict[str, bool])
def mark_read(
  notification_id: str,
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> Dict[str, bool]:
  owned = db.execute(
    text("SELECT 1 FROM notifications WHERE id = :nid AND user_id = :uid"),
    {"nid": notification_id, "uid": uid},
  ).scalar()

  if not owned:
    raise HTTPException(status_code=404, detail="Not found")

  db.execute(
    text("UPDATE notifications SET status = 'read' WHERE id = :nid"),
    {"nid": notification_id},
  )
  db.commit()
  return {"ok": True}


@router.get("/notification-channels", response_model=Dict[str, Any])
def list_channels(
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> Dict[str, Any]:
  rows = db.execute(
    text(
      """
      SELECT id, channel, target, enabled, created_at
      FROM notification_channels
      WHERE user_id = :uid
      ORDER BY created_at DESC
      """
    ),
    {"uid": uid},
  ).mappings()

  items: List[Dict[str, Any]] = []
  for row in rows:
    payload = dict(row)
    payload["id"] = str(payload["id"])
    payload["created_at"] = payload["created_at"].isoformat()
    items.append(payload)

  return {"items": items}


@router.post("/notification-channels", response_model=Dict[str, Any])
def add_channel(
  payload: ChannelCreate,
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> Dict[str, Any]:
  row = db.execute(
    text(
      """
      INSERT INTO notification_channels (user_id, channel, target)
      VALUES (:uid, :channel, :target)
      ON CONFLICT ON CONSTRAINT uq_notification_channels_user_channel_target DO NOTHING
      RETURNING id, channel, target, enabled, created_at
      """
    ),
    {"uid": uid, "channel": payload.channel, "target": payload.target},
  ).mappings().first()

  if not row:
    row = db.execute(
      text(
        """
        SELECT id, channel, target, enabled, created_at
        FROM notification_channels
        WHERE user_id = :uid AND channel = :channel AND target = :target
        """
      ),
      {"uid": uid, "channel": payload.channel, "target": payload.target},
    ).mappings().first()

  if not row:
    db.rollback()
    raise HTTPException(status_code=500, detail="Failed to persist notification channel")

  db.commit()

  payload_dict = dict(row)
  payload_dict["id"] = str(payload_dict["id"])
  payload_dict["created_at"] = payload_dict["created_at"].isoformat()
  return payload_dict
