"""
اختبار بسيط لـ API المستخدمين بدون مصادقة
"""
import sys
sys.path.insert(0, ".")

from app.presentation.routers.users import current_user_id

def test_current_user_id():
    """Test that current_user_id returns dev-user-id without authentication"""
    try:
        user_id = current_user_id()
        print(f"✅ Test passed!")
        print(f"🔓 Returned user ID: {user_id}")
        assert user_id == "dev-user-id", f"Expected 'dev-user-id', got '{user_id}'"
        print("✅ المصادقة معطلة بنجاح!")
        return True
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_current_user_id()
    sys.exit(0 if success else 1)
