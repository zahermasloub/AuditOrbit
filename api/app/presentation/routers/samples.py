from __future__ import annotations

from typing import Any, Dict, Generator, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Response, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from pydantic import BaseModel, Field
from uuid import UUID
from ...application.dtos import SampleCreate, SampleOut
from ...infrastructure.db.session import SessionLocal
from ...infrastructure.security.jwt import try_get_user_id
from ...infrastructure.security.rbac import enforce

router = APIRouter(prefix="/samples", tags=["samples"])


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
def list_samples(
    engagement_id: str = Query(...),
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    uid: str = Depends(current_user_id),
) -> Dict[str, Any]:
    enforce(db, uid, "samples", "read")
    _assert_can_access_engagement(db, uid, engagement_id)

    total = db.execute(
        text("select count(*) from samples where engagement_id=:eid"),
        {"eid": engagement_id},
    ).scalar() or 0

    rows = db.execute(
        text(
            """
                select id, engagement_id, method, size, created_at
                from samples
                where engagement_id=:eid
                order by created_at desc
                limit :lim offset :off
            """
        ),
        {"eid": engagement_id, "lim": size, "off": (page - 1) * size},
    ).mappings().all()

    return {"items": [dict(r) for r in rows], "page": page, "size": size, "total": int(total)}


@router.post("", response_model=SampleOut, status_code=status.HTTP_201_CREATED)
def create_sample(
    payload: SampleCreate,
    db: Session = Depends(get_db),
    uid: str = Depends(current_user_id),
) -> SampleOut:
    enforce(db, uid, "samples", "create")
    _assert_can_access_engagement(db, uid, str(payload.engagement_id))

    row = db.execute(
        text(
            """
                insert into samples (id, engagement_id, method, size)
                values (gen_random_uuid(), :eid, :m, :s)
                returning id, engagement_id, method, size, created_at
            """
        ),
        {"eid": str(payload.engagement_id), "m": payload.method, "s": payload.size},
    ).mappings().one()
    db.commit()
    return SampleOut(**dict(row))


class SampleUpdate(BaseModel):
    method: Optional[str] = Field(default=None, pattern=r"^(random|systematic|high_value)$")
    size: Optional[int] = Field(default=None, gt=0, le=100000)


@router.patch("/{sample_id}", response_model=SampleOut)
def update_sample(
    sample_id: UUID,
    payload: SampleUpdate,
    db: Session = Depends(get_db),
    uid: str = Depends(current_user_id),
) -> SampleOut:
    enforce(db, uid, "samples", "update")

    row = db.execute(text("select engagement_id from samples where id=:id"), {"id": str(sample_id)}).mappings().first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="sample_not_found")

    engagement_id = str(row["engagement_id"])
    _assert_can_access_engagement(db, uid, engagement_id)

    update_result = db.execute(
        text(
            """
                update samples
                set method = coalesce(:method, method),
                    size = coalesce(:size, size)
                where id=:id
                returning id, engagement_id, method, size, created_at
            """
        ),
        {"id": str(sample_id), "method": payload.method, "size": payload.size},
    ).mappings().first()

    if not update_result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="sample_not_found")

    db.commit()
    return SampleOut(**dict(update_result))


@router.delete("/{sample_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sample(
    sample_id: UUID,
    db: Session = Depends(get_db),
    uid: str = Depends(current_user_id),
) -> Response:
    enforce(db, uid, "samples", "delete")

    row = db.execute(text("select engagement_id from samples where id=:id"), {"id": str(sample_id)}).mappings().first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="sample_not_found")

    engagement_id = str(row["engagement_id"])
    _assert_can_access_engagement(db, uid, engagement_id)

    db.execute(text("delete from samples where id=:id"), {"id": str(sample_id)})
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
