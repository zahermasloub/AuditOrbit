from datetime import datetime, timedelta, timezone
import uuid
from typing import Any, Optional

from jose import JWTError, jwt

from ...config.settings import settings

ALG = "HS256"


def create_token(sub: str, ttl_seconds: int) -> str:
  now = datetime.now(timezone.utc)
  payload: dict[str, Any] = {
    "sub": sub,
    "iat": int(now.timestamp()),
    "exp": int((now + timedelta(seconds=ttl_seconds)).timestamp()),
    "jti": str(uuid.uuid4()),
  }
  return jwt.encode(payload, settings.JWT_SECRET, algorithm=ALG)


def decode_token(token: str) -> dict[str, Any]:
  return jwt.decode(token, settings.JWT_SECRET, algorithms=[ALG])


def try_get_user_id(authorization: Optional[str]) -> Optional[str]:
  try:
    if not authorization or not authorization.startswith("Bearer "):
      return None
    token = authorization.split()[1]
    payload = decode_token(token)
    return payload.get("sub")
  except JWTError:
    return None
