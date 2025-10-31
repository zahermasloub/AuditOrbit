"""
عرض بيانات المستخدمين من قاعدة بيانات PostgreSQL
Display users from PostgreSQL database
"""

print("=" * 80)
print("📋 معلومات المستخدمين الحاليين في نظام AuditOrbit")
print("=" * 80)

# بيانات الاتصال بقاعدة البيانات
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "auditdb"
DB_USER = "audit"
DB_PASS = "auditpw"

print(f"\n🔗 الاتصال بقاعدة البيانات:")
print(f"   Host: {DB_HOST}:{DB_PORT}")
print(f"   Database: {DB_NAME}")
print(f"   User: {DB_USER}")

try:
    import psycopg2
    
    # الاتصال بقاعدة البيانات
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )
    
    cursor = conn.cursor()
    
    print("\n✅ تم الاتصال بنجاح!")
    
    # استعلام المستخدمين
    cursor.execute("""
        SELECT 
            id,
            email, 
            name, 
            role,
            "createdAt",
            "updatedAt"
        FROM users 
        ORDER BY "createdAt" DESC
    """)
    
    users = cursor.fetchall()
    
    print("\n" + "=" * 80)
    print(f"📊 عدد المستخدمين: {len(users)}")
    print("=" * 80)
    
    if users:
        for idx, user in enumerate(users, 1):
            user_id, email, name, role, created, updated = user
            print(f"\n👤 المستخدم #{idx}")
            print(f"   🆔 ID: {user_id}")
            print(f"   📧 البريد الإلكتروني: {email}")
            print(f"   👨‍💼 الاسم: {name}")
            print(f"   🎭 الدور: {role}")
            print(f"   📅 تاريخ الإنشاء: {created}")
            print(f"   🔄 آخر تحديث: {updated}")
            print("-" * 80)
        
        # محاولة عرض كلمات المرور المخزنة (hashed)
        print("\n" + "=" * 80)
        print("🔐 ملاحظة: كلمات المرور مخزنة بشكل مشفر (hashed)")
        print("=" * 80)
        
        cursor.execute('SELECT email, password FROM users LIMIT 3')
        pwd_samples = cursor.fetchall()
        
        for email, pwd_hash in pwd_samples:
            print(f"\n📧 {email}")
            print(f"   🔒 Hash: {pwd_hash[:50]}..." if pwd_hash else "   ⚠️  No password set")
            
    else:
        print("\n⚠️  لا يوجد مستخدمين في قاعدة البيانات")
    
    cursor.close()
    conn.close()
    
except ImportError:
    print("\n❌ مكتبة psycopg2 غير مثبتة")
    print("   قم بتثبيتها: pip install psycopg2-binary")
    
except Exception as e:
    print(f"\n❌ خطأ في الاتصال: {e}")
    print("\n💡 تأكد من:")
    print("   1. PostgreSQL يعمل")
    print("   2. قاعدة البيانات auditdb موجودة")
    print("   3. المستخدم audit لديه صلاحيات")

print("\n" + "=" * 80)
print("📝 بيانات تسجيل الدخول المعروفة:")
print("=" * 80)

users_info = [
    {
        "email": "admintest@test.com",
        "password": "zaher123456",
        "role": "Admin",
        "note": "تم تحديثه في update_password.py"
    },
    {
        "email": "admin@example.com",
        "password": "Admin#2025",
        "role": "Admin",
        "note": "تم إنشاؤه في create_user.py"
    }
]

for idx, user in enumerate(users_info, 1):
    print(f"\n🔑 حساب {idx}:")
    print(f"   📧 Email: {user['email']}")
    print(f"   🔐 Password: {user['password']}")
    print(f"   🎭 Role: {user['role']}")
    print(f"   ℹ️  {user['note']}")

print("\n" + "=" * 80)
print("🌐 رابط تسجيل الدخول:")
print("   http://localhost:3000/login")
print("=" * 80)
