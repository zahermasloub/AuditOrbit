from app.infrastructure.db.session import engine
from sqlalchemy import text
import bcrypt

conn = engine.connect()

# Delete existing user
conn.execute(text("DELETE FROM users WHERE email = 'admin@example.com'"))
conn.commit()

# Create new hash with bcrypt directly
hashed = bcrypt.hashpw(b'Admin#2025', bcrypt.gensalt()).decode()

# Insert user
conn.execute(
    text("""
        INSERT INTO users (id, name, email, password, role, locale, "createdAt", "updatedAt") 
        VALUES (gen_random_uuid()::text, :name, :email, :password, :role, :locale, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    """),
    {
        'name': 'Admin User',
        'email': 'admin@example.com',
        'password': hashed,
        'role': 'Admin',
        'locale': 'ar'
    }
)
conn.commit()

print(f'✅ User recreated with new bcrypt hash')
print(f'   Email: admin@example.com')
print(f'   Password: Admin#2025')
print(f'   Hash (first 50 chars): {hashed[:50]}...')

conn.close()
