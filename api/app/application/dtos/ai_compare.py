from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class RegulationIn(BaseModel):
  name: str = Field(min_length=2, max_length=200)
  version: Optional[str] = "v1"


class RegulationChunkIn(BaseModel):
  regulation_id: str
  section_ref: Optional[str] = None
  text: str


class ScenarioIn(BaseModel):
  name: str = Field(min_length=2, max_length=200)
  description: Optional[str] = None
  rules: Dict[str, Any]


class FindingOut(BaseModel):
  id: str
  evidence_id: str
  scenario_id: str
  check_id: str
  title: str
  severity: str
  status: str
  details: Any
  created_at: str
