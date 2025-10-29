"""
استكشاف بنية جدول المستخدمين وعرض البيانات
"""

from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://audit:auditpw@localhost:5432/auditdb"

print("=" * 90)
print("🔍 استكشاف جدول المستخدمين")
print("=" * 90)

try:
    engine = create_engine(DATABASE_URL)
    conn = engine.connect()
    
    print("\n✅ تم الاتصال بقاعدة البيانات")
    
    # الحصول على أسماء الأعمدة
    print("\n📋 أعمدة جدول users:")
    print("-" * 90)
    
    column_query = text("""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position
    """)
    
    columns = conn.execute(column_query).fetchall()
    
    for col in columns:
        print(f"   • {col[0]:20} | Type: {col[1]:20} | Nullable: {col[2]}")
    
    # عرض المستخدمين باستخدام الأعمدة الموجودة
    print("\n" + "=" * 90)
    print("👥 المستخدمون الموجودون:")
    print("=" * 90)
    
    # استخدام * لعرض كل الأعمدة
    users_query = text("SELECT * FROM users LIMIT 10")
    users = conn.execute(users_query).fetchall()
    
    if users:
        print(f"\n📊 عدد المستخدمين: {len(users)}")
        
        for idx, user in enumerate(users, 1):
            print(f"\n{'─' * 90}")
            print(f"👤 المستخدم #{idx}")
            print(f"{'─' * 90}")
            # عرض كل قيمة مع اسم العمود المقابل
            for i, col in enumerate(columns):
                col_name = col[0]
                col_value = user[i] if i < len(user) else "N/A"
                
                # تنسيق خاص للقيم الطويلة
                if col_name in ['password', 'hashed_password'] and col_value:
                    col_value = str(col_value)[:60] + "..."
                
                print(f"   {col_name:20} = {col_value}")
    else:
        print("\n⚠️ لا يوجد مستخدمين")
    
    conn.close()
    
except Exception as e:
    print(f"\n❌ خطأ: {e}")

print("\n" + "=" * 90)
print("📝 بيانات الدخول المعروفة:")
print("=" * 90)
print("\n🔑 حساب 1: admintest@test.com / zaher123456")
print("🔑 حساب 2: admin@example.com / Admin#2025")
print("=" * 90)
