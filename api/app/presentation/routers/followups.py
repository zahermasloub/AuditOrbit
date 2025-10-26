from __future__ import annotations

import json
from typing import Any, Dict, Generator, Optional, cast

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.engine import CursorResult

from ...application.dtos.followups import (
  FollowUpCreateIn,
  FollowUpTestIn,
  FollowUpUpdateIn,
  ManagementResponseIn,
)
from ...infrastructure.db.session import SessionLocal
from ...infrastructure.security.jwt import try_get_user_id
from ...infrastructure.security.rbac import enforce

router = APIRouter(prefix="/followups", tags=["followups"])


def get_db() -> Generator[Session, None, None]:
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()


def current_user_id(authorization: str = Header(default=None, convert_underscores=False)) -> str:
  user_id = try_get_user_id(authorization)
  if not user_id:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="unauthorized")
  return user_id


@router.post("/management-response")
def create_management_response(
  payload: ManagementResponseIn,
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> Dict[str, str]:
  enforce(db, uid, "management_responses", "create")

  row = db.execute(
    text(
      """
        INSERT INTO management_responses (finding_id, response, action_plan, owner_department, owner_name, due_date)
        VALUES (:finding_id, :response, :action_plan, :owner_department, :owner_name, CAST(:due AS date))
        RETURNING id
      """
    ),
    {
      "finding_id": payload.finding_id,
      "response": payload.response,
      "action_plan": payload.action_plan,
      "owner_department": payload.owner_department,
      "owner_name": payload.owner_name,
      "due": payload.due_date,
    },
  ).first()

  if row is None:
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="create_failed")

  db.commit()
  return {"id": str(row[0])}


@router.post("")
def create_follow_up(
  payload: FollowUpCreateIn,
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> Dict[str, str]:
  enforce(db, uid, "followups", "create")

  row = db.execute(
    text(
      """
        INSERT INTO follow_ups (finding_id, notes, next_review_at)
        VALUES (:finding_id, :notes, CAST(:next_review_at AS date))
        RETURNING id, status
      """
    ),
    {
      "finding_id": payload.finding_id,
      "notes": payload.notes,
      "next_review_at": payload.next_review_at,
    },
  ).mappings().first()

  if row is None:
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="create_failed")

  db.commit()
  return {"id": str(row["id"]), "status": row["status"]}


def _serialize_followup(row: Dict[str, Any]) -> Dict[str, Any]:
  data = dict(row)
  data["id"] = str(data["id"])
  data["finding_id"] = str(data["finding_id"])
  if data.get("next_review_at"):
    data["next_review_at"] = data["next_review_at"].isoformat()
  data["created_at"] = data["created_at"].isoformat()
  return data


@router.get("")
def list_followups(
  finding_id: Optional[str] = Query(default=None),
  status_filter: Optional[str] = Query(default=None, alias="status"),
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> Dict[str, Any]:
  enforce(db, uid, "followups", "read")

  clauses: list[str] = []
  params: Dict[str, Any] = {}
  if finding_id:
    clauses.append("finding_id = :finding_id")
    params["finding_id"] = finding_id
  if status_filter:
    clauses.append("status = :status")
    params["status"] = status_filter

  where_sql = f"WHERE {' AND '.join(clauses)}" if clauses else ""

  rows = db.execute(
    text(
      f"""
        SELECT id, finding_id, status, next_review_at, notes, created_at
        FROM follow_ups
        {where_sql}
        ORDER BY created_at DESC
        LIMIT 200
      """
    ),
    params,
  ).mappings().all()

  items = [_serialize_followup(dict(row)) for row in rows]
  return {"items": items}


@router.patch("/{follow_up_id}")
def update_follow_up(
  follow_up_id: str,
  payload: FollowUpUpdateIn,
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> Dict[str, str]:
  enforce(db, uid, "followups", "update")

  result = db.execute(
    text(
      """
        UPDATE follow_ups
        SET status = :status, notes = :notes, next_review_at = CAST(:next_review_at AS date)
        WHERE id = :id
      """
    ),
    {
      "status": payload.status,
      "notes": payload.notes,
      "next_review_at": payload.next_review_at,
      "id": follow_up_id,
    },
  )

  if cast(CursorResult[Any], result).rowcount == 0:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="followup_not_found")

  db.commit()
  return {"id": follow_up_id, "status": payload.status}


@router.post("/tests")
def add_follow_up_test(
  payload: FollowUpTestIn,
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> Dict[str, str]:
  enforce(db, uid, "followup_tests", "create")

  evidence_json = json.dumps(payload.evidence) if payload.evidence is not None else None

  row = db.execute(
    text(
      """
        INSERT INTO follow_up_tests (follow_up_id, tester_id, approach, result, evidence)
        VALUES (:follow_up_id, :tester_id, :approach, :result, CAST(:evidence AS jsonb))
        RETURNING id
      """
    ),
    {
      "follow_up_id": payload.follow_up_id,
      "tester_id": uid,
      "approach": payload.approach,
      "result": payload.result,
      "evidence": evidence_json,
    },
  ).first()

  if row is None:
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="create_failed")

  db.commit()
  return {"id": str(row[0])}
