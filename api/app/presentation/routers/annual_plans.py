from typing import Generator, List, Optional, Dict

from fastapi import APIRouter, Depends, Header, HTTPException, Query
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
def list_annual_plans(
  year: Optional[int] = Query(default=None),
  status: Optional[str] = Query(default=None),
  user_id: str = Depends(current_user_id),
  db: Session = Depends(get_db),
):
  filters: List[str] = []
  params: Dict[str, object] = {}
  if year is not None:
    filters.append("year = :year")
    params["year"] = year
  if status is not None:
    filters.append("status = :status")
    params["status"] = status
  where_sql = f"WHERE {' AND '.join(filters)}" if filters else ""

  rows = db.execute(
    text(
      f"""
      SELECT
        id::text AS id,
        year,
        title,
        status,
        to_char(start_date, 'YYYY-MM-DD') AS start_date,
        to_char(end_date, 'YYYY-MM-DD') AS end_date,
        to_char(vacation_start_date, 'YYYY-MM-DD') AS vacation_start_date,
        to_char(vacation_end_date, 'YYYY-MM-DD') AS vacation_end_date,
        to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at
      FROM annual_plans
      {where_sql}
      ORDER BY year DESC
      """
    ),
    params,
  ).mappings().all()
  return [dict(r) for r in rows]


@router.get("/active", response_model=Dict[str, object])
def get_active_plan(
  user_id: str = Depends(current_user_id),
  db: Session = Depends(get_db),
):
  row = db.execute(
    text(
      """
      SELECT
        id::text AS id,
        year,
        title,
        status,
        to_char(start_date, 'YYYY-MM-DD') AS start_date,
        to_char(end_date, 'YYYY-MM-DD') AS end_date,
        to_char(vacation_start_date, 'YYYY-MM-DD') AS vacation_start_date,
        to_char(vacation_end_date, 'YYYY-MM-DD') AS vacation_end_date,
        to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at
      FROM annual_plans
      WHERE status != 'archived'
      ORDER BY year DESC, created_at DESC
      LIMIT 1
      """
    )
  ).mappings().first()
  if not row:
    # Return a minimal fallback instead of 404 to prevent UI breakage
    from datetime import datetime
    current_year = datetime.now().year
    return {
      "id": None,
      "year": current_year,
      "title": f"خطة افتراضية {current_year}",
      "status": "draft",
      "start_date": None,
      "end_date": None,
      "vacation_start_date": None,
      "vacation_end_date": None,
      "created_at": None,
    }
  return dict(row)
