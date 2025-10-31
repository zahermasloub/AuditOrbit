from typing import Generator

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session

from ...application.dtos.engagements import EngagementCreate, EngagementOut, PageOut
from ...application.services import EngagementService
from ...infrastructure.db.session import SessionLocal
from ...infrastructure.repositories import SqlAlchemyEngagementRepository
from ...infrastructure.security.jwt import try_get_user_id
from ...infrastructure.security.rbac import enforce

router = APIRouter()


def get_db() -> Generator[Session, None, None]:
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()


def get_engagement_service(db: Session = Depends(get_db)) -> EngagementService:
  repository = SqlAlchemyEngagementRepository(db)
  return EngagementService(repository)


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
  user_id: str = Depends(current_user_id),
  db: Session = Depends(get_db),
  service: EngagementService = Depends(get_engagement_service),
) -> PageOut:
  enforce(db, user_id, "engagements", "read")
  return service.list_engagements(page=page, size=size, status=status)


@router.post("", response_model=EngagementOut)
def create_engagement(
  payload: EngagementCreate,
  user_id: str = Depends(current_user_id),
  db: Session = Depends(get_db),
  service: EngagementService = Depends(get_engagement_service),
) -> EngagementOut:
  enforce(db, user_id, "engagements", "create")
  try:
    return service.create_engagement(payload)
  except RuntimeError as exc:
    raise HTTPException(status_code=500, detail=str(exc)) from exc