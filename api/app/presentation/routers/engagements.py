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
          ''::text AS annual_plan_id,
          e.title,
          e.objective AS scope,
          'medium' AS risk_rating,
          e.status,
          to_char(e."startDate", 'YYYY-MM-DD') AS start_date,
          to_char(e."endDate", 'YYYY-MM-DD') AS end_date,
          to_char(e."createdAt", 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at
        FROM engagements e
        {where_sql}
        ORDER BY e."createdAt" DESC
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

  # Check if annual plan exists using fiscalYear instead of year
  plan = db.execute(
    text('SELECT id::text AS id FROM annual_plans WHERE "fiscalYear" = :year'),
    {"year": payload.annual_plan_year},
  ).mappings().first()
  
  if plan is None:
    # Create a new annual plan if it doesn't exist
    import uuid
    plan_id = str(uuid.uuid4())
    db.execute(
      text('''INSERT INTO annual_plans(
        id, title, "fiscalYear", version, status, "createdBy", "createdAt", "updatedAt", plan_ref
      ) VALUES (
        :id, :title, :year, '1.0', 'DRAFT', :user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, :ref
      )'''),
      {
        "id": plan_id,
        "year": payload.annual_plan_year, 
        "title": f"Annual Plan {payload.annual_plan_year}",
        "user_id": user_id,
        "ref": f"AP-{payload.annual_plan_year}"
      },
    )
    db.commit()
    plan = {"id": plan_id}

  # Create engagement with the actual table structure
  import uuid
  engagement_id = str(uuid.uuid4())
  
  # Generate unique code
  code = f"ENG-{payload.annual_plan_year}-{engagement_id[:8].upper()}"
  
  created = db.execute(
    text(
      '''
        INSERT INTO engagements(
          id, code, title, objective, "scopeJson", "criteriaJson", 
          "constraintsJson", "auditeeUnitsJson", "stakeholdersJson",
          "startDate", "endDate", "budgetHours", status, "createdBy", 
          "createdAt", "updatedAt"
        )
        VALUES (
          :id, :code, :title, :objective, :scope_json, :criteria_json,
          :constraints_json, :auditee_units_json, :stakeholders_json,
          CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 40, 
          'DRAFT', :user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING
          id::text AS id,
          :plan_id AS annual_plan_id,
          title,
          objective AS scope,
          'medium' AS risk_rating,
          status::text AS status,
          to_char("startDate", 'YYYY-MM-DD') AS start_date,
          to_char("endDate", 'YYYY-MM-DD') AS end_date,
          to_char("createdAt", 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at
      '''
    ),
    {
      "id": engagement_id,
      "code": code,
      "title": payload.title,
      "objective": payload.scope or "Audit objective",
      "scope_json": '{"description": "' + (payload.scope or "Audit scope").replace('"', '\\"') + '"}',
      "criteria_json": '[]',
      "constraints_json": '[]',
      "auditee_units_json": '[]',
      "stakeholders_json": '[]',
      "user_id": user_id,
      "plan_id": plan["id"],
    },
  ).mappings().first()
  db.commit()

  if created is None:
    raise HTTPException(status_code=500, detail="Failed to create engagement")

  return EngagementOut(**dict(created))