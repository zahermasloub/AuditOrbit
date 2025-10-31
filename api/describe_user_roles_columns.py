from sqlalchemy import text
from app.infrastructure.db.session import SessionLocal

def describe_user_roles():
    db = SessionLocal()
    try:
        rows = db.execute(text("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'user_roles'
            ORDER BY ordinal_position
        """))
        for row in rows.mappings():
            print(row)
    finally:
        db.close()

if __name__ == '__main__':
    describe_user_roles()
