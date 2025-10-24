from __future__ import annotations

from typing import Any, Dict, Generator, List

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


def current_user_id(authorization: str = Header(default=None, convert_underscores=False)) -> str:
  user_id = try_get_user_id(authorization)
  if not user_id:
    raise HTTPException(status_code=401, detail="Unauthorized")
  return user_id


@router.post("/engagements/{engagement_id}/assign", response_model=dict[str, Any])
def assign_auditor(
  engagement_id: str,
  auditor_id: str = Query(..., min_length=1),
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> Dict[str, Any]:
  enforce(db, uid, "engagements", "assign")

  engagement_exists = db.execute(text("SELECT 1 FROM engagements WHERE id = :engagement_id"), {"engagement_id": engagement_id}).scalar()
  user_exists = db.execute(text("SELECT 1 FROM users WHERE id = :auditor_id"), {"auditor_id": auditor_id}).scalar()
  if not engagement_exists or not user_exists:
    raise HTTPException(status_code=404, detail="engagement_or_user_not_found")

  row = db.execute(
    text(
      """
        INSERT INTO engagement_assignments(engagement_id, user_id)
        VALUES (:engagement_id, :auditor_id)
        ON CONFLICT DO NOTHING
        RETURNING engagement_id, user_id
      """
    ),
    {"engagement_id": engagement_id, "auditor_id": auditor_id},
  ).mappings().first()
  db.commit()

  return {
    "ok": True,
    "engagement_id": engagement_id,
    "auditor_id": auditor_id,
    "created": bool(row),
  }


@router.delete("/engagements/{engagement_id}/assign", response_model=dict[str, Any])
def unassign_auditor(
  engagement_id: str,
  auditor_id: str = Query(..., min_length=1),
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> Dict[str, Any]:
  enforce(db, uid, "engagements", "assign")

  result = db.execute(
    text(
      """
        DELETE FROM engagement_assignments
        WHERE engagement_id = :engagement_id AND user_id = :auditor_id
      """
    ),
    {"engagement_id": engagement_id, "auditor_id": auditor_id},
  )
  removed = bool(getattr(result, "rowcount", 0))
  db.commit()

  return {
    "ok": True,
    "engagement_id": engagement_id,
    "auditor_id": auditor_id,
    "removed": removed,
  }


@router.get("/findings/by-engagement", response_model=dict[str, List[Dict[str, Any]]])
def findings_by_engagement(
  engagement_id: str = Query(..., min_length=1),
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> Dict[str, List[Dict[str, Any]]]:
  enforce(db, uid, "findings", "read")

  rows = db.execute(
    text(
      """
        SELECT f.id, f.check_id, f.title, f.severity, f.status, f.created_at, f.details, f.scenario_id, f.evidence_id
        FROM findings f
        JOIN evidence ev ON ev.id = f.evidence_id
        WHERE ev.engagement_id = :engagement_id
        ORDER BY f.created_at DESC
      """
    ),
    {"engagement_id": engagement_id},
  ).mappings().all()

  items: List[Dict[str, Any]] = []
  for row in rows:
    data = dict(row)
    data["id"] = str(data["id"])
    if data.get("check_id") is not None:
      data["check_id"] = str(data["check_id"])
    if data.get("scenario_id") is not None:
      data["scenario_id"] = str(data["scenario_id"])
    if data.get("evidence_id") is not None:
      data["evidence_id"] = str(data["evidence_id"])
    data["created_at"] = data["created_at"].isoformat()
    items.append(data)

  return {"items": items}
