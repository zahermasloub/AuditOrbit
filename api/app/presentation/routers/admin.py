"""
Admin Statistics and Management Router
Provides comprehensive admin dashboard statistics and management endpoints
"""

from typing import Generator, Any, Optional
from datetime import datetime, timedelta

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


@router.get("/kpis", response_model=dict[str, Any])
def get_admin_kpis(
    db: Session = Depends(get_db),
    user_id: str = Depends(current_user_id),
) -> dict[str, Any]:
    """
    Get comprehensive KPIs for admin dashboard
    """
    enforce(db, user_id, "admin", "read")
    
    try:
        # Total engagements
        total_engagements = db.execute(
            text("SELECT COUNT(*) FROM engagements")
        ).scalar_one()
        
        # Completed engagements
        completed_engagements = db.execute(
            text("""
                SELECT COUNT(*) FROM engagements 
                WHERE status = 'COMPLETED'
            """)
        ).scalar_one()
        
        # Completion rate
        completion_rate = 0.0
        if total_engagements > 0:
            completion_rate = (completed_engagements / total_engagements) * 100
        
        # Total findings
        try:
            total_findings = db.execute(
                text("SELECT COUNT(*) FROM findings")
            ).scalar_one()
            
            # High risk findings
            high_risk_findings = db.execute(
                text("""
                    SELECT COUNT(*) FROM findings 
                    WHERE severity IN ('critical', 'high')
                """)
            ).scalar_one()
            
            high_risk_percentage = 0.0
            if total_findings > 0:
                high_risk_percentage = (high_risk_findings / total_findings) * 100
        except:
            total_findings = 0
            high_risk_findings = 0
            high_risk_percentage = 0.0
        
        # Total reports
        try:
            total_reports = db.execute(
                text("SELECT COUNT(*) FROM reports")
            ).scalar_one()
            
            published_reports = db.execute(
                text("""
                    SELECT COUNT(*) FROM reports 
                    WHERE status = 'published'
                """)
            ).scalar_one()
        except:
            total_reports = 0
            published_reports = 0
        
        # Active users
        active_users = db.execute(
            text("SELECT COUNT(*) FROM users")
        ).scalar_one()
        
        # Average completion time (in days)
        avg_days_result = db.execute(
            text("""
                SELECT AVG(EXTRACT(EPOCH FROM (end_date::timestamp - start_date::timestamp)) / 86400) 
                FROM engagements 
                WHERE status = 'COMPLETED' AND end_date IS NOT NULL
            """)
        ).scalar_one_or_none()
        
        avg_completion_time_days = float(avg_days_result) if avg_days_result else 0.0
        
        return {
            "total_engagements": int(total_engagements),
            "completed_engagements": int(completed_engagements),
            "completion_rate": round(completion_rate, 2),
            "total_findings": int(total_findings),
            "high_risk_findings": int(high_risk_findings),
            "high_risk_percentage": round(high_risk_percentage, 2),
            "total_reports": int(total_reports),
            "published_reports": int(published_reports),
            "active_users": int(active_users),
            "avg_completion_time_days": round(avg_completion_time_days, 1)
        }
    except Exception as e:
        print(f"Admin KPIs error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/engagements-trend", response_model=list[dict[str, Any]])
def get_engagements_trend(
    db: Session = Depends(get_db),
    user_id: str = Depends(current_user_id),
) -> list[dict[str, Any]]:
    """
    Get monthly engagements trend (last 6 months)
    """
    enforce(db, user_id, "admin", "read")
    
    try:
        rows = db.execute(
            text("""
                SELECT 
                    TO_CHAR(created_at, 'Month') as period,
                    COUNT(*) as total,
                    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed
                FROM engagements
                WHERE created_at >= NOW() - INTERVAL '6 months'
                GROUP BY TO_CHAR(created_at, 'Month'), EXTRACT(MONTH FROM created_at)
                ORDER BY EXTRACT(MONTH FROM created_at)
            """)
        ).mappings().all()
        
        return [
            {
                "period": row["period"].strip(),
                "total": int(row["total"]),
                "completed": int(row["completed"])
            }
            for row in rows
        ]
    except Exception as e:
        print(f"Engagements trend error: {e}")
        return []


