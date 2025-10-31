"""
إضافة عمود active إلى جدول users
Add active column to users table
"""
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://audit:auditpw@localhost:5432/auditdb"

print("=" * 90)
print("🔧 إضافة عمود active إلى جدول users")
print("=" * 90)

try:
    engine = create_engine(DATABASE_URL)
    conn = engine.connect()
    
    print("\n✅ تم الاتصال بقاعدة البيانات")
    
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
            ADD COLUMN active BOOLEAN NOT NULL DEFAULT true
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
    
    # Verify structure
    print("\n📋 بنية الجدول بعد التحديث:")
    print("-" * 90)
    
    columns_query = text("""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position
    """)
    
    columns = conn.execute(columns_query).fetchall()
    
    for col in columns:
        print(f"  • {col[0]:20} | Type: {col[1]:30} | Nullable: {col[2]:3} | Default: {col[3]}")
    
    conn.close()
    print("\n" + "=" * 90)
    print("✅ اكتمل التحديث بنجاح!")
    print("=" * 90)
    
except Exception as e:
    print(f"\n❌ خطأ: {e}")
    import traceback
    traceback.print_exc()
