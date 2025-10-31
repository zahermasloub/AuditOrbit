from __future__ import annotations

from typing import Any, Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.domain.entities.user import User
from app.domain.ports.user_repository import (
    NewUserData,
    PaginatedUsers,
    UpdateUserData,
    UserRepository,
)


class SqlAlchemyUserRepository(UserRepository):
    """SQLAlchemy-backed implementation of the user repository port."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def fetch_page(self, page: int, size: int) -> PaginatedUsers:
        offset = (page - 1) * size
        total = int(self._session.execute(text("SELECT count(*) FROM users")) .scalar_one())
        rows = self._session.execute(
            text(
                """
                SELECT
                    u.id::text AS id,
                    u.email,
                    u.name,
                    COALESCE(r.name, 'User') AS role,
                    u.locale,
                    u.tz AS timezone,
                    u.active,
                    to_char(u."createdAt", 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at,
                    to_char(u."updatedAt", 'YYYY-MM-DD"T"HH24:MI:SSOF') AS updated_at
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur."userId"
                LEFT JOIN roles r ON ur."roleId" = r.id
                ORDER BY u."createdAt" DESC
                OFFSET :offset LIMIT :limit
                """
            ),
            {"offset": offset, "limit": size},
        ).mappings().all()
        items = [self._map_row(row) for row in rows]
        return PaginatedUsers(items=items, total=total, page=page, size=size)

    def get(self, user_id: str) -> Optional[User]:
        row = self._session.execute(
            text(
                """
                SELECT
                    u.id::text AS id,
                    u.email,
                    u.name,
                    COALESCE(r.name, 'User') AS role,
                    u.locale,
                    u.tz AS timezone,
                    u.active,
                    to_char(u."createdAt", 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at,
                    to_char(u."updatedAt", 'YYYY-MM-DD"T"HH24:MI:SSOF') AS updated_at
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur."userId"
                LEFT JOIN roles r ON ur."roleId" = r.id
                WHERE u.id::text = :user_id
                LIMIT 1
                """
            ),
            {"user_id": user_id},
        ).mappings().first()
        return self._map_row(row) if row else None

    def create(self, data: NewUserData) -> User:
        result = self._session.execute(
            text(
                """
                INSERT INTO users (email, name, password, locale, tz, active, "createdAt", "updatedAt")
                VALUES (:email, :name, :password, :locale, :timezone, :active, now(), now())
                RETURNING
                    id::text AS id,
                    email,
                    name,
                    NULL::text AS role,
                    locale,
                    tz AS timezone,
                    active,
                    to_char("createdAt", 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at,
                    to_char("updatedAt", 'YYYY-MM-DD"T"HH24:MI:SSOF') AS updated_at
                """
            ),
            {
                "email": data.email,
                "name": data.name,
                "password": data.hashed_password,
                "locale": data.locale or "ar",
                "timezone": data.timezone or "UTC",
                "active": True if data.active is None else data.active,
            },
        ).mappings().first()
        if result is None:
            raise RuntimeError("Failed to insert user")
        self._session.commit()
        return self._map_row(result)

    def update(self, user_id: str, data: UpdateUserData) -> User:
        update_fields: list[str] = []
        params: dict[str, Any] = {"user_id": user_id}

        if data.name is not None:
            update_fields.append("name = :name")
            params["name"] = data.name
        if data.email is not None:
            update_fields.append("email = :email")
            params["email"] = data.email
        if data.hashed_password is not None:
            update_fields.append("password = :password")
            params["password"] = data.hashed_password
        if data.locale is not None:
            update_fields.append("locale = :locale")
            params["locale"] = data.locale
        if data.timezone is not None:
            update_fields.append("tz = :timezone")
            params["timezone"] = data.timezone
        if data.active is not None:
            update_fields.append("active = :active")
            params["active"] = data.active

        if not update_fields:
            raise ValueError("No mutable fields were provided")

        update_fields.append('"updatedAt" = now()')

        query = f"""
            UPDATE users
            SET {', '.join(update_fields)}
            WHERE id::text = :user_id
            RETURNING
                id::text AS id,
                email,
                name,
                NULL::text AS role,
                locale,
                tz AS timezone,
                active,
                to_char("createdAt", 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at,
                to_char("updatedAt", 'YYYY-MM-DD"T"HH24:MI:SSOF') AS updated_at
        """
        result = self._session.execute(text(query), params).mappings().first()
        if result is None:
            self._session.rollback()
            raise LookupError("User not found")
        self._session.commit()
        return self._map_row(result)

    def delete(self, user_id: str) -> None:
        deleted = self._session.execute(
            text("DELETE FROM users WHERE id::text = :user_id"), {"user_id": user_id}
        ).rowcount
        if not deleted:
            self._session.rollback()
            raise LookupError("User not found")
        self._session.commit()

    def replace_role(self, user_id: str, role_name: Optional[str]) -> Optional[str]:
        self._session.execute(
            text('DELETE FROM user_roles WHERE "userId"::text = :user_id'), {"user_id": user_id}
        )
        assigned_role: Optional[str] = None
        if role_name:
            role_id = self._session.execute(
                text("SELECT id::text FROM roles WHERE name = :role_name"), {"role_name": role_name}
            ).scalar_one_or_none()
            if role_id:
                self._session.execute(
                    text('INSERT INTO user_roles ("userId", "roleId") VALUES (:user_id, :role_id)'),
                    {"user_id": user_id, "role_id": role_id},
                )
                assigned_role = role_name
        self._session.commit()
        return assigned_role

    @staticmethod
    def _map_row(row: Any) -> User:
        return User(
            id=row.get("id"),
            email=row.get("email"),
            name=row.get("name"),
            role=row.get("role"),
            locale=row.get("locale"),
            timezone=None,
            active=row.get("active"),
            created_at=row.get("created_at"),
            updated_at=row.get("updated_at"),
        )