@router.get("/user-activity", response_model=list[dict[str, Any]])
def get_user_activity(
    db: Session = Depends(get_db),
    user_id: str = Depends(current_user_id),
) -> list[dict[str, Any]]:
    """
    Get user activity statistics for the last 7 days
    """
    enforce(db, user_id, "admin", "read")
    
    try:
        # Get audit logs for last 7 days
        rows = db.execute(
            text("""
                SELECT 
                    TO_CHAR(at, 'Day') as day,
                    COUNT(DISTINCT actor_id) as logins,
                    COUNT(*) as actions
                FROM audit_logs
                WHERE at >= NOW() - INTERVAL '7 days'
                GROUP BY TO_CHAR(at, 'Day'), EXTRACT(DOW FROM at)
                ORDER BY EXTRACT(DOW FROM at)
            """)
        ).mappings().all()
        
        return [
            {
                "day": row["day"].strip(),
                "logins": int(row["logins"]),
                "actions": int(row["actions"])
            }
            for row in rows
        ]
    except Exception as e:
        print(f"User activity error: {e}")
        # Return mock data for last 7 days
        days = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]
        return [
            {"day": day, "logins": 0, "actions": 0}
            for day in days
        ]


@router.get("/recent-activities", response_model=list[dict[str, Any]])
def get_recent_activities(
    limit: int = 10,
    db: Session = Depends(get_db),
    user_id: str = Depends(current_user_id),
) -> list[dict[str, Any]]:
    """
    Get recent system activities from audit logs
    """
    enforce(db, user_id, "admin", "read")
    
    try:
        rows = db.execute(
            text("""
                SELECT 
                    al.id::text,
                    al.action,
                    al.resource as resource_type,
                    u.name as user_name,
                    to_char(al.at, 'YYYY-MM-DD"T"HH24:MI:SS') as created_at
                FROM audit_logs al
                LEFT JOIN users u ON u.id = al.actor_id
                ORDER BY al.at DESC
                LIMIT :limit
            """),
            {"limit": limit}
        ).mappings().all()
        
        return [
            {
                "id": row["id"],
                "action": row["action"],
                "user_name": row["user_name"] or "Unknown",
                "resource_type": row["resource_type"],
                "created_at": row["created_at"]
            }
            for row in rows
        ]
    except Exception as e:
        print(f"Recent activities error: {e}")
        return []


@router.get("/users-stats", response_model=dict[str, Any])
def get_users_statistics(
    db: Session = Depends(get_db),
    user_id: str = Depends(current_user_id),
) -> dict[str, Any]:
    """
    Get detailed user statistics
    """
    enforce(db, user_id, "admin", "read")
    
    try:
        # Total users
        total_users = db.execute(
            text("SELECT COUNT(*) FROM users")
        ).scalar_one()
        
        # Users by role
        roles_data = db.execute(
            text("""
                SELECT 
                    role,
                    COUNT(*) as count
                FROM users
                GROUP BY role
            """)
        ).mappings().all()
        
        # Recent logins (last 24 hours)
        recent_logins = db.execute(
            text("""
                SELECT COUNT(DISTINCT actor_id) 
                FROM audit_logs 
                WHERE action = 'LOGIN' 
                AND at >= NOW() - INTERVAL '24 hours'
            """)
        ).scalar_one()
        
        return {
            "total_users": int(total_users),
            "recent_logins": int(recent_logins),
            "by_role": [
                {"role": row["role"], "count": int(row["count"])}
                for row in roles_data
            ]
        }
    except Exception as e:
        print(f"Users statistics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
