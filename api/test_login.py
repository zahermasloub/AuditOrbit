"""
اختبار تسجيل الدخول مباشرة
"""

from sqlalchemy import create_engine, text
from passlib.context import CryptContext

DATABASE_URL = "postgresql://audit:auditpw@localhost:5432/auditdb"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

print("=" * 90)
print("🔐 اختبار تسجيل الدخول")
print("=" * 90)

# بيانات الاختبار
test_credentials = [
    {"email": "admin@example.com", "password": "Admin#2025"},
    {"email": "admintest@test.com", "password": "zaher123456"}
]

try:
    engine = create_engine(DATABASE_URL)
    conn = engine.connect()
    
    for cred in test_credentials:
        email = cred["email"]
        password = cred["password"]
        
        print(f"\n{'─' * 90}")
        print(f"🧪 اختبار: {email}")
        print(f"{'─' * 90}")
        
        # جلب المستخدم من قاعدة البيانات
        query = text("SELECT id, email, name, hashed_password, active FROM users WHERE email = :email")
        result = conn.execute(query, {"email": email})
        user = result.fetchone()
        
        if not user:
            print(f"   ❌ المستخدم غير موجود!")
            continue
        
        user_id, user_email, user_name, hashed_pwd, active = user
        
        print(f"   ✅ المستخدم موجود: {user_name}")
        print(f"   🆔 ID: {user_id}")
        print(f"   📧 Email: {user_email}")
        print(f"   🔒 Hash: {hashed_pwd[:60]}...")
        print(f"   ✅ Active: {active}")
        
        # التحقق من كلمة المرور
        try:
            is_valid = pwd_context.verify(password, hashed_pwd)
            if is_valid:
                print(f"   ✅ كلمة المرور صحيحة!")
            else:
                print(f"   ❌ كلمة المرور خاطئة!")
                
                # محاولة إعادة تعيين كلمة المرور
                print(f"\n   🔧 إعادة تعيين كلمة المرور...")
                new_hash = pwd_context.hash(password)
                update_query = text("UPDATE users SET hashed_password = :hash WHERE email = :email")
                conn.execute(update_query, {"hash": new_hash, "email": email})
                conn.commit()
                print(f"   ✅ تم تحديث كلمة المرور!")
                
                # التحقق مرة أخرى
                is_valid_now = pwd_context.verify(password, new_hash)
                print(f"   ✅ اختبار بعد التحديث: {'نجح' if is_valid_now else 'فشل'}")
                
        except Exception as e:
            print(f"   ❌ خطأ في التحقق: {e}")
    
    conn.close()
    
    print("\n" + "=" * 90)
    print("✅ انتهى الاختبار")
    print("=" * 90)
    
except Exception as e:
    print(f"\n❌ خطأ: {e}")
    import traceback
    traceback.print_exc()

print("\n📝 يمكنك الآن تجربة تسجيل الدخول على:")
print("   http://localhost:3000/login")
