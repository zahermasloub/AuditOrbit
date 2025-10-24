from typing import Any, List, Optional

from pydantic import BaseModel, Field


class ChecklistCreate(BaseModel):
  name: str = Field(min_length=3, max_length=200)
  department: Optional[str] = None


class ChecklistItemCreate(BaseModel):
  order_no: int = Field(ge=1)
  title: str = Field(min_length=3)
  control_ref: Optional[str] = None
  risk: Optional[str] = None


class ChecklistOut(BaseModel):
  id: str
  name: str
  department: Optional[str] = None
  version: int


class ChecklistWithItemsOut(ChecklistOut):
  items: List[Any]


class DispatchIn(BaseModel):
  engagement_id: str
  checklist_id: str


class EngagementChecklistOut(BaseModel):
  id: str
  engagement_id: str
  name: str
