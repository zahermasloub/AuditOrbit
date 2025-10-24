from __future__ import annotations

import json
from typing import Any, Dict, Generator

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from ...application.dtos.reports import (
  ReportActionOut,
  ReportCreateIn,
  ReportOut,
  ReportUpdateIn,
  ReportsPage,
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


def current_user_id(authorization: str = Header(default=None, convert_underscores=False)) -> str:
  user_id = try_get_user_id(authorization)
  if not user_id:
    raise HTTPException(status_code=401, detail="Unauthorized")
  return user_id


def _row_to_out(row: Dict[str, Any]) -> ReportOut:
  data: Dict[str, Any] = dict(row)
  data["id"] = str(data["id"])
  data["engagement_id"] = str(data["engagement_id"])
  if data.get("created_by"):
    data["created_by"] = str(data["created_by"])
  if data.get("approved_by"):
    data["approved_by"] = str(data["approved_by"])
  if data.get("approved_at"):
    data["approved_at"] = data["approved_at"].isoformat()
  data["created_at"] = data["created_at"].isoformat()
  data["updated_at"] = data["updated_at"].isoformat()
  return ReportOut(**data)


@router.get("", response_model=ReportsPage)
def list_reports(
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
  engagement_id: str | None = Query(default=None),
  page: int = Query(1, ge=1),
  size: int = Query(10, ge=1, le=100),
  status: str | None = Query(default=None),
) -> ReportsPage:
  enforce(db, uid, "reports", "read")

  clauses: list[str] = []
  params: Dict[str, Any] = {}
  if engagement_id:
    clauses.append("engagement_id = :engagement_id")
    params["engagement_id"] = engagement_id
  if status:
    clauses.append("status = :status")
    params["status"] = status

  where_sql = f"WHERE {' AND '.join(clauses)}" if clauses else ""
  total = db.execute(text(f"SELECT COUNT(*) FROM reports {where_sql}"), params).scalar() or 0

  rows = db.execute(
    text(
      f"""
        SELECT id, engagement_id, version_no, kind, title, status, created_by, approved_by, approved_at, created_at, updated_at
        FROM reports {where_sql}
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
      """
    ),
    {
      **params,
      "limit": size,
      "offset": (page - 1) * size,
    },
  ).mappings().all()

  items = [_row_to_out(dict(row)) for row in rows]
  return ReportsPage(items=items, page=page, size=size, total=int(total))


@router.get("/{report_id}", response_model=ReportOut)
def get_report(
  report_id: str,
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> ReportOut:
  enforce(db, uid, "reports", "read")
  row = db.execute(
    text(
      """
        SELECT id, engagement_id, version_no, kind, title, status, created_by, approved_by, approved_at, created_at, updated_at
        FROM reports
        WHERE id = :report_id
      """
    ),
    {"report_id": report_id},
  ).mappings().first()

  if row is None:
    raise HTTPException(status_code=404, detail="report_not_found")
  return _row_to_out(dict(row))


@router.post("", response_model=ReportOut)
def create_report(
  payload: ReportCreateIn,
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> ReportOut:
  enforce(db, uid, "reports", "create")
  engagement_exists = db.execute(
    text("SELECT 1 FROM engagements WHERE id = :engagement_id"),
    {"engagement_id": payload.engagement_id},
  ).scalar()
  if not engagement_exists:
    raise HTTPException(status_code=404, detail="engagement_not_found")

  next_version = db.execute(
    text(
      """
        SELECT COALESCE(MAX(version_no), 0) + 1
        FROM reports
        WHERE engagement_id = :engagement_id AND kind = 'draft'
      """
    ),
    {"engagement_id": payload.engagement_id},
  ).scalar()

  content_json = json.dumps(payload.content)
  row = db.execute(
    text(
      """
        INSERT INTO reports(engagement_id, version_no, kind, title, content, status, created_by)
        VALUES (:engagement_id, :version_no, 'draft', :title, CAST(:content AS jsonb), 'draft', :created_by)
        RETURNING id, engagement_id, version_no, kind, title, status, created_by, approved_by, approved_at, created_at, updated_at
      """
    ),
    {
      "engagement_id": payload.engagement_id,
      "title": payload.title,
      "content": content_json,
      "created_by": uid,
      "version_no": int(next_version or 1),
    },
  ).mappings().first()
  db.commit()

  if row is None:
    raise HTTPException(status_code=500, detail="report_not_saved")
  return _row_to_out(dict(row))


@router.put("/{report_id}", response_model=ReportOut)
def update_report(
  report_id: str,
  payload: ReportUpdateIn,
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> ReportOut:
  enforce(db, uid, "reports", "update")
  current = db.execute(
    text("SELECT status FROM reports WHERE id = :report_id"),
    {"report_id": report_id},
  ).mappings().first()
  if current is None:
    raise HTTPException(status_code=404, detail="report_not_found")
  if current["status"] not in ("draft", "rejected"):
    raise HTTPException(status_code=409, detail="report_locked")

  content_json = json.dumps(payload.content) if payload.content is not None else None
  db.execute(
    text(
      """
        UPDATE reports
        SET
          title = COALESCE(:title, title),
          content = CASE WHEN :content IS NULL THEN content ELSE CAST(:content AS jsonb) END,
          updated_at = now()
        WHERE id = :report_id
      """
    ),
    {"report_id": report_id, "title": payload.title, "content": content_json},
  )
  db.commit()

  updated = db.execute(
    text(
      """
        SELECT id, engagement_id, version_no, kind, title, status, created_by, approved_by, approved_at, created_at, updated_at
        FROM reports
        WHERE id = :report_id
      """
    ),
    {"report_id": report_id},
  ).mappings().first()
  if updated is None:
    raise HTTPException(status_code=404, detail="report_not_found")
  return _row_to_out(dict(updated))


@router.post("/{report_id}/submit", response_model=ReportActionOut)
def submit_report(
  report_id: str,
  comment: str | None = None,
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> ReportActionOut:
  enforce(db, uid, "reports", "submit")
  row = db.execute(
    text("SELECT status FROM reports WHERE id = :report_id"),
    {"report_id": report_id},
  ).mappings().first()
  if row is None:
    raise HTTPException(status_code=404, detail="report_not_found")
  if row["status"] not in ("draft", "rejected"):
    raise HTTPException(status_code=409, detail="invalid_state")

  db.execute(
    text("UPDATE reports SET status = 'in_review', updated_at = now() WHERE id = :report_id"),
    {"report_id": report_id},
  )
  db.execute(
    text(
      """
        INSERT INTO report_approvals(report_id, approver_id, action, comment)
        VALUES (:report_id, :uid, 'submitted', :comment)
      """
    ),
    {"report_id": report_id, "uid": uid, "comment": comment},
  )
  db.commit()
  return ReportActionOut(ok=True)


@router.post("/{report_id}/approve", response_model=ReportActionOut)
def approve_report(
  report_id: str,
  comment: str | None = None,
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> ReportActionOut:
  enforce(db, uid, "reports", "approve")
  row = db.execute(
    text("SELECT status FROM reports WHERE id = :report_id"),
    {"report_id": report_id},
  ).mappings().first()
  if row is None:
    raise HTTPException(status_code=404, detail="report_not_found")
  if row["status"] != "in_review":
    raise HTTPException(status_code=409, detail="invalid_state")

  db.execute(
    text(
      """
        UPDATE reports
        SET status = 'approved', approved_by = :uid, approved_at = now(), updated_at = now()
        WHERE id = :report_id
      """
    ),
    {"report_id": report_id, "uid": uid},
  )
  db.execute(
    text(
      """
        INSERT INTO report_approvals(report_id, approver_id, action, comment)
        VALUES (:report_id, :uid, 'approved', :comment)
      """
    ),
    {"report_id": report_id, "uid": uid, "comment": comment},
  )
  db.commit()
  return ReportActionOut(ok=True)


@router.post("/{report_id}/publish", response_model=ReportOut)
def publish_report(
  report_id: str,
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> ReportOut:
  enforce(db, uid, "reports", "publish")
  base = db.execute(
    text(
      """
        SELECT engagement_id, title, content, status
        FROM reports
        WHERE id = :report_id
      """
    ),
    {"report_id": report_id},
  ).mappings().first()
  if base is None:
    raise HTTPException(status_code=404, detail="report_not_found")
  if base["status"] not in ("approved", "published"):
    raise HTTPException(status_code=409, detail="invalid_state")

  next_version = db.execute(
    text(
      """
        SELECT COALESCE(MAX(version_no), 0) + 1
        FROM reports
        WHERE engagement_id = :engagement_id AND kind = 'final'
      """
    ),
    {"engagement_id": base["engagement_id"]},
  ).scalar()

  content_json = json.dumps(base["content"])
  final_row = db.execute(
    text(
      """
        INSERT INTO reports(engagement_id, version_no, kind, title, content, status, created_by, approved_by, approved_at)
        VALUES (:engagement_id, :version_no, 'final', :title, CAST(:content AS jsonb), 'published', :uid, :uid, now())
        RETURNING id, engagement_id, version_no, kind, title, status, created_by, approved_by, approved_at, created_at, updated_at
      """
    ),
    {
      "engagement_id": base["engagement_id"],
      "version_no": int(next_version or 1),
      "title": base["title"],
      "content": content_json,
      "uid": uid,
    },
  ).mappings().first()

  if final_row is None:
    db.rollback()
    raise HTTPException(status_code=500, detail="report_not_saved")

  db.execute(
    text(
      """
        INSERT INTO report_approvals(report_id, approver_id, action, comment)
        VALUES (:report_id, :uid, 'published', 'auto-published final version')
      """
    ),
    {"report_id": final_row["id"], "uid": uid},
  )
  db.commit()
  return _row_to_out(dict(final_row))
