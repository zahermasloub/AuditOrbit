#!/usr/bin/env python3
from app.infrastructure.db.session import SessionLocal
from sqlalchemy import text

s = SessionLocal()
try:
    # Test with quoted names
    result = s.execute(text('SELECT "startDate", "endDate" FROM engagements LIMIT 1')).fetchone()
    print(f"✅ Quoted names work: {result}")
except Exception as e:
    print(f"❌ Quoted names failed: {e}")

s.close()
