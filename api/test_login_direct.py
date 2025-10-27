"""Direct test of login endpoint"""
import sys
sys.path.insert(0, 'd:/AuditOrbit/api')

from app.infrastructure.db.session import SessionLocal
from sqlalchemy import text
from app.infrastructure.security.passwords import verify_password
from app.infrastructure.security.jwt import create_token

print("🔍 Testing login logic directly...")

# Test 1: Get user from database
print("\n1️⃣ Fetching user from database...")
db = SessionLocal()
user = db.execute(
    text('SELECT id, email, name, password as hashed_password, locale FROM users WHERE email = :email'),
    {"email": "admin@example.com"}
).mappings().first()

if not user:
    print("   ❌ User not found!")
    exit(1)

print(f"   ✅ User found: {user['email']}")
print(f"   ID: {user['id']}")
print(f"   Name: {user['name']}")
print(f"   Hash (first 20): {user['hashed_password'][:20]}...")

# Test 2: Verify password
print("\n2️⃣ Verifying password...")
try:
    password_valid = verify_password("Admin#2025", user["hashed_password"])
    if password_valid:
        print("   ✅ Password is valid!")
    else:
        print("   ❌ Password is invalid!")
        exit(1)
except Exception as e:
    print(f"   ❌ Error verifying password: {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()
    exit(1)

# Test 3: Create tokens
print("\n3️⃣ Creating JWT tokens...")
try:
    user_id_str = str(user["id"])
    print(f"   User ID string: {user_id_str}")
    
    access_token = create_token(user_id_str, 3600)
    refresh_token = create_token(user_id_str, 86400)
    
    print(f"   ✅ Access token created: {access_token[:40]}...")
    print(f"   ✅ Refresh token created: {refresh_token[:40]}...")
    
except Exception as e:
    print(f"   ❌ Error creating tokens: {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()
    exit(1)

db.close()
print("\n✅ All steps successful! Login logic works.")
