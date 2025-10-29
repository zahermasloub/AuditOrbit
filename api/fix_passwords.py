"""
إصلاح كلمات المرور للمستخدمين
Fix user passwords using bcrypt directly
"""

from sqlalchemy import create_engine, text
import bcrypt

DATABASE_URL = "postgresql://audit:auditpw@localhost:5432/auditdb"

print("=" * 90)
print("🔧 إصلاح كلمات المرور")
print("=" * 90)

# بيانات المستخدمين
users_to_fix = [
    {"email": "admin@example.com", "password": "Admin#2025", "name": "Admin"},
    {"email": "admintest@test.com", "password": "zaher123456", "name": "Admin Test"}
]

try:
    engine = create_engine(DATABASE_URL)
    conn = engine.connect()
    
    for user_data in users_to_fix:
        email = user_data["email"]
        password = user_data["password"]
        name = user_data["name"]
        
        print(f"\n{'─' * 90}")
        print(f"🔐 تحديث: {email}")
        print(f"{'─' * 90}")
        
        # إنشاء hash جديد باستخدام bcrypt
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
        
        print(f"   📧 Email: {email}")
        print(f"   🔑 Password: {password}")
        print(f"   🔒 New Hash: {hashed[:60]}...")
        
        # تحديث قاعدة البيانات
        update_query = text("""
            UPDATE users 
            SET hashed_password = :hash 
            WHERE email = :email
        """)
        
        conn.execute(update_query, {"hash": hashed, "email": email})
        conn.commit()
        
        print(f"   ✅ تم التحديث بنجاح!")
        
        # التحقق من كلمة المرور الجديدة
        is_valid = bcrypt.checkpw(password_bytes, hashed.encode('utf-8'))
        print(f"   ✅ اختبار التحقق: {'نجح ✓' if is_valid else 'فشل ✗'}")
    
    conn.close()
    
    print("\n" + "=" * 90)
    print("✅ تم إصلاح جميع كلمات المرور بنجاح!")
    print("=" * 90)
    
    print("\n📋 بيانات تسجيل الدخول:")
    print("─" * 90)
    for user_data in users_to_fix:
        print(f"\n   📧 Email:    {user_data['email']}")
        print(f"   🔑 Password: {user_data['password']}")
    
    print("\n" + "=" * 90)
    print("🌐 جرب تسجيل الدخول الآن:")
    print("   http://localhost:3000/login")
    print("=" * 90)
    
except Exception as e:
    print(f"\n❌ خطأ: {e}")
    import traceback
    traceback.print_exc()
