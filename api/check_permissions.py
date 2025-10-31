"""
فحص صلاحيات المستخدم الحالي
Check current user permissions
"""
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://audit:auditpw@localhost:5432/auditdb"

try:
    engine = create_engine(DATABASE_URL)
    conn = engine.connect()
    
    print("=" * 90)
    print("🔍 فحص صلاحيات المستخدم")
    print("=" * 90)
    
    # Check current user
    print("\n1️⃣ المستخدم الحالي:")
    current_user = conn.execute(text("SELECT current_user")).scalar()
    print(f"   👤 {current_user}")
    
    # Check table owner
    print("\n2️⃣ مالك جدول users:")
    owner_query = text("""
        SELECT tableowner 
        FROM pg_tables 
        WHERE tablename = 'users' AND schemaname = 'public'
    """)
    owner = conn.execute(owner_query).scalar()
    print(f"   👤 {owner}")
    
    # Check if user has permissions
    print("\n3️⃣ صلاحيات المستخدم على جدول users:")
    perms_query = text("""
        SELECT 
            privilege_type
        FROM information_schema.table_privileges 
        WHERE table_name = 'users' 
        AND grantee = current_user
        ORDER BY privilege_type
    """)
    perms = conn.execute(perms_query).fetchall()
    
    if perms:
        for perm in perms:
            print(f"   ✅ {perm[0]}")
    else:
        print("   ❌ لا توجد صلاحيات مباشرة")
    
    # Check database owner
    print("\n4️⃣ مالك قاعدة البيانات:")
    db_owner_query = text("""
        SELECT pg_catalog.pg_get_userbyid(d.datdba) as owner
        FROM pg_catalog.pg_database d
        WHERE d.datname = 'auditdb'
    """)
    db_owner = conn.execute(db_owner_query).scalar()
    print(f"   👤 {db_owner}")
    
    # Solution
    print("\n" + "=" * 90)
    print("💡 الحل المقترح:")
    print("=" * 90)
    print("\nقم بتنفيذ الأمر التالي في PostgreSQL كمستخدم postgres أو مالك الجدول:\n")
    print("  ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;")
    print("  UPDATE users SET active = true WHERE active IS NULL;")
    print("  CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);\n")
    print("أو:")
    print(f"  ALTER TABLE users OWNER TO {current_user};")
    print("=" * 90)
    
    conn.close()
    
except Exception as e:
    print(f"❌ خطأ: {e}")
    import traceback
    traceback.print_exc()
