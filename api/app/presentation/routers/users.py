from typing import Generator

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from ...application.dtos.users import PageOut, UserCreate, UserOut
from ...infrastructure.db.session import SessionLocal
from ...infrastructure.security.jwt import try_get_user_id
from ...infrastructure.security.passwords import hash_password
from ...infrastructure.security.rbac import enforce

router = APIRouter()


def get_db() -> Generator[Session, None, None]:
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()


def current_user_id(authorization: str = Header(default=None, convert_underscores=False)) -> str:
  user_id = try_get_user_id(authorization)
  if not user_id:
    raise HTTPException(status_code=401, detail="Unauthorized")
  return user_id


@router.get("", response_model=PageOut)
def list_users(
  page: int = Query(1, ge=1),
  size: int = Query(20, ge=1, le=100),
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> PageOut:
  enforce(db, user_id, "users", "read")
  total = int(db.execute(text('SELECT count(*) FROM users')).scalar_one())
  rows = db.execute(
    text(
      """
        SELECT
          id::text AS id,
          email,
          name,
          role,
          locale,
          to_char("createdAt", 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at,
          to_char("updatedAt", 'YYYY-MM-DD"T"HH24:MI:SSOF') AS updated_at
        FROM users
        ORDER BY "createdAt" DESC
        OFFSET :offset LIMIT :limit
      """
    ),
    {"offset": (page - 1) * size, "limit": size},
  ).mappings().all()
  items = [
    UserOut(
      id=row["id"],
      email=row["email"],
      name=row["name"],
      role=row.get("role"),
      locale=row.get("locale"),
      timezone=None,
      active=None,
      created_at=row.get("created_at"),
      updated_at=row.get("updated_at"),
    )
    for row in rows
  ]
  return PageOut(items=items, page=page, size=size, total=total)


@router.post("", response_model=UserOut)
def create_user(
  payload: UserCreate,
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> UserOut:
  enforce(db, user_id, "users", "create")
  created = db.execute(
    text(
      """
        INSERT INTO users (email, name, password, role, locale, "createdAt", "updatedAt")
        VALUES (:email, :name, :password, :role, :locale, now(), now())
        RETURNING
          id::text AS id,
          email,
          name,
          role,
          locale,
          to_char("createdAt", 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at,
          to_char("updatedAt", 'YYYY-MM-DD"T"HH24:MI:SSOF') AS updated_at
      """
    ),
    {
      "email": payload.email,
      "name": payload.name,
      "password": hash_password(payload.password),
      "role": payload.role or "User",
      "locale": payload.locale or "ar",
    },
  ).mappings().first()
  db.commit()
  if created is None:
    raise HTTPException(status_code=500, detail="Failed to create user")
  return UserOut(
    id=created["id"],
    email=created["email"],
    name=created["name"],
    role=created.get("role"),
    locale=created.get("locale"),
    timezone=None,
    active=None,
    created_at=created.get("created_at"),
    updated_at=created.get("updated_at"),
  )
