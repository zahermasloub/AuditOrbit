#!/usr/bin/env python3
"""Script to assign Admin role to admin@example.com"""

from app.infrastructure.db.session import SessionLocal
from sqlalchemy import text

def fix_admin_user():
    db = SessionLocal()
    try:
        # Get user ID
        user = db.execute(text("SELECT id FROM users WHERE email = 'admin@example.com'")).fetchone()
        if not user:
            print("❌ User not found!")
            return
        
        user_id = user[0]
        print(f"✅ User ID: {user_id}")
        
        # Check if Admin role exists
        role = db.execute(text("SELECT id, name FROM roles WHERE name = 'Admin'")).fetchone()
        if not role:
            print("❌ Admin role not found! Creating it...")
            db.execute(text("INSERT INTO roles (id, name) VALUES (1, 'Admin')"))
            db.commit()
            role_id = 1
        else:
            role_id = role[0]
            print(f"✅ Admin role ID: {role_id}")
        
        # Check column names in user_roles table
        columns = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'user_roles'
        """)).fetchall()
        print(f"📊 user_roles columns: {[c[0] for c in columns]}")
        
        # Determine correct column names
        col_names = [c[0] for c in columns]
        user_col = 'userId' if 'userId' in col_names else 'user_id'
        role_col = 'roleId' if 'roleId' in col_names else 'role_id'
        
        # Check if assignment already exists
        existing = db.execute(text(f'SELECT * FROM user_roles WHERE "{user_col}" = :uid AND "{role_col}" = :rid'), 
                             {"uid": user_id, "rid": role_id}).fetchone()
        
        if existing:
            print("✅ User already has Admin role assigned!")
        else:
            print("➕ Assigning Admin role to user...")
            # Generate a UUID for the id column
            import uuid
            new_id = str(uuid.uuid4())
            db.execute(text(f'INSERT INTO user_roles (id, "{user_col}", "{role_col}") VALUES (:id, :uid, :rid)'),
                      {"id": new_id, "uid": user_id, "rid": role_id})
            db.commit()
            print("✅ Admin role assigned successfully!")
        
        # Verify
        verification = db.execute(text(f"""
            SELECT u.email, r.name 
            FROM user_roles ur 
            JOIN users u ON ur."{user_col}" = u.id 
            JOIN roles r ON ur."{role_col}" = r.id 
            WHERE u.email = 'admin@example.com'
        """)).fetchone()
        
        if verification:
            print(f"✅ Verification: {verification[0]} has role {verification[1]}")
        else:
            print("❌ Verification failed!")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    fix_admin_user()
