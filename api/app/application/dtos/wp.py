from pydantic import BaseModel, constr
from typing import Optional
from uuid import UUID
from datetime import datetime

# explicit models to keep payloads consistent across adapters
class WorkingPaperCreate(BaseModel):
    engagement_id: UUID
    wp_ref: constr(strip_whitespace=True, min_length=1, max_length=64)
    objective: constr(strip_whitespace=True, min_length=1, max_length=500)
    procedure: constr(strip_whitespace=True, min_length=1, max_length=2000)


class WorkingPaperOut(BaseModel):
    id: UUID
    engagement_id: UUID
    wp_ref: str
    objective: str
    procedure: str
    prepared_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
