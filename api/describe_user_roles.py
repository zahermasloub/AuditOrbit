from sqlalchemy import text
from app.infrastructure.db.session import SessionLocal

def dump_user_roles():
    db = SessionLocal()
    try:
        rows = db.execute(
            text('SELECT "userId"::text AS user_id, "roleId"::text AS role_id FROM user_roles')
        )
        data = rows.mappings().all()
        if not data:
            print("⚠️ جدول user_roles فارغ")
            return
        for row in data:
            print(dict(row))
    finally:
        db.close()

if __name__ == "__main__":
    dump_user_roles()
