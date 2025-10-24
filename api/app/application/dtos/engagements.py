from typing import Any, Optional

from pydantic import BaseModel, Field


class EngagementCreate(BaseModel):
  annual_plan_year: int = Field(ge=2000, le=2100)
  title: str = Field(min_length=3, max_length=200)
  scope: Optional[str] = None
  risk_rating: Optional[str] = Field(default=None)


class EngagementOut(BaseModel):
  id: str
  annual_plan_id: str
  title: str
  scope: Optional[str] = None
  risk_rating: Optional[str] = None
  status: str
  start_date: Optional[str] = None
  end_date: Optional[str] = None
  created_at: str


class PageOut(BaseModel):
  items: list[Any]
  page: int
  size: int
  total: int
