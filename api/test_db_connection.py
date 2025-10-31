#!/usr/bin/env python3
"""Test database connection and column names"""
from app.infrastructure.db.session import SessionLocal
from sqlalchemy import text

s = SessionLocal()
try:
    print("Testing column names in engagements table:")
    
    # Test 1: Get column names from pg_attribute
    columns = s.execute(text("""
        SELECT attname FROM pg_attribute
        WHERE attrelid = 'engagements'::regclass
        AND attnum > 0 AND NOT attisdropped
        AND attname IN ('startDate', 'endDate', 'start_date', 'end_date')
        ORDER BY attnum
    """)).fetchall()
    print(f"Columns found: {[c[0] for c in columns]}")
    
    # Test 2: Try querying with quotes
    try:
        result = s.execute(text('SELECT "startDate", "endDate" FROM engagements LIMIT 1')).fetchone()
        print(f'✅ Quoted names work: {result}')
    except Exception as e:
        print(f'❌ Quoted names failed: {e}')
    
    # Test 3: Try the actual problematic query
    try:
        result = s.execute(text('''
            SELECT AVG(EXTRACT(EPOCH FROM ("endDate" - "startDate")) / 86400)
            FROM engagements 
            WHERE status = 'COMPLETED' AND "endDate" IS NOT NULL
        ''')).scalar_one_or_none()
        print(f'✅ Full query works: {result}')
    except Exception as e:
        print(f'❌ Full query failed: {e}')
        
finally:
    s.close()
