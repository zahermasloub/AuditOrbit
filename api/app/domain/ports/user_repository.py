from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Protocol

from app.domain.entities.user import User


@dataclass
class PaginatedUsers:
    items: list[User]
    total: int
    page: int
    size: int


@dataclass
class NewUserData:
    email: str
    name: str
    hashed_password: str
    locale: Optional[str]
    timezone: Optional[str]
    active: Optional[bool]


@dataclass
class UpdateUserData:
    name: Optional[str] = None
    email: Optional[str] = None
    hashed_password: Optional[str] = None
    locale: Optional[str] = None
    timezone: Optional[str] = None
    active: Optional[bool] = None


class UserRepository(Protocol):
    """Persistence port for user aggregate."""

    def fetch_page(self, page: int, size: int) -> PaginatedUsers:  # pragma: no cover - interface
        raise NotImplementedError

    def get(self, user_id: str) -> Optional[User]:  # pragma: no cover - interface
        raise NotImplementedError

    def create(self, data: NewUserData) -> User:  # pragma: no cover - interface
        raise NotImplementedError

    def update(self, user_id: str, data: UpdateUserData) -> User:  # pragma: no cover - interface
        raise NotImplementedError

    def delete(self, user_id: str) -> None:  # pragma: no cover - interface
        raise NotImplementedError

    def replace_role(self, user_id: str, role_name: Optional[str]) -> Optional[str]:  # pragma: no cover
        raise NotImplementedError
