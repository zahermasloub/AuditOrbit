#!/usr/bin/env python3
from app.infrastructure.db.session import SessionLocal
from sqlalchemy import text

s = SessionLocal()
try:
    # Get the actual table definition
    result = s.execute(text("""
        SELECT 
            attname AS column_name,
            format_type(atttypid, atttypmod) AS data_type
        FROM pg_attribute
        WHERE attrelid = 'engagements'::regclass
        AND attnum > 0
        AND NOT attisdropped
        ORDER BY attnum
    """)).fetchall()
    
    print("📊 Engagements columns (from pg_attribute):")
    for row in result:
        print(f"  {row[0]}: {row[1]}")
    
    # Try both naming conventions
    print("\n🔍 Testing queries:")
    
    try:
        r1 = s.execute(text('SELECT "startDate" FROM engagements LIMIT 1')).fetchone()
        print(f"✅ \"startDate\" works: {r1}")
    except Exception as e:
        print(f"❌ \"startDate\" failed: {e}")
    
    try:
        r2 = s.execute(text('SELECT start_date FROM engagements LIMIT 1')).fetchone()
        print(f"✅ start_date works: {r2}")
    except Exception as e:
        print(f"❌ start_date failed: {e}")
    
    try:
        r3 = s.execute(text('SELECT "start_date" FROM engagements LIMIT 1')).fetchone()
        print(f"✅ \"start_date\" works: {r3}")
    except Exception as e:
        print(f"❌ \"start_date\" failed: {e}")

finally:
    s.close()
