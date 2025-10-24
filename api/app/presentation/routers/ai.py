from typing import Generator

import redis
from fastapi import APIRouter, Depends, Header, HTTPException
from rq import Queue
from sqlalchemy import text
from sqlalchemy.orm import Session

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


@router.post("/extract/{evidence_id}")
def trigger_extract(
  evidence_id: str,
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> dict[str, object]:
  enforce(db, user_id, "evidence", "read")

  exists = db.execute(text("SELECT 1 FROM evidence WHERE id = :id"), {"id": evidence_id}).scalar()
  if not exists:
    raise HTTPException(status_code=404, detail="Evidence not found")

  redis_conn = redis.from_url(_REDIS_URL)
  queue = Queue(_QUEUE_NAME, connection=redis_conn)
  job = queue.enqueue("worker.tasks.extract_evidence", evidence_id)

  db.execute(text("UPDATE evidence SET status = 'processing' WHERE id = :id"), {"id": evidence_id})
  db.commit()

  return {"queued": True, "job_id": job.id}


@router.get("/extractions")
def get_extractions(
  evidence_id: str | None = None,
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> dict[str, object]:
  enforce(db, user_id, "evidence", "read")

  if evidence_id:
    rows = db.execute(
      text(
        """
          SELECT id::text AS id,
                 to_char(extracted_at, 'YYYY-MM-DD""T""HH24:MI:SSOF') AS extracted_at,
                 source_type,
                 confidence,
                 json_payload
          FROM evidence_extractions
          WHERE evidence_id = :evidence_id
          ORDER BY extracted_at DESC
          LIMIT 5
        """
      ),
      {"evidence_id": evidence_id},
    ).mappings()
  else:
    rows = db.execute(
      text(
        """
          SELECT id::text AS id,
                 to_char(extracted_at, 'YYYY-MM-DD""T""HH24:MI:SSOF') AS extracted_at,
                 source_type,
                 confidence,
                 json_payload
          FROM evidence_extractions
          ORDER BY extracted_at DESC
          LIMIT 50
        """
      )
    ).mappings()

  items = [dict(row) for row in rows]
  return {"items": items}
