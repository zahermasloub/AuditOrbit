"""
التحقق من بيانات مستخدم Admin
"""
from sqlalchemy import text
from app.infrastructure.db.session import SessionLocal
from app.infrastructure.security.passwords import verify_password

def check_admin():
    db = SessionLocal()
    try:
        # البحث عن المستخدم
        user = db.execute(
            text("SELECT id, email, name, password, role FROM users WHERE email = :email"),
            {"email": "admin@audit.com"}
        ).mappings().first()
        
        if not user:
            print("❌ المستخدم غير موجود!")
            print("\n🔧 قم بتشغيل:")
            print("   python create_test_admin.py")
            return
        
        print("✅ المستخدم موجود:")
        print(f"   ID: {user['id']}")
        print(f"   البريد: {user['email']}")
        print(f"   الاسم: {user['name']}")
        print(f"   الدور: {user['role']}")
        print(f"   Password Hash: {user['password'][:50]}...")
        
        # اختبار كلمة المرور
        password_valid = verify_password("admin123", user['password'])
        
        if password_valid:
            print("\n✅ كلمة المرور صحيحة!")
        else:
            print("\n❌ كلمة المرور خاطئة!")
            print("\n🔧 لإصلاح كلمة المرور، قم بتشغيل:")
            print("   python update_admin_password.py")
        
    except Exception as e:
        print(f"❌ خطأ: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_admin()
