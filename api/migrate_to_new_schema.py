#!/usr/bin/env python3
"""
Migration script to consolidate database to new schema
This script will:
1. Check what data exists in old tables (if any)
2. Keep only the new schema tables
3. Update all API code to use new schema
"""

from app.infrastructure.db.session import SessionLocal
from sqlalchemy import text

def analyze_database():
    db = SessionLocal()
    try:
        print("="*80)
        print("DATABASE ANALYSIS")
        print("="*80)
        
        # Check all tables
        tables = db.execute(text("""
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename
        """)).fetchall()
        
        print("\n📊 All tables in database:")
        for table in tables:
            count = db.execute(text(f'SELECT COUNT(*) FROM "{table[0]}"')).scalar()
            print(f"  - {table[0]:30} ({count} rows)")
        
        print("\n" + "="*80)
        print("SCHEMA DECISION")
        print("="*80)
        print("\n✅ KEEPING: New schema (camelCase columns)")
        print("   Tables: engagements, annual_plans, users, roles, user_roles, etc.")
        print("\n🔧 ACTION NEEDED: Update all API routers to use camelCase columns")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    analyze_database()
