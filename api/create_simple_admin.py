#!/usr/bin/env python3
"""
Create a test admin user with known credentials
"""
import sys
from sqlalchemy import create_engine, text

# Database connection
DATABASE_URL = "postgresql://audit:auditpw@localhost:5432/auditdb"

def create_admin():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # First, delete existing admin@example.com if exists
        conn.execute(text("DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE email = 'admin@example.com')"))
        conn.execute(text("DELETE FROM users WHERE email = 'admin@example.com'"))
        
        # Create new admin with simple password: admin123
        result = conn.execute(text("""
            INSERT INTO users (email, name, password_hash, active)
            VALUES ('admin@example.com', 'Admin', crypt('admin123', gen_salt('bf')), true)
            RETURNING id
        """))
        user_id = result.fetchone()[0]
        
        # Assign admin role (role_id = 1)
        conn.execute(text("""
            INSERT INTO user_roles (user_id, role_id)
            VALUES (:user_id, 1)
        """), {"user_id": user_id})
        
        conn.commit()
        print(f"✅ Admin user created successfully!")
        print(f"   Email: admin@example.com")
        print(f"   Password: admin123")
        print(f"   User ID: {user_id}")

if __name__ == "__main__":
    try:
        create_admin()
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)
