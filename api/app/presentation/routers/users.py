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
  total = int(db.execute(text("SELECT count(*) FROM users")).scalar_one())
  rows = db.execute(
    text(
      """
        SELECT id, email, name, locale, tz, active
        FROM users ORDER BY created_at DESC OFFSET :offset LIMIT :limit
      """
    ),
    {"offset": (page - 1) * size, "limit": size},
  ).mappings().all()
  items = [
    UserOut(
      id=str(row["id"]),
      email=row["email"],
      name=row["name"],
      locale=row["locale"],
      tz=row["tz"],
      active=row["active"],
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
        INSERT INTO users (email, name, hashed_password)
        VALUES (:email, :name, :password)
        RETURNING id, email, name, locale, tz, active
      """
    ),
    {"email": payload.email, "name": payload.name, "password": hash_password(payload.password)},
  ).mappings().first()
  db.commit()
  if created is None:
    raise HTTPException(status_code=500, detail="Failed to create user")
  return UserOut(
    id=str(created["id"]),
    email=created["email"],
    name=created["name"],
    locale=created["locale"],
    tz=created["tz"],
    active=created["active"],
  )
