from typing import Generator

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from ...infrastructure.db.session import SessionLocal
from ...infrastructure.security.jwt import try_get_user_id
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


@router.get("")
def list_roles(db: Session = Depends(get_db), user_id: str = Depends(current_user_id)) -> list[dict[str, object]]:
  enforce(db, user_id, "roles", "read")
  rows = db.execute(text("SELECT id, name FROM roles ORDER BY id")).mappings().all()
  return [{"id": row["id"], "name": row["name"]} for row in rows]
