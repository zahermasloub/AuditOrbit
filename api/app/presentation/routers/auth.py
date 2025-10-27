from typing import Generator

from fastapi import APIRouter, Depends, Header, HTTPException, status
from jose import JWTError
from sqlalchemy import text
from sqlalchemy.orm import Session

from ...application.dtos.auth import LoginIn, TokenOut, UserInfo
from ...infrastructure.db.session import SessionLocal
from ...infrastructure.security.jwt import create_token, decode_token
from ...infrastructure.security.passwords import verify_password
from ..middlewares.rate_limit import limiter

router = APIRouter()


def get_db() -> Generator[Session, None, None]:
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()


@router.post("/login", response_model=TokenOut)
@limiter.exempt
def login(payload: LoginIn, db: Session = Depends(get_db)) -> TokenOut:
  print(f"🔍 Login attempt for: {payload.email}")
  
  try:
    user = db.execute(
      text(
        'SELECT id, email, name, password as hashed_password, locale FROM users WHERE email = :email'
      ),
      {"email": payload.email},
    ).mappings().first()
    
    print(f"🔍 User found: {user is not None}")
    
    if not user:
      print("❌ User not found")
      raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bad credentials")
    
    print(f"🔍 Verifying password...")
    print(f"   Password length: {len(payload.password)}")
    print(f"   Hash starts with: {user['hashed_password'][:10]}")
    
    password_valid = verify_password(payload.password, user["hashed_password"])
    print(f"🔍 Password valid: {password_valid}")
    
    if not password_valid:
      print("❌ Invalid password")
      raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bad credentials")
    
    print(f"🔍 Creating tokens for user ID: {user['id']}")
    access_token = create_token(str(user["id"]), 3600)
    refresh_token = create_token(str(user["id"]), 86400)
    
    print(f"✅ Login successful")
    
    return TokenOut(
      access_token=access_token,
      refresh_token=refresh_token,
      expires_in=3600,
      user=UserInfo(
        id=str(user["id"]),
        email=user["email"],
        name=user["name"],
        role=user.get("role", "user"),
        locale=user.get("locale", "en")
      )
    )
  except HTTPException:
    raise
  except Exception as e:
    print(f"❌ Unexpected error: {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


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
