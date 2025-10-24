from typing import Generator

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from ...application.dtos.engagements import EngagementCreate, EngagementOut, PageOut
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


@router.get("", response_model=PageOut)
def list_engagements(
  page: int = Query(1, ge=1),
  size: int = Query(10, ge=1, le=100),
  status: str | None = Query(default=None),
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> PageOut:
  enforce(db, user_id, "engagements", "read")

  filters: list[str] = []
  params: dict[str, object] = {"offset": (page - 1) * size, "limit": size}
  total_params: dict[str, object] = {}
  if status:
    filters.append("e.status = :status")
    params["status"] = status
    total_params["status"] = status

  where_sql = ""
  if filters:
    where_sql = "WHERE " + " AND ".join(filters)

  total_query = f"SELECT count(*) FROM engagements e {where_sql}"
  total = int(db.execute(text(total_query), total_params).scalar_one())

  rows = db.execute(
    text(
      f"""
        SELECT
          e.id::text AS id,
          e.annual_plan_id::text AS annual_plan_id,
          e.title,
          e.scope,
          e.risk_rating,
          e.status,
          to_char(e.start_date, 'YYYY-MM-DD') AS start_date,
          to_char(e.end_date, 'YYYY-MM-DD') AS end_date,
          to_char(e.created_at, 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at
        FROM engagements e
        {where_sql}
        ORDER BY e.created_at DESC
        OFFSET :offset LIMIT :limit
      """
    ),
    params,
  ).mappings().all()

  items = [EngagementOut(**dict(row)) for row in rows]
  return PageOut(items=items, page=page, size=size, total=total)


@router.post("", response_model=EngagementOut)
def create_engagement(
  payload: EngagementCreate,
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> EngagementOut:
  enforce(db, user_id, "engagements", "create")

  plan = db.execute(
    text("SELECT id::text AS id FROM annual_plans WHERE year = :year"),
    {"year": payload.annual_plan_year},
  ).mappings().first()
  if plan is None:
    db.execute(
      text("INSERT INTO annual_plans(year, title, status) VALUES (:year, :title, 'draft')"),
      {"year": payload.annual_plan_year, "title": "Annual Plan"},
    )
    plan = db.execute(
      text("SELECT id::text AS id FROM annual_plans WHERE year = :year"),
      {"year": payload.annual_plan_year},
    ).mappings().first()

  if plan is None:
    raise HTTPException(status_code=500, detail="Failed to resolve annual plan")

  created = db.execute(
    text(
      """
        INSERT INTO engagements(annual_plan_id, title, scope, risk_rating, status)
        VALUES (:annual_plan_id, :title, :scope, :risk_rating, 'planned')
        RETURNING
          id::text AS id,
          annual_plan_id::text AS annual_plan_id,
          title,
          scope,
          risk_rating,
          status,
          to_char(start_date, 'YYYY-MM-DD') AS start_date,
          to_char(end_date, 'YYYY-MM-DD') AS end_date,
          to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at
      """
    ),
    {
      "annual_plan_id": plan["id"],
      "title": payload.title,
      "scope": payload.scope,
      "risk_rating": payload.risk_rating,
    },
  ).mappings().first()
  db.commit()

  if created is None:
    raise HTTPException(status_code=500, detail="Failed to create engagement")

  return EngagementOut(**dict(created))