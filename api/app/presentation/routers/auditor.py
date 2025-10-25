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


def _assert_assigned(db: Session, uid: str, engagement_id: str) -> None:
  has = db.execute(
    text(
      """
        SELECT 1 FROM engagement_assignments
        WHERE engagement_id=:engagement_id AND user_id=:uid
        LIMIT 1
      """
    ),
    {"engagement_id": engagement_id, "uid": uid},
  ).scalar()
  if not has:
    raise HTTPException(status_code=403, detail="not_assigned_to_engagement")


@router.get("/tasks", response_model=dict[str, Any])
def my_tasks(
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
  archived: bool = Query(default=False),
  page: int = Query(1, ge=1),
  size: int = Query(20, ge=1, le=100),
) -> Dict[str, Any]:
  enforce(db, uid, "engagements", "read_assigned")

  where = "EXISTS (SELECT 1 FROM engagement_assignments ea WHERE ea.engagement_id = e.id AND ea.user_id = :uid)"
  if archived:
    where += " AND COALESCE(e.status,'') IN ('done','closed')"
  else:
    where += " AND COALESCE(e.status,'') NOT IN ('done','closed')"

  total = db.execute(text(f"SELECT COUNT(*) FROM engagements e WHERE {where}"), {"uid": uid}).scalar()

  rows = db.execute(
    text(
      f"""
        SELECT e.id, e.title, e.start_date, e.end_date, e.status
        FROM engagements e
        WHERE {where}
        ORDER BY e.start_date NULLS LAST, e.created_at DESC
        LIMIT :limit OFFSET :offset
      """
    ),
    {"uid": uid, "limit": size, "offset": (page - 1) * size},
  ).mappings().all()

  items: List[Dict[str, Any]] = []
  for row in rows:
    data = dict(row)
    data["id"] = str(data["id"])
    if data.get("start_date"):
      data["start_date"] = data["start_date"].isoformat()
    if data.get("end_date"):
      data["end_date"] = data["end_date"].isoformat()
    items.append(data)

  return {"items": items, "page": page, "size": size, "total": int(total or 0)}


@router.post("/tasks/{engagement_id}/accept", response_model=dict[str, bool])
def accept_task(
  engagement_id: str,
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> Dict[str, bool]:
  enforce(db, uid, "engagements", "read_assigned")
  _assert_assigned(db, uid, engagement_id)

  db.execute(
    text("INSERT INTO audit_logs(actor_id, action, resource) VALUES (:uid, 'ACCEPT_TASK', :resource)"),
    {"uid": uid, "resource": f"/auditor/tasks/{engagement_id}/accept"},
  )
  db.commit()
  return {"ok": True}


@router.post("/tasks/{engagement_id}/decline", response_model=dict[str, bool])
def decline_task(
  engagement_id: str,
  reason: str | None = Query(default=None),
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> Dict[str, bool]:
  enforce(db, uid, "engagements", "read_assigned")
  _assert_assigned(db, uid, engagement_id)

  db.execute(
    text("INSERT INTO audit_logs(actor_id, action, resource) VALUES (:uid, 'DECLINE_TASK', :resource)"),
    {"uid": uid, "resource": f"/auditor/tasks/{engagement_id}/decline"},
  )
  db.commit()
  return {"ok": True}


@router.get("/engagements/{engagement_id}/checklists", response_model=dict[str, List[Dict[str, Any]]])
def my_engagement_checklists(
  engagement_id: str,
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> Dict[str, List[Dict[str, Any]]]:
  enforce(db, uid, "engagements", "read_assigned")
  _assert_assigned(db, uid, engagement_id)

  rows = db.execute(
    text(
      """
        SELECT ec.id as ec_id, c.id as checklist_id, c.name, ec.dispatched_at
        FROM engagement_checklists ec
        JOIN checklists c ON c.id = ec.checklist_id
        WHERE ec.engagement_id = :engagement_id
        ORDER BY ec.dispatched_at DESC
      """
    ),
    {"engagement_id": engagement_id},
  ).mappings().all()

  items: List[Dict[str, Any]] = []
  for row in rows:
    items.append(
      {
        "engagement_checklist_id": str(row["ec_id"]),
        "checklist_id": str(row["checklist_id"]),
        "name": row["name"],
        "dispatched_at": row["dispatched_at"].isoformat() if row["dispatched_at"] else None,
      }
    )
  return {"items": items}


@router.get("/engagements/{engagement_id}/checklists/{checklist_id}/items", response_model=dict[str, List[Dict[str, Any]]])
def checklist_items(
  engagement_id: str,
  checklist_id: str,
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> Dict[str, List[Dict[str, Any]]]:
  enforce(db, uid, "engagements", "read_assigned")
  _assert_assigned(db, uid, engagement_id)

  rows = db.execute(
    text(
      """
        SELECT i.id, i.text, i.category, i.priority, i.reference, i.created_at
        FROM checklist_items i
        WHERE i.checklist_id=:checklist_id
        ORDER BY i.created_at
      """
    ),
    {"checklist_id": checklist_id},
  ).mappings().all()

  items: List[Dict[str, Any]] = []
  for row in rows:
    data = dict(row)
    data["id"] = str(data["id"])
    data["created_at"] = data["created_at"].isoformat()
    items.append(data)
  return {"items": items}


@router.put("/checklist-items/{item_id}", response_model=dict[str, bool])
def update_checklist_item(
  item_id: str,
  engagement_id: str = Query(..., min_length=1),
  status: str | None = Query(default=None),
  note: str | None = Query(default=None),
  db: Session = Depends(get_db),
  uid: str = Depends(current_user_id),
) -> Dict[str, bool]:
  enforce(db, uid, "checklist_items", "update")
  _assert_assigned(db, uid, engagement_id)

  import json

  meta = {"status": status, "note": note, "engagement_id": engagement_id}
  db.execute(
    text(
      """
        INSERT INTO audit_logs(actor_id, action, resource, resource_id)
        VALUES (:uid, 'CHECKLIST_ITEM_UPDATE', :resource, :item_id::uuid)
      """
    ),
    {"uid": uid, "resource": f"/auditor/checklist-items/{item_id}", "item_id": item_id},
  )
  db.commit()
  return {"ok": True}
