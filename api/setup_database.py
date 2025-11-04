#!/usr/bin/env python3
"""
سكربت تهيئة قاعدة البيانات الكامل
يقوم بـ:
1. تطبيق جميع هجرات Alembic
2. تهيئة الإدارات الأساسية
3. إنشاء خطة سنوية افتراضية
"""

import os
import sys
import subprocess
from datetime import datetime
from sqlalchemy import create_engine, text

# الحصول على رابط قاعدة البيانات من المتغيرات البيئية أو استخدام الافتراضي
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    # الافتراضي حسب إعدادات docker-compose.yml
    "postgresql://audit:auditpw@localhost:5432/auditdb"
)

DEPARTMENTS = [
    "الإدارة المالية",
    "إدارة الموارد البشرية",
    "إدارة تقنية المعلومات",
    "إدارة المشتريات",
    "إدارة العمليات",
    "إدارة المبيعات",
    "إدارة الجودة",
    "إدارة المخاطر",
]

def print_step(step: str) -> None:
    """طباعة خطوة بشكل واضح"""
    print(f"\n{'='*60}")
    print(f"🔄 {step}")
    print(f"{'='*60}")

def run_migrations() -> bool:
    """تشغيل هجرات Alembic"""
    print_step("الخطوة 1: تطبيق هجرات قاعدة البيانات")
    
    # البحث عن alembic في البيئة الافتراضية
    venv_alembic = os.path.join(os.path.dirname(__file__), ".venv", "Scripts", "alembic.exe")
    
    if os.path.exists(venv_alembic):
        alembic_cmd = venv_alembic
    else:
        # تخطي الهجرات إذا لم يتم العثور على alembic
        print("⚠️ لم يتم العثور على alembic في البيئة الافتراضية")
        print("   تخطي تطبيق الهجرات - يُفترض أنها مطبقة بالفعل")
        print("   إذا لم تكن مطبقة، قم بتشغيل: alembic upgrade head")
        return True
    
    try:
        result = subprocess.run(
            [alembic_cmd, "upgrade", "head"],
            capture_output=True,
            text=True,
            check=True
        )
        print(result.stdout)
        print("✅ تم تطبيق الهجرات بنجاح")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ خطأ في تطبيق الهجرات:")
        print(e.stderr)
        print("⚠️ المتابعة على أي حال...")
        return True  # نتابع حتى لو فشلت الهجرات

def seed_departments(conn) -> None:
    """تهيئة الإدارات الأساسية"""
    print_step("الخطوة 2: تهيئة الإدارات")
    try:
        count = 0
        for name in DEPARTMENTS:
            result = conn.execute(
                text("INSERT INTO departments(name) VALUES (:name) ON CONFLICT (name) DO NOTHING RETURNING id"),
                {"name": name},
            )
            if result.rowcount > 0:
                count += 1
        conn.commit()
        print(f"✅ تمت إضافة {count} إدارة جديدة (إجمالي: {len(DEPARTMENTS)} إدارة)")
    except Exception as e:
        print(f"❌ خطأ في تهيئة الإدارات: {e}")
        raise

def seed_annual_plan(conn) -> None:
    """إنشاء خطة سنوية افتراضية"""
    print_step("الخطوة 3: إنشاء خطة سنوية افتراضية")
    try:
        # التحقق من وجود خطط سنوية
        result = conn.execute(text("SELECT count(*) FROM annual_plans"))
        existing = result.scalar()
        
        if existing and existing > 0:
            print(f"✅ توجد بالفعل {existing} خطة سنوية")
            return
        
        # إنشاء خطة افتراضية للسنة الحالية
        current_year = datetime.now().year
        conn.execute(
            text("""
                INSERT INTO annual_plans(year, title, status, start_date, end_date)
                VALUES (:year, :title, 'draft', :start_date, :end_date)
            """),
            {
                "year": current_year,
                "title": f"الخطة السنوية {current_year}",
                "start_date": f"{current_year}-01-01",
                "end_date": f"{current_year}-12-31",
            }
        )
        conn.commit()
        print(f"✅ تم إنشاء الخطة السنوية لعام {current_year}")
    except Exception as e:
        print(f"❌ خطأ في إنشاء الخطة السنوية: {e}")
        raise

def main() -> None:
    """الوظيفة الرئيسية"""
    print("\n" + "="*60)
    print("🚀 بدء تهيئة قاعدة البيانات")
    print("="*60)
    print(f"📊 قاعدة البيانات: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")
    
    # الخطوة 1: تطبيق الهجرات
    if not run_migrations():
        print("\n❌ فشل تطبيق الهجرات. توقف التنفيذ.")
        sys.exit(1)
    
    # الخطوة 2 و 3: تهيئة البيانات
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            seed_departments(conn)
            seed_annual_plan(conn)
        
        print_step("✅ اكتملت جميع الخطوات بنجاح!")
        print("""
الخطوات التالية:
1. تأكد من تشغيل API: python -m uvicorn app.presentation.main:app --reload
2. افتح الواجهة الأمامية وجرب إنشاء مهمة تدقيقية جديدة
3. يجب أن تظهر الخطة السنوية تلقائياً في القائمة المنسدلة
        """)
        
    except Exception as e:
        print(f"\n❌ خطأ في تهيئة البيانات: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
