from app.infrastructure.db.session import engine
from sqlalchemy import text
import bcrypt
import uuid

try:
    conn = engine.connect()
    
    # Check if admin@example.com exists
    result = conn.execute(
        text('SELECT email FROM users WHERE email = :email'),
        {'email': 'admin@example.com'}
    )
    existing = result.fetchone()
    
    if existing:
        print('✅ admin@example.com already exists')
    else:
        # Create new admin user
        password = 'Admin#2025'
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user_id = str(uuid.uuid4())
        
        conn.execute(
            text("""
                INSERT INTO users (id, name, email, password, role, locale, "createdAt", "updatedAt") 
                VALUES (:id, :name, :email, :password, :role, :locale, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """),
            {
                'id': user_id,
                'name': 'Admin User',
                'email': 'admin@example.com',
                'password': hashed,
                'role': 'Admin',
                'locale': 'ar'
            }
        )
        conn.commit()
        print(f'✅ Created admin@example.com with password: Admin#2025')
    
    # Verify
    result = conn.execute(
        text('SELECT email, role FROM users WHERE email = :email'),
        {'email': 'admin@example.com'}
    )
    user = result.fetchone()
    if user:
        print(f'✅ Verified: {dict(user._mapping)}')
    
    conn.close()
    
except Exception as e:
    print(f'❌ Error: {e}')
    import traceback
    traceback.print_exc()
