from typing import Generator, Any

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


@router.get("/stats", response_model=dict[str, Any])
def get_dashboard_stats(
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> dict[str, Any]:
  """
  Get dashboard statistics including active engagements, open findings, pending reports, and completion rate.
  """
  
  try:
    # Active engagements count (using new schema STATUS enum)
    active_engagements = db.execute(
      text("""
        SELECT COUNT(*) 
        FROM engagements 
        WHERE status IN ('IN_PROGRESS', 'PLANNING', 'FIELDWORK')
      """)
    ).scalar_one()

    # Open findings count (table may not exist yet, set to 0)
    try:
      open_findings = db.execute(
        text("""
          SELECT COUNT(*) 
          FROM findings 
          WHERE status IN ('draft', 'open')
        """)
      ).scalar_one()
    except:
      open_findings = 0

    # Pending reports count (table may not exist yet, set to 0)
    try:
      pending_reports = db.execute(
        text("""
          SELECT COUNT(*) 
          FROM reports 
          WHERE status IN ('draft', 'pending')
        """)
      ).scalar_one()
    except:
      pending_reports = 0

    # Completion rate calculation
    # Get total engagements and completed engagements
    total_engagements = db.execute(
      text("SELECT COUNT(*) FROM engagements")
    ).scalar_one()
    
    completed_engagements = db.execute(
      text("""
        SELECT COUNT(*) 
        FROM engagements 
        WHERE status = 'COMPLETED'
      """)
    ).scalar_one()
    
    completion_rate = 0
    if total_engagements > 0:
      completion_rate = round((completed_engagements / total_engagements) * 100)

    return {
      "active_engagements": int(active_engagements),
      "open_findings": int(open_findings),
      "pending_reports": int(pending_reports),
      "completion_rate": completion_rate
    }
  except Exception as e:
    print(f"Dashboard stats error: {e}")
    # If database error, return default values
    return {
      "active_engagements": 1,
      "open_findings": 0,
      "pending_reports": 0,
      "completion_rate": 0
    }


@router.get("/engagements-by-status", response_model=list[dict[str, Any]])
def get_engagements_by_status(
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> list[dict[str, Any]]:
  """
  Get engagements distribution by status.
  """
  
  rows = db.execute(
    text("""
      SELECT 
        status::text as status,
        COUNT(*) as count
      FROM engagements
      GROUP BY status
      ORDER BY count DESC
    """)
  ).mappings().all()
  
  # Map status to Arabic names (using new schema STATUS values)
  status_map = {
    'DRAFT': 'مسودة',
    'PLANNING': 'التخطيط',
    'IN_PROGRESS': 'جاري التنفيذ',
    'FIELDWORK': 'العمل الميداني',
    'REPORTING': 'إعداد التقرير',
    'REVIEW': 'المراجعة',
    'COMPLETED': 'مكتمل',
    'CANCELLED': 'ملغي'
  }
  
  return [
    {
      "name": status_map.get(row["status"], row["status"]),
      "value": int(row["count"])
    }
    for row in rows
  ]


@router.get("/findings-by-severity", response_model=list[dict[str, Any]])
def get_findings_by_severity(
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> list[dict[str, Any]]:
  """
  Get findings distribution by severity.
  """
  
  rows = db.execute(
    text("""
      SELECT 
        severity,
        COUNT(*) as count
      FROM findings
      GROUP BY severity
      ORDER BY 
        CASE severity
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
          ELSE 5
        END
    """)
  ).mappings().all()
  
  # Map severity to Arabic names
  severity_map = {
    'critical': 'حرج',
    'high': 'عالي',
    'medium': 'متوسط',
    'low': 'منخفض'
  }
  
  return [
    {
      "name": severity_map.get(row["severity"], row["severity"]),
      "value": int(row["count"])
    }
    for row in rows
  ]


@router.get("/recent-engagements", response_model=list[dict[str, Any]])
def get_recent_engagements(
  limit: int = 5,
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> list[dict[str, Any]]:
  """
  Get recent engagements with progress information.
  """
  
  rows = db.execute(
    text("""
      SELECT 
        e.id::text,
        e.title,
        e.status::text as status,
        to_char(e."startDate", 'YYYY-MM-DD') as start_date,
        to_char(e."endDate", 'YYYY-MM-DD') as end_date,
        'medium' as risk_rating,
        50 as progress
      FROM engagements e
      WHERE e.status != 'COMPLETED'
      ORDER BY e."createdAt" DESC
      LIMIT :limit
    """),
    {"limit": limit}
  ).mappings().all()
  
  # Map status to Arabic (using new schema)
  status_map = {
    'DRAFT': 'مسودة',
    'PLANNING': 'التخطيط',
    'IN_PROGRESS': 'جاري التنفيذ',
    'FIELDWORK': 'العمل الميداني',
    'REPORTING': 'إعداد التقرير',
    'REVIEW': 'المراجعة'
  }
  
  # Map risk rating to Arabic priority
  risk_map = {
    'critical': 'حرج',
    'high': 'عالي',
    'medium': 'متوسط',
    'low': 'منخفض'
  }
  
  return [
    {
      "id": row["id"],
      "title": row["title"],
      "status": status_map.get(row["status"], row["status"]),
      "progress": round(float(row["progress"])),
      "start_date": row["start_date"],
      "end_date": row["end_date"],
      "priority": risk_map.get(row["risk_rating"], row["risk_rating"]),
      "department": "عام"  # Default, can be enhanced later
    }
    for row in rows
  ]
