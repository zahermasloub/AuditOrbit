#!/usr/bin/env python3
"""Seed a default annual plan if none exists.
Run after alembic migrations are applied.
"""

from sqlalchemy import text
from app.infrastructure.db.session import SessionLocal
from datetime import datetime

def main() -> None:
  db = SessionLocal()
  try:
    # Check if any plans exist
    existing = db.execute(text("SELECT count(*) FROM annual_plans")).scalar()
    
    if existing and existing > 0:
      print(f"✅ Annual plans already exist ({existing} found)")
      return
    
    # Insert default plan for current year
    current_year = datetime.now().year
    db.execute(
      text("""
        INSERT INTO annual_plans(year, title, status, start_date, end_date)
        VALUES (:year, :title, 'draft', :start_date, :end_date)
      """),
      {
        "year": current_year,
        "title": f"الخطة السنوية {current_year}",
        "start_date": f"{current_year}-01-01",
        "end_date": f"{current_year}-12-31",
      }
    )
    db.commit()
    print(f"✅ Created default annual plan for year {current_year}")
  except Exception as e:  # noqa: BLE001
    db.rollback()
    print(f"❌ Error seeding annual plan: {e}")
    raise
  finally:
    db.close()


if __name__ == "__main__":
  main()
