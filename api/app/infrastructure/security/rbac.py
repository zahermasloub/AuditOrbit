from fastapi import HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session


def has_permission(db: Session, user_id: str, resource: str, action: str) -> bool:
  query = db.execute(
    text(
      """
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON rp.role_id = ur.role_id
        JOIN permissions p ON p.id = rp.perm_id
        WHERE ur.user_id = :uid AND p.resource = :res AND p.action = :act
        LIMIT 1;
      """
    ),
    {"uid": user_id, "res": resource, "act": action},
  ).first()
  return bool(query)


def enforce(db: Session, user_id: str, resource: str, action: str) -> None:
  if not has_permission(db, user_id, resource, action):
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
