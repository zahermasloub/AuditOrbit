"""
عرض بيانات المستخدمين من قاعدة البيانات
Display all users with their credentials
"""

from sqlalchemy import create_engine, text

# بيانات الاتصال
DATABASE_URL = "postgresql://audit:auditpw@localhost:5432/auditdb"

print("=" * 90)
print("📋 معلومات المستخدمين الحاليين في نظام AuditOrbit")
print("=" * 90)

try:
    # إنشاء الاتصال
    engine = create_engine(DATABASE_URL)
    conn = engine.connect()
    
    print("\n✅ تم الاتصال بقاعدة البيانات بنجاح!")
    
    # استعلام المستخدمين
    query = text("""
        SELECT 
            id,
            email, 
            name, 
            role,
            locale,
            "createdAt",
            "updatedAt"
        FROM users 
        ORDER BY "createdAt" DESC
    """)
    
    result = conn.execute(query)
    users = result.fetchall()
    
    print(f"\n📊 إجمالي عدد المستخدمين: {len(users)}")
    print("=" * 90)
    
    if users:
        for idx, user in enumerate(users, 1):
            print(f"\n👤 المستخدم رقم {idx}")
            print(f"{'─' * 90}")
            print(f"   🆔 المعرّف (ID):        {user[0]}")
            print(f"   📧 البريد الإلكتروني:  {user[1]}")
            print(f"   👨‍💼 الاسم:              {user[2]}")
            print(f"   🎭 الدور:              {user[3]}")
            print(f"   🌐 اللغة:              {user[4]}")
            print(f"   📅 تاريخ الإنشاء:      {user[5]}")
            print(f"   🔄 آخر تحديث:         {user[6]}")
        
        print("\n" + "=" * 90)
        
        # محاولة عرض معلومات كلمات المرور
        print("🔐 معلومات كلمات المرور:")
        print("=" * 90)
        
        pwd_query = text("SELECT email, password, hashed_password FROM users")
        pwd_result = conn.execute(pwd_query)
        pwd_data = pwd_result.fetchall()
        
        for email, pwd, hashed in pwd_data:
            print(f"\n📧 {email}")
            if pwd:
                print(f"   🔑 Password field: {pwd[:60]}{'...' if len(pwd) > 60 else ''}")
            if hashed:
                print(f"   🔒 Hashed field:   {hashed[:60]}{'...' if len(hashed) > 60 else ''}")
            if not pwd and not hashed:
                print(f"   ⚠️  لا توجد كلمة مرور محفوظة")
    
    else:
        print("\n⚠️  لا يوجد مستخدمين في قاعدة البيانات!")
    
    conn.close()
    print("\n✅ تم إغلاق الاتصال")
    
except Exception as e:
    print(f"\n❌ خطأ: {e}")
    import traceback
    traceback.print_exc()

# عرض بيانات الدخول المعروفة من الكود
print("\n\n" + "=" * 90)
print("📝 بيانات تسجيل الدخول المعروفة (من ملفات الكود):")
print("=" * 90)

credentials = [
    {
        "num": 1,
        "email": "admintest@test.com",
        "password": "zaher123456",
        "role": "Admin",
        "source": "update_password.py",
        "hash_type": "bcrypt (via passlib)"
    },
    {
        "num": 2,
        "email": "admin@example.com",
        "password": "Admin#2025",
        "role": "Admin",
        "source": "create_user.py",
        "hash_type": "bcrypt"
    }
]

for cred in credentials:
    print(f"\n🔑 حساب {cred['num']}:")
    print(f"   📧 Email:    {cred['email']}")
    print(f"   🔐 Password: {cred['password']}")
    print(f"   🎭 Role:     {cred['role']}")
    print(f"   📄 Source:   {cred['source']}")
    print(f"   🔒 Hash:     {cred['hash_type']}")

print("\n" + "=" * 90)
print("🌐 روابط مفيدة:")
print("=" * 90)
print(f"   تسجيل الدخول: http://localhost:3000/login")
print(f"   لوحة التحكم:  http://localhost:3000/dashboard")
print(f"   API:          http://localhost:8000/docs")
print("=" * 90)
