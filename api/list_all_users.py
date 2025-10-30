from sqlalchemy import text
from app.infrastructure.db.session import SessionLocal

db = SessionLocal()
users = db.execute(text('SELECT id, email, name, role FROM users')).mappings().all()
print("\n📋 المستخدمون في قاعدة البيانات:")
print("="*60)
for u in users:
    print(f"📧 {u['email']:35} | 👤 {u['name']:20} | 🎭 {u['role']}")
print("="*60)
db.close()
