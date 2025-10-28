import psycopg
from passlib.context import CryptContext

EMAIL = "admintest@test.com"
NEW_PASSWORD = "zaher123456"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed = pwd_context.hash(NEW_PASSWORD)

conn = psycopg.connect("postgresql://audit:auditpw@localhost:5432/auditdb")
cur = conn.cursor()
try:
    cur.execute("UPDATE users SET hashed_password=%s WHERE email=%s RETURNING id", (hashed, EMAIL))
    row = cur.fetchone()
    if not row:
        print("NO_USER")
    else:
        conn.commit()
        print(f"OK:{row[0]}")
finally:
    cur.close()
    conn.close()
