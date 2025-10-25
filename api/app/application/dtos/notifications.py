from typing import Any, Optional

from pydantic import BaseModel, Field


class NotificationCreate(BaseModel):
    user_id: str
    kind: str = Field(pattern="^(report|finding|engagement|system)$")
    title: str
    body: Optional[str] = None
    meta: Optional[dict[str, Any]] = None


class NotificationOut(BaseModel):
    id: str
    user_id: str
    kind: str
    title: str
    body: Optional[str] = None
    meta: Optional[dict[str, Any]] = None
    status: str
    created_at: str


class ChannelCreate(BaseModel):
    channel: str = Field(pattern="^(email|webhook)$")
    target: str


class ChannelOut(BaseModel):
    id: str
    channel: str
    target: str
    enabled: bool
    created_at: str
