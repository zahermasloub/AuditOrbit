from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class ManagementResponseIn(BaseModel):
  finding_id: str
  response: str = Field(min_length=2)
  action_plan: str = Field(min_length=2)
  owner_department: str
  owner_name: Optional[str] = None
  due_date: Optional[str] = None  # YYYY-MM-DD


class FollowUpCreateIn(BaseModel):
  finding_id: str
  notes: Optional[str] = None
  next_review_at: Optional[str] = None


class FollowUpUpdateIn(BaseModel):
  status: str  # open|in_progress|implemented|closed
  notes: Optional[str] = None
  next_review_at: Optional[str] = None


class FollowUpTestIn(BaseModel):
  follow_up_id: str
  approach: str
  result: str  # pass|fail + notes
  evidence: Optional[Dict[str, Any]] = None
