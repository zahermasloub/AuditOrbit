from typing import Generator, List, Dict

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from ...infrastructure.db.session import SessionLocal
from ...infrastructure.security.jwt import try_get_user_id

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


@router.get("", response_model=List[Dict[str, object]])
def list_departments(
  user_id: str = Depends(current_user_id),
  db: Session = Depends(get_db),
):
  rows = db.execute(
    text(
      """
      SELECT id::text AS id, name, to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at
      FROM departments
      ORDER BY name ASC
      """
    )
  ).mappings().all()
  return [dict(r) for r in rows]
