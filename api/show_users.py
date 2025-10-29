"""
سكريبت لعرض بيانات المستخدمين الحاليين
Display current users from database
"""
import sqlite3
import os

# محاولة الاتصال بقاعدة البيانات
db_path = os.path.join(os.path.dirname(__file__), 'audit.db')

print("=" * 80)
print("🔍 البحث عن قاعدة البيانات...")
print("=" * 80)

if os.path.exists(db_path):
    print(f"✅ قاعدة البيانات موجودة: {db_path}")
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # استعلام المستخدمين
        cursor.execute("SELECT email, name, role FROM users")
        users = cursor.fetchall()
        
        print("\n" + "=" * 80)
        print("📋 قائمة المستخدمين الحاليين:")
        print("=" * 80)
        
        if users:
            for user in users:
                email, name, role = user
                print(f"\n📧 البريد الإلكتروني: {email}")
                print(f"👤 الاسم: {name}")
                print(f"🎭 الدور: {role}")
                print("-" * 80)
        else:
            print("\n⚠️  لا يوجد مستخدمين في قاعدة البيانات")
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"❌ خطأ في الاتصال بقاعدة البيانات: {e}")
        
else:
    print(f"❌ قاعدة البيانات غير موجودة في: {db_path}")
    print("\n🔍 بحث عن قواعد بيانات أخرى...")
    
    # البحث عن ملفات .db
    api_dir = os.path.dirname(__file__)
    for root, dirs, files in os.walk(api_dir):
        for file in files:
            if file.endswith('.db'):
                print(f"   📁 وجدت: {os.path.join(root, file)}")

print("\n" + "=" * 80)
print("ℹ️  معلومات تسجيل الدخول المعروفة:")
print("=" * 80)
print("\n📧 Email: admintest@test.com")
print("🔑 Password: zaher123456")
print("\n📧 Email: admin@example.com")  
print("🔑 Password: Admin#2025")
print("=" * 80)
