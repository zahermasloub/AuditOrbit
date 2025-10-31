import os
from typing import Generator, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...application.dtos.users import PageOut, UserCreate, UserUpdate, UserOut
from ...application.exceptions import ConflictError, NotFoundError, ValidationError
from ...application.services import UserService
from ...infrastructure.db.session import SessionLocal
from ...infrastructure.repositories.user_repository import SqlAlchemyUserRepository
from ...infrastructure.security.jwt import try_get_user_id
from ...infrastructure.security.passwords import BcryptPasswordHasher
from ...infrastructure.security.rbac import enforce

router = APIRouter()


def get_db() -> Generator[Session, None, None]:
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()


def get_user_service(db: Session = Depends(get_db)) -> UserService:
  repository = SqlAlchemyUserRepository(db)
  hasher = BcryptPasswordHasher()
  return UserService(repository, hasher)


def current_user_id(authorization: Optional[str] = Header(None)) -> str:
  """إرجاع معرّف المستخدم من التوكن أو من متغير بيئي للتطوير."""
  bypass_user = os.getenv("AUTH_BYPASS_USER_ID")
  if bypass_user:
    return bypass_user

  if not authorization or not authorization.startswith("Bearer "):
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
  user_id = try_get_user_id(authorization)
  if not user_id:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
  return user_id


@router.get("", response_model=PageOut)
def list_users(
  page: int = Query(1, ge=1),
  size: int = Query(20, ge=1, le=100),
  user_id: str = Depends(current_user_id),
  db: Session = Depends(get_db),
  service: UserService = Depends(get_user_service),
) -> PageOut:
  enforce(db, user_id, "users", "read")
  return service.list_users(page=page, size=size)


@router.post("", response_model=UserOut)
def create_user(
  payload: UserCreate,
  user_id: str = Depends(current_user_id),
  db: Session = Depends(get_db),
  service: UserService = Depends(get_user_service),
) -> UserOut:
  enforce(db, user_id, "users", "create")
  try:
    return service.create_user(payload)
  except ValidationError as exc:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
  except ConflictError as exc:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.put("/{user_id_param}", response_model=UserOut)
def update_user(
  user_id_param: str,
  payload: UserUpdate,
  user_id: str = Depends(current_user_id),
  db: Session = Depends(get_db),
  service: UserService = Depends(get_user_service),
) -> UserOut:
  enforce(db, user_id, "users", "update")
  try:
    return service.update_user(user_id=user_id_param, payload=payload)
  except NotFoundError as exc:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
  except ValidationError as exc:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.delete("/{user_id_param}")
def delete_user(
  user_id_param: str,
  user_id: str = Depends(current_user_id),
  db: Session = Depends(get_db),
  service: UserService = Depends(get_user_service),
) -> dict[str, str]:
  enforce(db, user_id, "users", "delete")
  try:
    service.delete_user(user_id=user_id_param, acting_user_id=user_id)
  except NotFoundError as exc:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
  except ConflictError as exc:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
  return {"message": "User deleted successfully"}
