from typing import Optional

from pydantic import BaseModel, Field


class EvidenceInitIn(BaseModel):
  engagement_id: str
  filename: str
  mime_type: Optional[str] = None
  size_bytes: Optional[int] = Field(default=None, ge=0)


class EvidenceInitOut(BaseModel):
  evidence_id: str
  bucket: str
  object_key: str
  upload_url: str


class EvidenceConfirmIn(BaseModel):
  size_bytes: Optional[int] = Field(default=None, ge=0)
  mime_type: Optional[str] = None


class EvidenceOut(BaseModel):
  id: str
  filename: str
  mime_type: Optional[str] = None
  size_bytes: Optional[int] = None
  status: str
  created_at: str
