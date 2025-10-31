import logging
from typing import Generator, Optional, Set, cast

from fastapi import APIRouter, Depends, Header, HTTPException, status
from jose import JWTError
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import ValidationError

from ...application.dtos.auth import LoginIn, TokenOut, UserInfo
from ...infrastructure.db.session import SessionLocal
from ...infrastructure.security.jwt import create_token, decode_token
from ...infrastructure.security.passwords import verify_password
from ..middlewares.rate_limit import limiter

router = APIRouter()
logger = logging.getLogger(__name__)

_TABLE_COLUMNS_CACHE: dict[str, Set[str]] = {}


def _get_columns(db: Session, table_name: str) -> Set[str]:
  if table_name in _TABLE_COLUMNS_CACHE:
    return _TABLE_COLUMNS_CACHE[table_name]

  result = db.execute(
    text(
      """
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = :table
      """
    ),
    {"table": table_name},
  )
  columns = {row[0] for row in result}
  _TABLE_COLUMNS_CACHE[table_name] = columns
  return columns


def _pick_column(columns: Set[str], candidates: tuple[str, ...]) -> Optional[str]:
  for column in candidates:
    if column in columns:
      return column
  return None


def _qualify(prefix: str, column: str) -> str:
  return f'{prefix}."{column}"' if column != column.lower() else f"{prefix}.{column}"


def get_db() -> Generator[Session, None, None]:
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()


@router.post("/login", response_model=TokenOut)
@limiter.exempt
def login(payload: LoginIn, db: Session = Depends(get_db)) -> TokenOut:
  # Login attempt
  
  try:
    user_columns = _get_columns(db, "users")
    user_id_col = _pick_column(user_columns, ("id", "userId"))
    email_col = _pick_column(user_columns, ("email", "emailAddress"))
    name_col = _pick_column(user_columns, ("name", "full_name", "fullName"))
    password_col = _pick_column(user_columns, ("hashed_password", "password", "hashedPassword"))
    locale_col = _pick_column(user_columns, ("locale", "localeCode", "language"))

    if not all([user_id_col, email_col, name_col, password_col]):
      logger.error("Login schema mismatch for users table" )
      raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bad credentials")

    user_id_col = cast(str, user_id_col)
    email_col = cast(str, email_col)
    name_col = cast(str, name_col)
    password_col = cast(str, password_col)

    select_fields = [
      f"{_qualify('u', user_id_col)} AS id",
      f"{_qualify('u', email_col)} AS email",
      f"{_qualify('u', name_col)} AS name",
      f"{_qualify('u', password_col)} AS hashed_password",
    ]

    if locale_col:
      select_fields.append(f"{_qualify('u', locale_col)} AS locale")
    else:
      select_fields.append("'en' AS locale")

    join_parts: list[str] = []
    role_expr = "'user' AS role"

    user_role_columns = _get_columns(db, "user_roles")
    role_user_col = _pick_column(user_role_columns, ("user_id", "userId"))
    role_role_col = _pick_column(user_role_columns, ("role_id", "roleId"))

    if role_user_col and role_role_col:
      roles_columns = _get_columns(db, "roles")
      role_name_col = _pick_column(roles_columns, ("name", "role", "roleName", "title"))
      role_id_col = _pick_column(roles_columns, ("id", "roleId"))
      if role_name_col and role_id_col:
        role_expr = f"{_qualify('r', role_name_col)} AS role"
        join_parts.append(
          f" LEFT JOIN user_roles ur ON {_qualify('u', user_id_col)} = {_qualify('ur', role_user_col)}"
        )
        join_parts.append(
          f" LEFT JOIN roles r ON {_qualify('ur', role_role_col)} = {_qualify('r', role_id_col)}"
        )

    select_fields.append(role_expr)

    select_sql = ", ".join(select_fields)
    joins = "".join(join_parts)
    user = db.execute(
      text(
        f"SELECT {select_sql} FROM users u{joins} WHERE {_qualify('u', email_col)} = :email"
      ),
      {"email": payload.email},
    ).mappings().first()
    
    
    if not user:
      raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bad credentials")
    
    password_valid = verify_password(payload.password, user["hashed_password"])
    
    if not password_valid:
      raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bad credentials")
    
    access_token = create_token(str(user["id"]), 3600)
    refresh_token = create_token(str(user["id"]), 86400)
    
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
  except ValidationError as exc:
    logger.warning("Invalid login payload for %s", payload.email, exc_info=exc)
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials") from exc
  except SQLAlchemyError as exc:
    logger.exception("Database error during login for %s", payload.email)
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bad credentials") from exc
  except Exception as exc:
    logger.exception("Unexpected error during login for %s", payload.email)
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bad credentials") from exc


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
