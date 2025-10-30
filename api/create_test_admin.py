"""
إنشاء مستخدم Admin للاختبار
"""
import sys
from sqlalchemy import text
from app.infrastructure.db.session import SessionLocal
from app.infrastructure.security.passwords import hash_password

def create_admin_user():
    db = SessionLocal()
    try:
        # بيانات المستخدم
        email = "admin@audit.com"
        name = "مدير النظام"
        password = "admin123"  # كلمة المرور البسيطة للاختبار
        role = "Admin"
        
        # التحقق من وجود المستخدم
        existing = db.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": email}
        ).first()
        
        if existing:
            print(f"✅ المستخدم موجود بالفعل: {email}")
            return
        
        # إنشاء المستخدم
        result = db.execute(
            text("""
                INSERT INTO users (id, email, name, password, role, locale, "createdAt", "updatedAt")
                VALUES (gen_random_uuid(), :email, :name, :password, :role, :locale, now(), now())
                RETURNING id, email, name, role
            """),
            {
                "email": email,
                "name": name,
                "password": hash_password(password),
                "role": role,
                "locale": "ar"
            }
        )
        db.commit()
        
        user = result.mappings().first()
        print(f"\n✅ تم إنشاء مستخدم Admin بنجاح!")
        print(f"📧 البريد الإلكتروني: {email}")
        print(f"🔑 كلمة المرور: {password}")
        print(f"👤 الاسم: {name}")
        print(f"🎭 الدور: {role}")
        print(f"\n🚀 يمكنك الآن تسجيل الدخول في /login")
        
    except Exception as e:
        db.rollback()
        print(f"❌ خطأ: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
