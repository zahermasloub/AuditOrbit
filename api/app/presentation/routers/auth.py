from typing import Generator

from fastapi import APIRouter, Depends, Header, HTTPException, status
from jose import JWTError
from sqlalchemy import text
from sqlalchemy.orm import Session

from ...application.dtos.auth import LoginIn, TokenOut
from ...infrastructure.db.session import SessionLocal
from ...infrastructure.security.jwt import create_token, decode_token
from ...infrastructure.security.passwords import verify_password

router = APIRouter()


def get_db() -> Generator[Session, None, None]:
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)) -> TokenOut:
  user = db.execute(
    text(
      "SELECT id, email, name, hashed_password, locale, tz, active FROM users WHERE email = :email"
    ),
    {"email": payload.email},
  ).mappings().first()
  if not user or not verify_password(payload.password, user["hashed_password"]):
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bad credentials")
  return TokenOut(
    access_token=create_token(str(user["id"]), 3600),
    refresh_token=create_token(str(user["id"]), 86400),
    expires_in=3600,
  )


@router.post("/refresh", response_model=TokenOut)
def refresh(authorization: str = Header(default=None, convert_underscores=False)) -> TokenOut:
  if not authorization or not authorization.startswith("Bearer "):
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
  token = authorization.split()[1]
  try:
    payload = decode_token(token)
  except JWTError as exc:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
  user_id = payload["sub"]
  return TokenOut(
    access_token=create_token(user_id, 3600),
    refresh_token=create_token(user_id, 86400),
    expires_in=3600,
  )
