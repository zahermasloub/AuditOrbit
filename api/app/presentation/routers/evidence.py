from typing import Generator
import os
import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from ...application.dtos.evidence import (
  EvidenceConfirmIn,
  EvidenceInitIn,
  EvidenceInitOut,
  EvidenceOut,
)
from ...infrastructure.db.session import SessionLocal
from ...infrastructure.security.jwt import try_get_user_id
from ...infrastructure.security.rbac import enforce
from ...infrastructure.storage.s3 import presign_put

router = APIRouter()
_BUCKET = os.getenv("S3_BUCKET", "auditorbit")


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


@router.get("", response_model=list[EvidenceOut])
def list_evidence(
  engagement_id: str = Query(...),
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> list[EvidenceOut]:
  enforce(db, user_id, "evidence", "read")
  rows = db.execute(
    text(
      """
        SELECT
          id::text AS id,
          filename,
          mime_type,
          size_bytes,
          status,
          to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at
        FROM evidence
        WHERE engagement_id = :engagement_id
        ORDER BY created_at DESC
      """
    ),
    {"engagement_id": engagement_id},
  ).mappings()
  return [EvidenceOut(**dict(row)) for row in rows]


@router.post("/init", response_model=EvidenceInitOut)
def init_upload(
  payload: EvidenceInitIn,
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> EvidenceInitOut:
  enforce(db, user_id, "evidence", "create")
  engagement_exists = db.execute(
    text("SELECT 1 FROM engagements WHERE id = :engagement_id"),
    {"engagement_id": payload.engagement_id},
  ).scalar_one_or_none()
  if engagement_exists is None:
    raise HTTPException(status_code=404, detail="Engagement not found")

  object_key = f"eng/{payload.engagement_id}/{uuid.uuid4()}_{payload.filename}"
  row = db.execute(
    text(
      """
        INSERT INTO evidence(
          engagement_id,
          uploader_id,
          object_key,
          bucket,
          filename,
          mime_type,
          size_bytes,
          status
        )
        VALUES (:engagement_id, :uploader_id, :object_key, :bucket, :filename, :mime_type, :size_bytes, 'uploaded')
        RETURNING id::text AS id, object_key, bucket
      """
    ),
    {
      "engagement_id": payload.engagement_id,
      "uploader_id": user_id,
      "object_key": object_key,
      "bucket": _BUCKET,
      "filename": payload.filename,
      "mime_type": payload.mime_type,
      "size_bytes": payload.size_bytes,
    },
  ).mappings().first()
  if row is None:
    raise HTTPException(status_code=500, detail="Failed to initialize evidence upload")
  db.commit()

  upload_url = presign_put(_BUCKET, object_key, payload.mime_type)
  return EvidenceInitOut(
    evidence_id=row["id"],
    bucket=row["bucket"],
    object_key=row["object_key"],
    upload_url=upload_url,
  )


@router.post("/{evidence_id}/confirm", response_model=EvidenceOut)
def confirm_upload(
  evidence_id: str,
  payload: EvidenceConfirmIn,
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> EvidenceOut:
  enforce(db, user_id, "evidence", "create")
  existing = db.execute(
    text("SELECT id FROM evidence WHERE id = :id"),
    {"id": evidence_id},
  ).scalar_one_or_none()
  if existing is None:
    raise HTTPException(status_code=404, detail="Evidence not found")

  db.execute(
    text(
      """
        UPDATE evidence
        SET
          size_bytes = COALESCE(:size_bytes, size_bytes),
          mime_type = COALESCE(:mime_type, mime_type),
          status = 'uploaded'
        WHERE id = :id
      """
    ),
    {
      "id": evidence_id,
      "size_bytes": payload.size_bytes,
      "mime_type": payload.mime_type,
    },
  )
  db.commit()

  row = db.execute(
    text(
      """
        SELECT
          id::text AS id,
          filename,
          mime_type,
          size_bytes,
          status,
          to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at
        FROM evidence
        WHERE id = :id
      """
    ),
    {"id": evidence_id},
  ).mappings().first()
  if row is None:
    raise HTTPException(status_code=404, detail="Evidence not found")
  return EvidenceOut(**dict(row))
