#!/usr/bin/env python3
"""Script to check engagements table structure"""

from app.infrastructure.db.session import SessionLocal
from sqlalchemy import text

def check_engagements_table():
    db = SessionLocal()
    try:
        # Get columns from engagements table
        columns = db.execute(text("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'engagements'
            ORDER BY ordinal_position
        """)).fetchall()
        
        print("📊 Engagements table columns:")
        print("-" * 80)
        for col in columns:
            nullable = "NULL" if col[2] == "YES" else "NOT NULL"
            default = f"DEFAULT {col[3]}" if col[3] else ""
            print(f"  {col[0]:20} {col[1]:15} {nullable:10} {default}")
        
        # Check if table has data
        count = db.execute(text("SELECT COUNT(*) FROM engagements")).scalar()
        print(f"\n📈 Total engagements: {count}")
        
        # Check annual_plans
        print("\n📊 Annual plans:")
        plans = db.execute(text("SELECT id, year, title, status FROM annual_plans")).fetchall()
        for plan in plans:
            print(f"  ID: {plan[0]}, Year: {plan[1]}, Title: {plan[2]}, Status: {plan[3]}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_engagements_table()
