#!/usr/bin/env python3
"""Debug engagement creation error"""

from app.infrastructure.db.session import SessionLocal
from sqlalchemy import text
import uuid
import traceback

def test_engagement_creation_detailed():
    db = SessionLocal()
    try:
        user_id = "c532f574-6bf4-4059-84f2-de8c699ac62e"
        year = 2025
        
        print("=" * 80)
        print("STEP 1: Check Annual Plan")
        print("=" * 80)
        
        plan = db.execute(
            text('SELECT id::text AS id FROM annual_plans WHERE "fiscalYear" = :year'),
            {"year": year},
        ).mappings().first()
        
        if plan:
            print(f"✅ Found plan: {plan['id']}")
        else:
            print(f"❌ No plan found for year {year}")
            print("Creating new plan...")
            
            plan_id = str(uuid.uuid4())
            db.execute(
                text('''INSERT INTO annual_plans(
                    id, title, "fiscalYear", version, status, "createdBy", "createdAt", "updatedAt", plan_ref
                ) VALUES (
                    :id, :title, :year, '1.0', 'DRAFT', :user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, :ref
                )'''),
                {
                    "id": plan_id,
                    "year": year,
                    "title": f"Annual Plan {year}",
                    "user_id": user_id,
                    "ref": f"AP-{year}"
                },
            )
            db.commit()
            print(f"✅ Created plan: {plan_id}")
            plan = {"id": plan_id}
        
        print("\n" + "=" * 80)
        print("STEP 2: Create Engagement")
        print("=" * 80)
        
        engagement_id = str(uuid.uuid4())
        code = f"ENG-{year}-{engagement_id[:8].upper()}"
        title = "مراجعة النظام المالي"
        objective = "مراجعة شاملة للنظام المالي والمحاسبي"
        
        print(f"Engagement ID: {engagement_id}")
        print(f"Code: {code}")
        print(f"Title: {title}")
        
        # Check table structure first
        print("\n" + "=" * 80)
        print("STEP 2.1: Verify Table Structure")
        print("=" * 80)
        
        cols = db.execute(text("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'engagements'
            ORDER BY ordinal_position
        """)).fetchall()
        
        print("Engagements table columns:")
        for col in cols:
            nullable = "NULL" if col[2] == "YES" else "NOT NULL"
            default = f"DEFAULT {col[3]}" if col[3] else ""
            print(f"  {col[0]:30} {col[1]:20} {nullable:10} {default}")
        
        print("\n" + "=" * 80)
        print("STEP 2.2: Attempt Insert")
        print("=" * 80)
        
        insert_query = '''
            INSERT INTO engagements(
                id, code, title, objective, "scopeJson", "criteriaJson", 
                "constraintsJson", "auditeeUnitsJson", "stakeholdersJson",
                "startDate", "endDate", "budgetHours", status, "createdBy", 
                "createdAt", "updatedAt"
            )
            VALUES (
                :id, :code, :title, :objective, :scope_json, :criteria_json,
                :constraints_json, :auditee_units_json, :stakeholders_json,
                CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 40, 
                'DRAFT', :user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
            RETURNING id::text AS id, code, title, status
        '''
        
        params = {
            "id": engagement_id,
            "code": code,
            "title": title,
            "objective": objective,
            "scope_json": '{"description": "' + objective + '"}',
            "criteria_json": '[]',
            "constraints_json": '[]',
            "auditee_units_json": '[]',
            "stakeholders_json": '[]',
            "user_id": user_id,
        }
        
        print("Executing insert...")
        created = db.execute(text(insert_query), params).mappings().first()
        db.commit()
        
        print(f"\n✅ SUCCESS!")
        print(f"  ID: {created['id']}")
        print(f"  Code: {created['code']}")
        print(f"  Title: {created['title']}")
        print(f"  Status: {created['status']}")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print(f"\nError type: {type(e).__name__}")
        print("\nFull traceback:")
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_engagement_creation_detailed()
