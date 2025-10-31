from sqlalchemy import text

from app.infrastructure.db.session import SessionLocal


def list_roles():
    db = SessionLocal()
    try:
        roles = db.execute(text("SELECT id::text, name FROM roles ORDER BY name"))
        rows = roles.mappings().all()
        if not rows:
            print("⚠️ لا توجد أدوار في الجدول roles")
            return
        print("📝 الأدوار المتاحة:")
        for row in rows:
            print(f"- {row['name']} (id={row['id']})")
    finally:
        db.close()


if __name__ == "__main__":
    list_roles()
