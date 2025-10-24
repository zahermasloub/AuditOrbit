from typing import Generator

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from ...application.dtos.checklists import (
  ChecklistCreate,
  ChecklistItemCreate,
  ChecklistOut,
  ChecklistWithItemsOut,
  DispatchIn,
  EngagementChecklistOut,
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


@router.get("", response_model=list[ChecklistOut])
def list_checklists(
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> list[ChecklistOut]:
  enforce(db, user_id, "checklists", "read")
  rows = db.execute(
    text("SELECT id::text AS id, name, department, version FROM checklists ORDER BY created_at DESC"),
  ).mappings()
  return [ChecklistOut(**dict(row)) for row in rows]


@router.post("", response_model=ChecklistOut)
def create_checklist(
  payload: ChecklistCreate,
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> ChecklistOut:
  enforce(db, user_id, "checklists", "create")
  row = db.execute(
    text(
      """
        INSERT INTO checklists(name, department, version)
        VALUES (:name, :department, 1)
        RETURNING id::text AS id, name, department, version
      """
    ),
    {"name": payload.name, "department": payload.department},
  ).mappings().first()
  db.commit()
  if row is None:
    raise HTTPException(status_code=500, detail="Failed to create checklist")
  return ChecklistOut(**dict(row))


@router.post("/{checklist_id}/items", response_model=dict[str, bool])
def add_item(
  checklist_id: str,
  item: ChecklistItemCreate,
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> dict[str, bool]:
  enforce(db, user_id, "checklists", "update")
  db.execute(
    text(
      """
        INSERT INTO checklist_items(checklist_id, order_no, title, control_ref, risk)
        VALUES (:checklist_id, :order_no, :title, :control_ref, :risk)
      """
    ),
    {
      "checklist_id": checklist_id,
      "order_no": item.order_no,
      "title": item.title,
      "control_ref": item.control_ref,
      "risk": item.risk,
    },
  )
  db.commit()
  return {"ok": True}


@router.get("/{checklist_id}", response_model=ChecklistWithItemsOut)
def get_checklist(
  checklist_id: str,
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> ChecklistWithItemsOut:
  enforce(db, user_id, "checklists", "read")
  checklist = db.execute(
    text(
      "SELECT id::text AS id, name, department, version FROM checklists WHERE id = :checklist_id"
    ),
    {"checklist_id": checklist_id},
  ).mappings().first()
  if checklist is None:
    raise HTTPException(status_code=404, detail="Checklist not found")

  items = db.execute(
    text(
      """
        SELECT id::text AS id, order_no, title, control_ref, risk
        FROM checklist_items
        WHERE checklist_id = :checklist_id
        ORDER BY order_no
      """
    ),
    {"checklist_id": checklist_id},
  ).mappings()
  payload = dict(checklist)
  payload["items"] = [dict(item) for item in items]
  return ChecklistWithItemsOut(**payload)


@router.post("/dispatch", response_model=EngagementChecklistOut)
def dispatch(
  payload: DispatchIn,
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> EngagementChecklistOut:
  enforce(db, user_id, "checklists", "assign")

  checklist = db.execute(
    text("SELECT id, name FROM checklists WHERE id = :checklist_id"),
    {"checklist_id": payload.checklist_id},
  ).mappings().first()
  engagement = db.execute(
    text("SELECT id FROM engagements WHERE id = :engagement_id"),
    {"engagement_id": payload.engagement_id},
  ).mappings().first()

  if checklist is None or engagement is None:
    raise HTTPException(status_code=404, detail="Checklist or engagement not found")

  parent = db.execute(
    text(
      """
        INSERT INTO engagement_checklists(engagement_id, template_id, name)
        VALUES (:engagement_id, :template_id, :name)
        RETURNING id::text AS id, engagement_id::text AS engagement_id, name
      """
    ),
    {
      "engagement_id": payload.engagement_id,
      "template_id": payload.checklist_id,
      "name": checklist["name"],
    },
  ).mappings().first()
  if parent is None:
    raise HTTPException(status_code=500, detail="Failed to dispatch checklist")

  db.execute(
    text(
      """
        INSERT INTO engagement_checklist_items(engagement_checklist_id, order_no, title, status, evidence_count)
        SELECT :parent_id, i.order_no, i.title, 'pending', 0
        FROM checklist_items i
        WHERE i.checklist_id = :template_id
        ORDER BY i.order_no
      """
    ),
    {"parent_id": parent["id"], "template_id": payload.checklist_id},
  )
  db.commit()
  return EngagementChecklistOut(**dict(parent))
