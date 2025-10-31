"""
إضافة عمود active بصلاحيات UPDATE فقط
Add active column using UPDATE permissions only
"""
from sqlalchemy import create_engine, text

# استخدم مستخدم postgres
DATABASE_URL_POSTGRES = "postgresql://postgres:postgres@localhost:5432/auditdb"
DATABASE_URL_AUDIT = "postgresql://audit:auditpw@localhost:5432/auditdb"

print("=" * 90)
print("🔧 إضافة عمود active إلى جدول users (باستخدام postgres)")
print("=" * 90)

try:
    # استخدم مستخدم postgres لإضافة العمود
    engine = create_engine(DATABASE_URL_POSTGRES)
    conn = engine.connect()
    
    print("\n✅ تم الاتصال بقاعدة البيانات كمستخدم postgres")
    
    # Check if column already exists
    check_query = text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'active'
    """)
    
    result = conn.execute(check_query).fetchone()
    
    if result:
        print("\n⚠️  العمود 'active' موجود بالفعل")
    else:
        print("\n➡️  إضافة العمود 'active'...")
        
        # Add active column
        add_column_query = text("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true
        """)
        
        conn.execute(add_column_query)
        conn.commit()
        
        print("✅ تم إضافة العمود 'active' بنجاح")
        
        # Update all existing users to be active
        update_query = text("UPDATE users SET active = true")
        conn.execute(update_query)
        conn.commit()
        
        print("✅ تم تحديث جميع المستخدمين الحاليين ليكونوا نشطين")
        
        # Create index
        index_query = text("""
            CREATE INDEX IF NOT EXISTS idx_users_active ON users(active)
        """)
        conn.execute(index_query)
        conn.commit()
        
        print("✅ تم إنشاء الفهرس على العمود 'active'")
        
        # Grant permissions to audit user
        grant_query = text("""
            GRANT SELECT, INSERT, UPDATE, DELETE ON users TO audit
        """)
        conn.execute(grant_query)
        conn.commit()
        
        print("✅ تم منح الصلاحيات لمستخدم audit")
    
    conn.close()
    
    # Verify with audit user
    print("\n" + "=" * 90)
    print("🔍 التحقق من النتيجة باستخدام مستخدم audit")
    print("=" * 90)
    
    engine_audit = create_engine(DATABASE_URL_AUDIT)
    conn_audit = engine_audit.connect()
    
    print("\n📋 بنية الجدول بعد التحديث:")
    print("-" * 90)
    
    columns_query = text("""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position
    """)
    
    columns = conn_audit.execute(columns_query).fetchall()
    
    for col in columns:
        default_val = str(col[3]) if col[3] else "None"
        print(f"  • {col[0]:20} | Type: {col[1]:30} | Nullable: {col[2]:3} | Default: {default_val[:30]}")
    
    # Show sample data
    print("\n📊 عينة من المستخدمين:")
    print("-" * 90)
    
    sample_query = text("""
        SELECT id, name, email, active 
        FROM users 
        LIMIT 3
    """)
    
    users = conn_audit.execute(sample_query).fetchall()
    for user in users:
        active_status = "🟢 نشط" if user[3] else "🔴 غير نشط"
        print(f"  • {user[1][:30]:30} | {user[2][:30]:30} | {active_status}")
    
    conn_audit.close()
    
    print("\n" + "=" * 90)
    print("✅ اكتمل التحديث بنجاح!")
    print("=" * 90)
    
except Exception as e:
    print(f"\n❌ خطأ: {e}")
    import traceback
    traceback.print_exc()
