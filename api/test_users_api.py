#!/usr/bin/env python3
"""
اختبار API إدارة المستخدمين
Test Users Management API
"""

import requests
import json

API_URL = "http://localhost:8000"

def test_list_users():
    """اختبار جلب قائمة المستخدمين"""
    print("=" * 60)
    print("🔍 اختبار: جلب قائمة المستخدمين")
    print("=" * 60)
    
    try:
        response = requests.get(f"{API_URL}/users")
        print(f"✅ Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📊 عدد المستخدمين: {data.get('total', 0)}")
            print(f"📄 الصفحة: {data.get('page', 1)}")
            print(f"📏 حجم الصفحة: {data.get('size', 20)}")
            print("\n👥 المستخدمون:")
            for user in data.get('items', []):
                print(f"  - {user['name']} ({user['email']}) - ID: {user['id']}")
                print(f"    الدور: {user.get('role', 'غير محدد')}, نشط: {user.get('active', True)}")
            return data.get('items', [])
        else:
            print(f"❌ فشل الطلب: {response.text}")
            return []
    except Exception as e:
        print(f"❌ خطأ: {e}")
        return []

def test_create_user():
    """اختبار إنشاء مستخدم جديد"""
    print("\n" + "=" * 60)
    print("➕ اختبار: إنشاء مستخدم جديد")
    print("=" * 60)
    
    new_user = {
        "name": "مستخدم اختبار",
        "email": f"test_{int(__import__('time').time())}@test.com",
        "password": "Test123456",
        "role": "User",
        "locale": "ar",
        "active": True
    }
    
    try:
        response = requests.post(f"{API_URL}/users", json=new_user)
        print(f"✅ Status Code: {response.status_code}")
        
        if response.status_code == 200:
            user = response.json()
            print(f"✅ تم إنشاء المستخدم بنجاح!")
            print(f"   ID: {user['id']}")
            print(f"   الاسم: {user['name']}")
            print(f"   البريد: {user['email']}")
            print(f"   الدور: {user.get('role', 'User')}")
            return user
        else:
            print(f"❌ فشل الإنشاء: {response.text}")
            return None
    except Exception as e:
        print(f"❌ خطأ: {e}")
        return None

def test_update_user(user_id: str):
    """اختبار تحديث مستخدم"""
    print("\n" + "=" * 60)
    print(f"✏️ اختبار: تحديث مستخدم ({user_id})")
    print("=" * 60)
    
    update_data = {
        "name": "مستخدم محدث",
        "role": "Auditor"
    }
    
    try:
        response = requests.put(f"{API_URL}/users/{user_id}", json=update_data)
        print(f"✅ Status Code: {response.status_code}")
        
        if response.status_code == 200:
            user = response.json()
            print(f"✅ تم التحديث بنجاح!")
            print(f"   الاسم: {user['name']}")
            print(f"   الدور: {user.get('role', 'User')}")
            return True
        elif response.status_code == 404:
            print(f"⚠️  المستخدم غير موجود (404)")
            return False
        else:
            print(f"❌ فشل التحديث: {response.text}")
            return False
    except Exception as e:
        print(f"❌ خطأ: {e}")
        return False

def test_delete_user(user_id: str):
    """اختبار حذف مستخدم"""
    print("\n" + "=" * 60)
    print(f"🗑️  اختبار: حذف مستخدم ({user_id})")
    print("=" * 60)
    
    try:
        response = requests.delete(f"{API_URL}/users/{user_id}")
        print(f"✅ Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print(f"✅ تم الحذف بنجاح!")
            return True
        elif response.status_code == 404:
            print(f"⚠️  المستخدم غير موجود (404)")
            return False
        else:
            print(f"❌ فشل الحذف: {response.text}")
            return False
    except Exception as e:
        print(f"❌ خطأ: {e}")
        return False

def main():
    """تشغيل جميع الاختبارات"""
    print("\n" + "=" * 60)
    print("🚀 بدء اختبار API إدارة المستخدمين")
    print("=" * 60)
    
    # 1. جلب قائمة المستخدمين الحالية
    users = test_list_users()
    
    # 2. إنشاء مستخدم جديد
    new_user = test_create_user()
    
    if new_user:
        user_id = new_user['id']
        
        # 3. تحديث المستخدم الجديد
        test_update_user(user_id)
        
        # 4. حذف المستخدم الجديد
        test_delete_user(user_id)
        
        # 5. محاولة تحديث مستخدم محذوف (يجب أن يعطي 404)
        test_update_user(user_id)
    
    # 6. جلب القائمة مرة أخرى للتأكد
    print("\n" + "=" * 60)
    print("🔄 التحقق النهائي: جلب القائمة مرة أخرى")
    print("=" * 60)
    test_list_users()
    
    print("\n" + "=" * 60)
    print("✅ انتهت جميع الاختبارات")
    print("=" * 60)

if __name__ == "__main__":
    main()
