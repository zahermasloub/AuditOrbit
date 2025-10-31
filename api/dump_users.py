from sqlalchemy import text
from app.infrastructure.db.session import SessionLocal

def dump_users():
    db = SessionLocal()
    try:
        rows = db.execute(text("SELECT * FROM users ORDER BY \"createdAt\" DESC LIMIT 5"))
        for row in rows.mappings():
            print(dict(row))
    finally:
        db.close()

if __name__ == "__main__":
    dump_users()
