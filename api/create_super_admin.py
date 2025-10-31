"""
إنشاء حساب Super Admin يمتلك جميع الصلاحيات
- ينشئ/يحدث دور 'Admin' إن لم يكن موجوداً
- ينشئ مستخدم بالبريد وكلمة المرور المحددين أو يحدث كلمة مروره إن وجد
- يربط المستخدم بدور Admin في جدول user_roles
"""
from sqlalchemy import text
from app.infrastructure.db.session import SessionLocal
from app.infrastructure.security.passwords import hash_password

DEFAULT_EMAIL = "superadmin@audit.com"
DEFAULT_PASSWORD = "SuperAdmin#2025"
DEFAULT_NAME = "Super Admin"
DEFAULT_LOCALE = "ar"
ROLE_NAME = "Admin"


def ensure_admin_role(db) -> str:
    role_id = db.execute(text("SELECT id::text FROM roles WHERE name = :name"), {"name": ROLE_NAME}).scalar_one_or_none()
    if role_id:
        return role_id
    # أنشئ الدور Admin إذا لم يكن موجود
    role_id = db.execute(
        text("""
            INSERT INTO roles (id, name, description, "createdAt")
            VALUES (gen_random_uuid(), :name, :desc, now())
            RETURNING id::text
        """),
        {"name": ROLE_NAME, "desc": "Super administrator with full access"}
    ).scalar_one()
    return role_id


def ensure_user(db, email: str, password: str, name: str) -> str:
    user = db.execute(text("SELECT id::text FROM users WHERE email = :email"), {"email": email}).scalar_one_or_none()
    if user:
        # حدث كلمة المرور والاسم والدور واللوكال والتفعيل
        db.execute(
            text("""
                UPDATE users
                SET name = :name,
                    password = :password,
                    role = :role,
                    locale = :locale,
                    active = true,
                    "updatedAt" = now()
                WHERE email = :email
            """),
            {
                "name": name,
                "password": hash_password(password),
                "role": ROLE_NAME,
                "locale": DEFAULT_LOCALE,
                "email": email,
            }
        )
        return user
    # أنشئ المستخدم
    user_id = db.execute(
        text("""
            INSERT INTO users (id, email, name, password, role, locale, "createdAt", "updatedAt", active)
            VALUES (gen_random_uuid(), :email, :name, :password, :role, :locale, now(), now(), true)
            RETURNING id::text
        """),
        {
            "email": email,
            "name": name,
            "password": hash_password(password),
            "role": ROLE_NAME,
            "locale": DEFAULT_LOCALE,
        }
    ).scalar_one()
    return user_id


def ensure_user_role_mapping(db, user_id: str, role_id: str) -> None:
    existing = db.execute(
        text('SELECT 1 FROM user_roles WHERE "userId"::text = :uid AND "roleId"::text = :rid LIMIT 1'),
        {"uid": user_id, "rid": role_id}
    ).scalar_one_or_none()
    if existing:
        return
    db.execute(
        text('INSERT INTO user_roles (id, "userId", "roleId") VALUES (gen_random_uuid(), :uid, :rid)'),
        {"uid": user_id, "rid": role_id}
    )


def main(email: str = DEFAULT_EMAIL, password: str = DEFAULT_PASSWORD, name: str = DEFAULT_NAME) -> None:
    db = SessionLocal()
    try:
        role_id = ensure_admin_role(db)
        user_id = ensure_user(db, email=email, password=password, name=name)
        ensure_user_role_mapping(db, user_id=user_id, role_id=role_id)
        db.commit()
        print("\n✅ تم إنشاء/تحديث حساب Super Admin بنجاح")
        print(f"📧 البريد الإلكتروني: {email}")
        print(f"🔑 كلمة المرور: {password}")
        print(f"🎭 الدور: {ROLE_NAME}")
        print("🚪 الوصول: جميع الصفحات والصلاحيات")
    except Exception as e:
        db.rollback()
        print(f"❌ خطأ: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
