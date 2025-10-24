from typing import Any, Dict, Generator, List

import redis
from fastapi import APIRouter, Depends, Header, HTTPException, Query
from rq import Queue  # type: ignore[import-not-found]
from sqlalchemy import text
from sqlalchemy.orm import Session

from ...application.dtos.ai_compare import (
  FindingOut,
  RegulationChunkIn,
  RegulationIn,
  ScenarioIn,
)
from ...infrastructure.db.session import SessionLocal
from ...infrastructure.security.jwt import try_get_user_id
from ...infrastructure.security.rbac import enforce

router = APIRouter()
_REDIS_URL = "redis://redis:6379/0"
_QUEUE_NAME = "ai-tasks"


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


@router.post("/regulations", response_model=Dict[str, Any])
def create_regulation(
  payload: RegulationIn,
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> Dict[str, Any]:
  enforce(db, user_id, "regulations", "create")
  row = db.execute(
    text(
      """
        INSERT INTO regulations(name, version)
        VALUES (:name, :version)
        RETURNING id, name, version
      """
    ),
    {"name": payload.name, "version": payload.version},
  ).mappings().first()
  db.commit()
  if row is None:
    raise HTTPException(status_code=500, detail="regulation_not_saved")
  return {"id": str(row["id"]), "name": row["name"], "version": row["version"]}


@router.post("/regulations/chunks", response_model=Dict[str, str])
def add_regulation_chunk(
  payload: RegulationChunkIn,
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> Dict[str, str]:
  enforce(db, user_id, "regulations", "create")
  inserted = db.execute(
    text(
      """
        INSERT INTO regulation_chunks(regulation_id, section_ref, text, metadata)
        VALUES (:regulation_id, :section_ref, :text, '{}'::jsonb)
        RETURNING id
      """
    ),
    {"regulation_id": payload.regulation_id, "section_ref": payload.section_ref, "text": payload.text},
  ).mappings().first()
  db.commit()
  if inserted is None:
    raise HTTPException(status_code=500, detail="chunk_not_saved")
  return {"id": str(inserted["id"])}


@router.get("/regulations", response_model=List[Dict[str, str]])
def list_regulations(
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> List[Dict[str, str]]:
  enforce(db, user_id, "regulations", "read")
  rows = (
    db.execute(text("SELECT id, name, version FROM regulations ORDER BY created_at DESC"))
    .mappings()
    .all()
  )
  return [{"id": str(row["id"]), "name": row["name"], "version": row["version"]} for row in rows]


@router.post("/scenarios", response_model=Dict[str, str])
def create_scenario(
  payload: ScenarioIn,
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> Dict[str, str]:
  import json
  enforce(db, user_id, "scenarios", "create")
  saved = db.execute(
    text(
      """
        INSERT INTO comparison_scenarios(name, description, rules)
        VALUES (:name, :description, CAST(:rules AS jsonb))
        RETURNING id, name
      """
    ),
    {"name": payload.name, "description": payload.description, "rules": json.dumps(payload.rules)},
  ).mappings().first()
  db.commit()
  if saved is None:
    raise HTTPException(status_code=500, detail="scenario_not_saved")
  return {"id": str(saved["id"]), "name": saved["name"]}


@router.get("/scenarios", response_model=List[Dict[str, Any]])
def list_scenarios(
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> List[Dict[str, Any]]:
  enforce(db, user_id, "scenarios", "read")
  rows = (
    db.execute(text("SELECT id, name, description, created_at FROM comparison_scenarios ORDER BY created_at DESC"))
    .mappings()
    .all()
  )
  return [
    {
      "id": str(row["id"]),
      "name": row["name"],
      "description": row["description"],
      "created_at": row["created_at"].isoformat() if row["created_at"] else None,
    }
    for row in rows
  ]


@router.post("/compare", response_model=Dict[str, Any])
def enqueue_compare(
  evidence_id: str = Query(..., min_length=1),
  scenario_id: str = Query(..., min_length=1),
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> Dict[str, Any]:
  enforce(db, user_id, "evidence", "read")
  enforce(db, user_id, "scenarios", "read")

  evidence_exists = db.execute(text("SELECT 1 FROM evidence WHERE id = :id"), {"id": evidence_id}).scalar()
  scenario_exists = db.execute(
    text("SELECT 1 FROM comparison_scenarios WHERE id = :id"),
    {"id": scenario_id},
  ).scalar()
  if not evidence_exists or not scenario_exists:
    raise HTTPException(status_code=404, detail="not_found")

  redis_conn = redis.from_url(_REDIS_URL)  # type: ignore[misc]
  queue = Queue(_QUEUE_NAME, connection=redis_conn)  # type: ignore[misc]
  job = queue.enqueue("worker.compare_task.run_compare", evidence_id, scenario_id)  # type: ignore[misc]
  return {"queued": True, "job_id": job.id}


@router.get("/findings", response_model=Dict[str, List[FindingOut]])
def list_findings(
  evidence_id: str,
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> Dict[str, List[FindingOut]]:
  enforce(db, user_id, "findings", "read")
  rows = (
    db.execute(
      text(
        """
          SELECT id, evidence_id, scenario_id, check_id, title, severity, status, details, created_at
          FROM findings
          WHERE evidence_id = :evidence_id
          ORDER BY created_at DESC
        """
      ),
      {"evidence_id": evidence_id},
    )
    .mappings()
    .all()
  )

  items: List[FindingOut] = [
    FindingOut(
      id=str(row["id"]),
      evidence_id=str(row["evidence_id"]),
      scenario_id=str(row["scenario_id"]),
      check_id=row["check_id"],
      title=row["title"],
  severity=str(row["severity"]),
      status=row["status"],
      details=row["details"],
      created_at=row["created_at"].isoformat() if row["created_at"] else "",
    )
    for row in rows
  ]
  return {"items": items}
