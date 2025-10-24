from typing import Any, Optional

from pydantic import BaseModel, Field


class ReportCreateIn(BaseModel):
  engagement_id: str
  title: str = Field(min_length=3, max_length=300)
  content: Any = Field(description="JSON structure of draft report")


class ReportUpdateIn(BaseModel):
  title: Optional[str] = Field(default=None, min_length=3, max_length=300)
  content: Optional[Any] = None


class ReportActionOut(BaseModel):
  ok: bool


class ReportOut(BaseModel):
  id: str
  engagement_id: str
  version_no: int
  kind: str
  title: str
  status: str
  created_by: str
  approved_by: Optional[str] = None
  approved_at: Optional[str] = None
  created_at: str
  updated_at: str


class ReportsPage(BaseModel):
  items: list[ReportOut]
  page: int
  size: int
  total: int
