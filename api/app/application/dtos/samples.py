from pydantic import BaseModel, Field
from typing import Annotated, Literal
from uuid import UUID
from datetime import datetime

SampleMethod = Literal["random", "systematic", "high_value"]
SampleSize = Annotated[int, Field(gt=0, le=100000)]


class SampleCreate(BaseModel):
    engagement_id: UUID
    method: SampleMethod
    size: SampleSize


class SampleOut(BaseModel):
    id: UUID
    engagement_id: UUID
    method: SampleMethod
    size: int
    created_at: datetime
