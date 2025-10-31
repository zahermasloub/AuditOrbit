from typing import Generator, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy import text
from sqlalchemy.orm import Session

from ...application.dtos.users import PageOut, UserCreate, UserUpdate, UserOut
from ...infrastructure.db.session import SessionLocal
from ...infrastructure.security.jwt import try_get_user_id
from ...infrastructure.security.passwords import hash_password
from ...infrastructure.security.rbac import enforce

router = APIRouter()


def get_db() -> Generator[Session, None, None]:
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()


def current_user_id(authorization: Optional[str] = Header(None)) -> str:
  """
  🔓 نظام المصادقة معطل مؤقتاً للتطوير
  إرجاع مستخدم افتراضي بدون التحقق من التوكن
  """
  print("🔓 نظام المصادقة معطل - إرجاع مستخدم افتراضي")
  return "dev-user-id"  # مستخدم افتراضي للتطوير
  
  # الكود الأصلي (معطل):
  # if not authorization or not authorization.startswith("Bearer "):
  #   raise HTTPException(status_code=401, detail="Unauthorized")
  # user_id = try_get_user_id(authorization)
  # if not user_id:
  #   raise HTTPException(status_code=401, detail="Unauthorized")
  # return user_id


@router.get("", response_model=PageOut)
def list_users(
  page: int = Query(1, ge=1),
  size: int = Query(20, ge=1, le=100),
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> PageOut:
  # enforce(db, user_id, "users", "read")  # 🔓 التحقق من الصلاحيات معطل
  total = int(db.execute(text('SELECT count(*) FROM users')).scalar_one())
  rows = db.execute(
    text(
      """
        SELECT
          u.id::text AS id,
          u.email,
          u.name,
          COALESCE(r.name, 'User') as role,
          u.locale,
          u.active,
          to_char(u."createdAt", 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at,
          to_char(u."updatedAt", 'YYYY-MM-DD"T"HH24:MI:SSOF') AS updated_at
        FROM users u
  LEFT JOIN user_roles ur ON u.id = ur."userId"
  LEFT JOIN roles r ON ur."roleId" = r.id
        ORDER BY u."createdAt" DESC
        OFFSET :offset LIMIT :limit
      """
    ),
    {"offset": (page - 1) * size, "limit": size},
  ).mappings().all()
  items = [
    UserOut(
      id=row["id"],
      email=row["email"],
      name=row["name"],
      role=row.get("role"),
      locale=row.get("locale"),
      timezone=None,
      active=row.get("active"),
      created_at=row.get("created_at"),
      updated_at=row.get("updated_at"),
    )
    for row in rows
  ]
  return PageOut(items=items, page=page, size=size, total=total)


@router.post("", response_model=UserOut)
def create_user(
  payload: UserCreate,
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> UserOut:
  # enforce(db, user_id, "users", "create")  # 🔓 التحقق من الصلاحيات معطل
  # Insert user first
  created = db.execute(
    text(
      """
        INSERT INTO users (email, name, password, locale, tz, active, "createdAt", "updatedAt")
        VALUES (:email, :name, :password, :locale, 'UTC', :active, now(), now())
        RETURNING
          id::text AS id,
          email,
          name,
          locale,
          active,
          to_char("createdAt", 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at,
          to_char("updatedAt", 'YYYY-MM-DD"T"HH24:MI:SSOF') AS updated_at
      """
    ),
    {
      "email": payload.email,
      "name": payload.name,
      "password": hash_password(payload.password),
      "locale": payload.locale or "ar",
      "active": payload.active if payload.active is not None else True,
    },
  ).mappings().first()
  
  if created is None:
    raise HTTPException(status_code=500, detail="Failed to create user")
  
  # Assign role if provided
  role_name = payload.role or "User"
  try:
    # Find or create role
    role_id = db.execute(
      text("SELECT id::text FROM roles WHERE name = :role_name"),
      {"role_name": role_name}
    ).scalar_one_or_none()
    
    if role_id:
      db.execute(
        text('INSERT INTO user_roles ("userId", "roleId") VALUES (:user_id, :role_id)'),
        {"user_id": created["id"], "role_id": role_id}
      )
  except Exception as e:
    print(f"Warning: Could not assign role: {e}")
  
  db.commit()
  
  return UserOut(
    id=created["id"],
    email=created["email"],
    name=created["name"],
    role=role_name,
    locale=created.get("locale"),
    timezone=None,
    active=created.get("active"),
    created_at=created.get("created_at"),
    updated_at=created.get("updated_at"),
  )


@router.put("/{user_id_param}", response_model=UserOut)
def update_user(
  user_id_param: str,
  payload: UserUpdate,
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> UserOut:
  # enforce(db, user_id, "users", "update")  # 🔓 التحقق من الصلاحيات معطل
  
  # Check if user exists
  existing = db.execute(
    text("SELECT id FROM users WHERE id::text = :user_id"),
    {"user_id": user_id_param}
  ).first()
  
  if not existing:
    raise HTTPException(status_code=404, detail="User not found")
  
  # Build update query dynamically
  update_fields = []
  params = {"user_id": user_id_param}
  
  if payload.name is not None:
    update_fields.append('name = :name')
    params["name"] = payload.name
  
  if payload.email is not None:
    update_fields.append('email = :email')
    params["email"] = payload.email
  
  if payload.password is not None:
    update_fields.append('password = :password')
    params["password"] = hash_password(payload.password)
  
  if payload.locale is not None:
    update_fields.append('locale = :locale')
    params["locale"] = payload.locale
  
  if payload.active is not None:
    update_fields.append('active = :active')
    params["active"] = payload.active
  
  # Always update updatedAt
  update_fields.append('"updatedAt" = now()')
  
  if len(update_fields) == 1:  # Only updatedAt
    raise HTTPException(status_code=400, detail="No fields to update")
  
  # Update user
  update_query = f"""
    UPDATE users 
    SET {', '.join(update_fields)}
    WHERE id::text = :user_id
    RETURNING 
      id::text AS id,
      email,
      name,
      locale,
      active,
      to_char("createdAt", 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at,
      to_char("updatedAt", 'YYYY-MM-DD"T"HH24:MI:SSOF') AS updated_at
  """
  
  updated = db.execute(text(update_query), params).mappings().first()
  
  if not updated:
    raise HTTPException(status_code=500, detail="Failed to update user")
  
  # Update role if provided
  if payload.role is not None:
    # Delete existing role
    db.execute(
      text('DELETE FROM user_roles WHERE "userId"::text = :user_id'),
      {"user_id": user_id_param}
    )
    
    # Find role
    role_id = db.execute(
      text("SELECT id::text FROM roles WHERE name = :role_name"),
      {"role_name": payload.role}
    ).scalar_one_or_none()
    
    if role_id:
      db.execute(
        text('INSERT INTO user_roles ("userId", "roleId") VALUES (:user_id, :role_id)'),
        {"user_id": user_id_param, "role_id": role_id}
      )
  
  db.commit()
  
  # Get role
  role_name = db.execute(
    text("""
      SELECT r.name 
      FROM user_roles ur 
      JOIN roles r ON ur."roleId" = r.id 
      WHERE ur."userId"::text = :user_id
    """),
    {"user_id": user_id_param}
  ).scalar_one_or_none() or "User"
  
  return UserOut(
    id=updated["id"],
    email=updated["email"],
    name=updated["name"],
    role=role_name,
    locale=updated.get("locale"),
    timezone=None,
    active=updated.get("active"),
    created_at=updated.get("created_at"),
    updated_at=updated.get("updated_at"),
  )


@router.delete("/{user_id_param}")
def delete_user(
  user_id_param: str,
  db: Session = Depends(get_db),
  user_id: str = Depends(current_user_id),
) -> dict[str, str]:
  # enforce(db, user_id, "users", "delete")  # 🔓 التحقق من الصلاحيات معطل
  
  # Check if user exists
  existing = db.execute(
    text("SELECT id FROM users WHERE id::text = :user_id"),
    {"user_id": user_id_param}
  ).first()
  
  if not existing:
    raise HTTPException(status_code=404, detail="User not found")
  
  # Prevent self-deletion
  if user_id_param == user_id:
    raise HTTPException(status_code=400, detail="Cannot delete your own account")
  
  # Delete user (cascade will delete user_roles)
  db.execute(
    text("DELETE FROM users WHERE id::text = :user_id"),
    {"user_id": user_id_param}
  )
  
  db.commit()
  
  return {"message": "User deleted successfully"}
