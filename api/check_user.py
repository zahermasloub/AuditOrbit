#!/usr/bin/env python3
"""Script to check and create admin user in database"""

from app.infrastructure.db.session import SessionLocal
from sqlalchemy import text

def check_user():
    db = SessionLocal()
    try:
        # First, check if tables exist
        tables = db.execute(text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")).fetchall()
        print(f"📊 Tables in database: {[t[0] for t in tables]}")
        
        # Check if user exists
        result = db.execute(text("SELECT email, name FROM users WHERE email = 'admin@example.com'")).fetchone()
        
        if result:
            print(f"✅ User found: {result[0]} - {result[1]}")
            
            # Check role with correct column names (camelCase)
            role_result = db.execute(text("""
                SELECT r.name 
                FROM user_roles ur 
                JOIN roles r ON ur."roleId" = r.id 
                JOIN users u ON ur."userId" = u.id 
                WHERE u.email = 'admin@example.com'
            """)).fetchone()
            
            if role_result:
                print(f"✅ User role: {role_result[0]}")
            else:
                print("❌ User has no role assigned!")
        else:
            print("❌ User NOT found in database!")
            print("Need to run migrations...")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_user()
