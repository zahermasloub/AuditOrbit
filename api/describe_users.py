from sqlalchemy import text
from app.infrastructure.db.session import SessionLocal

def describe_users():
    db = SessionLocal()
    try:
        rows = db.execute(text("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position
        """))
        print("📋 أعمدة جدول users:")
        for row in rows.mappings():
            print(f"- {row['column_name']} ({row['data_type']}) | nullable={row['is_nullable']} | default={row['column_default']}")
    finally:
        db.close()

if __name__ == "__main__":
    describe_users()
