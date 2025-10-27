"""Test if all imports work"""
import sys
sys.path.insert(0, 'd:/AuditOrbit/api')

try:
    print("Testing imports...")
    
    print("1. Testing infrastructure.exception_handlers...")
    from app.infrastructure.exception_handlers import setup_exception_handlers
    print("   ✅ OK")
    
    print("2. Testing security.passwords...")
    from app.infrastructure.security.passwords import hash_password, verify_password
    print("   ✅ OK")
    
    print("3. Testing auth router...")
    from app.presentation.routers import auth
    print("   ✅ OK")
    
    print("4. Testing main app...")
    from app.presentation.main import app
    print("   ✅ OK")
    
    print("\n✅ All imports successful!")
    
except Exception as e:
    print(f"\n❌ Import failed: {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()
