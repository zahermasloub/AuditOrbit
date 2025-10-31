from dataclasses import dataclass
from typing import Optional


@dataclass
class User:
    """Domain representation of a user record."""

    id: str
    email: str
    name: str
    role: Optional[str]
    locale: Optional[str]
    timezone: Optional[str]
    active: Optional[bool]
    created_at: Optional[str]
    updated_at: Optional[str]
