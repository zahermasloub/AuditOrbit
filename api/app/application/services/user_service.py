from __future__ import annotations

from typing import Optional

from app.application.dtos.users import PageOut, UserCreate, UserOut, UserUpdate
from app.application.exceptions import ConflictError, NotFoundError, ValidationError
from app.domain.entities.user import User
from app.domain.ports.password_hasher import PasswordHasher
from app.domain.ports.user_repository import NewUserData, UpdateUserData, UserRepository


class UserService:
    """Application service orchestrating user-related use cases."""

    def __init__(self, repository: UserRepository, password_hasher: PasswordHasher) -> None:
        self._repository = repository
        self._password_hasher = password_hasher

    def list_users(self, page: int, size: int) -> PageOut:
        result = self._repository.fetch_page(page, size)
        items = [self._to_user_out(user) for user in result.items]
        return PageOut(items=items, page=result.page, size=result.size, total=result.total)

    def create_user(self, payload: UserCreate) -> UserOut:
        hashed_password = self._password_hasher.hash(payload.password)
        user = self._repository.create(
            NewUserData(
                email=payload.email,
                name=payload.name,
                hashed_password=hashed_password,
                locale=payload.locale,
                timezone=payload.timezone,
                active=payload.active,
            )
        )
        role_name = payload.role or "User"
        assigned_role = self._repository.replace_role(user.id, role_name)
        # Re-fetch to capture any default role if assignment failed.
        user = self._repository.get(user.id) or user
        if assigned_role:
            user.role = assigned_role
        else:
            user.role = role_name
        return self._to_user_out(user)

    def update_user(self, user_id: str, payload: UserUpdate) -> UserOut:
        existing = self._repository.get(user_id)
        if existing is None:
            raise NotFoundError("User not found")

        update_data = self._prepare_update_data(payload)
        if update_data is None:
            raise ValidationError("No fields to update")

        try:
            user = self._repository.update(user_id, update_data)
        except LookupError as exc:  # repository indicates missing user
            raise NotFoundError("User not found") from exc
        except ValueError as exc:
            raise ValidationError(str(exc)) from exc

        if payload.role is not None:
            assigned_role = self._repository.replace_role(user_id, payload.role)
            user = self._repository.get(user_id) or user
            if assigned_role:
                user.role = assigned_role
        else:
            user.role = user.role or existing.role
        return self._to_user_out(user)

    def delete_user(self, user_id: str, acting_user_id: str) -> None:
        if user_id == acting_user_id:
            raise ConflictError("Cannot delete your own account")
        try:
            self._repository.delete(user_id)
        except LookupError as exc:
            raise NotFoundError("User not found") from exc

    def _prepare_update_data(self, payload: UserUpdate) -> Optional[UpdateUserData]:
        data = UpdateUserData()
        has_any = False

        if payload.name is not None:
            data.name = payload.name
            has_any = True
        if payload.email is not None:
            data.email = payload.email
            has_any = True
        if payload.password is not None:
            data.hashed_password = self._password_hasher.hash(payload.password)
            has_any = True
        if payload.locale is not None:
            data.locale = payload.locale
            has_any = True
        if payload.timezone is not None:
            data.timezone = payload.timezone
            has_any = True
        if payload.active is not None:
            data.active = payload.active
            has_any = True

        return data if has_any else None

    @staticmethod
    def _to_user_out(user: User) -> UserOut:
        return UserOut(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            locale=user.locale,
            timezone=user.timezone,
            active=user.active,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )
