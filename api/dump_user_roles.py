from sqlalchemy import text
from app.infrastructure.db.session import SessionLocal

def dump_user_roles():
    db = SessionLocal()
    try:
        rows = db.execute(text('SELECT id, "userId", "roleId" FROM user_roles'))
        for row in rows.mappings():
            print(dict(row))
    finally:
        db.close()

if __name__ == '__main__':
    dump_user_roles()
