#!/usr/bin/env python3
"""Test creating an engagement"""

from app.infrastructure.db.session import SessionLocal
from sqlalchemy import text
import uuid

def test_create_engagement():
    db = SessionLocal()
    try:
        user_id = "c532f574-6bf4-4059-84f2-de8c699ac62e"  # Admin user
        year = 2025
        
        # Check if annual plan exists
        plan = db.execute(
            text('SELECT id::text AS id FROM annual_plans WHERE "fiscalYear" = :year'),
            {"year": year},
        ).mappings().first()
        
        if plan is None:
            print(f"Creating annual plan for year {year}...")
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
            print(f"✅ Created annual plan: {plan_id}")
            plan = {"id": plan_id}
        else:
            print(f"✅ Found existing annual plan: {plan['id']}")
        
        # Create engagement
        engagement_id = str(uuid.uuid4())
        code = f"ENG-{year}-{engagement_id[:8].upper()}"
        title = "مراجعة النظام المالي"
        objective = "مراجعة شاملة للنظام المالي والمحاسبي"
        
        print(f"\nCreating engagement...")
        print(f"  ID: {engagement_id}")
        print(f"  Code: {code}")
        print(f"  Title: {title}")
        
        created = db.execute(
            text(
                '''
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
                RETURNING id::text AS id, code, title, objective, status
                '''
            ),
            {
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
            },
        ).mappings().first()
        db.commit()
        
        print(f"\n✅ Engagement created successfully!")
        print(f"  ID: {created['id']}")
        print(f"  Code: {created['code']}")
        print(f"  Title: {created['title']}")
        print(f"  Status: {created['status']}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_create_engagement()
