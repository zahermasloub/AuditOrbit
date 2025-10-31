#!/usr/bin/env python3
from app.infrastructure.db.session import SessionLocal
from sqlalchemy import text

s = SessionLocal()
try:
    print("=== All Tables ===")
    tables = s.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")).fetchall()
    for t in tables:
        print(f"  {t[0]}")
    
    print("\n=== Users table columns ===")
    cols = s.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position")).fetchall()
    for c in cols:
        print(f"  {c[0]}: {c[1]}")
    
    print("\n=== Check for user_roles or permissions table ===")
    role_tables = s.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE '%role%' OR tablename LIKE '%perm%'")).fetchall()
    for t in role_tables:
        print(f"  {t[0]}")
        
finally:
    s.close()
