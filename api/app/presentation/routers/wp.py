from __future__ import annotations

from typing import Any, Dict, Generator

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ...application.dtos import WorkingPaperCreate, WorkingPaperOut
from ...infrastructure.db.session import SessionLocal
from ...infrastructure.security.jwt import try_get_user_id
from ...infrastructure.security.rbac import enforce

router = APIRouter(prefix="/wp", tags=["working_papers"])


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def current_user_id(authorization: str = Header(default=None, convert_underscores=False)) -> str:
    user_id = try_get_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return user_id


def _assert_can_access_engagement(db: Session, user_id: str, engagement_id: str) -> None:
    """Guard that enforces assignment or elevated roles before exposing engagement data."""
    q_admin = text(
        """
            select 1
            from user_roles ur
            join roles r on r.id = ur.role_id
            where ur.user_id = :uid and r.name in ('Admin','IA Manager')
            limit 1
        """
    )
    if db.execute(q_admin, {"uid": user_id}).first():
        return
    q_assigned = text(
        """
            select 1 from engagement_assignments
            where user_id=:uid and engagement_id=:eid
            limit 1
        """
    )
    if not db.execute(q_assigned, {"uid": user_id, "eid": engagement_id}).first():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not assigned to this engagement")


@router.get("", response_model=dict)
def list_wp(
    engagement_id: str = Query(...),
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    uid: str = Depends(current_user_id),
) -> Dict[str, Any]:
    enforce(db, uid, "working_papers", "read")
    _assert_can_access_engagement(db, uid, engagement_id)

    total = db.execute(
        text("select count(*) from working_papers where engagement_id=:eid"),
        {"eid": engagement_id},
    ).scalar() or 0

    rows = db.execute(
        text(
            """
                select id, engagement_id, wp_ref, objective, procedure, prepared_at, reviewed_at, created_at
                from working_papers
                where engagement_id=:eid
                order by coalesce(prepared_at, created_at) desc
                limit :lim offset :off
            """
        ),
        {"eid": engagement_id, "lim": size, "off": (page - 1) * size},
    ).mappings().all()

    return {"items": [dict(r) for r in rows], "page": page, "size": size, "total": int(total)}


@router.post("", response_model=WorkingPaperOut, status_code=status.HTTP_201_CREATED)
def create_wp(
    payload: WorkingPaperCreate,
    db: Session = Depends(get_db),
    uid: str = Depends(current_user_id),
) -> WorkingPaperOut:
    enforce(db, uid, "working_papers", "create")
    _assert_can_access_engagement(db, uid, str(payload.engagement_id))

    try:
        row = db.execute(
            text(
                """
                    insert into working_papers (id, engagement_id, wp_ref, objective, procedure)
                    values (gen_random_uuid(), :eid, :ref, :obj, :proc)
                    returning id, engagement_id, wp_ref, objective, procedure, prepared_at, reviewed_at, created_at
                """
            ),
            {
                "eid": str(payload.engagement_id),
                "ref": payload.wp_ref,
                "obj": payload.objective,
                "proc": payload.procedure,
            },
        ).mappings().one()
        db.commit()
        return WorkingPaperOut(**dict(row))
    except IntegrityError as ex:  # pragma: no cover - fast path
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Duplicate wp_ref for this engagement") from ex
