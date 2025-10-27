#!/usr/bin/env python3
"""Script to check table structures"""

from app.infrastructure.db.session import SessionLocal
from sqlalchemy import text

def check_tables():
    db = SessionLocal()
    try:
        # Check annual_plans columns
        print("📊 Annual Plans table columns:")
        print("-" * 80)
        columns = db.execute(text("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'annual_plans'
            ORDER BY ordinal_position
        """)).fetchall()
        
        for col in columns:
            nullable = "NULL" if col[2] == "YES" else "NOT NULL"
            print(f"  {col[0]:30} {col[1]:20} {nullable}")
        
        print("\n" + "=" * 80)
        
        # Try to understand the mismatch
        print("\n🔍 Analysis:")
        print("  Backend code expects: annual_plan_id, scope, risk_rating")
        print("  Database has: code, objective, scopeJson, criteriaJson, etc.")
        print("\n  ⚠️  MISMATCH: Database schema doesn't match API code!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_tables()
