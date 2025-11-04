#!/usr/bin/env python3
"""Seed a default annual plan using direct DB connection.
Set DATABASE_URL environment variable or update the connection string below.
"""

import os
import sys
from datetime import datetime
from sqlalchemy import create_engine, text

# Get database URL from environment or use default
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/auditOrbit"
)

def main() -> None:
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            # Check if any plans exist
            result = conn.execute(text("SELECT count(*) FROM annual_plans"))
            existing = result.scalar()
            
            if existing and existing > 0:
                print(f"✅ Annual plans already exist ({existing} found)")
                return
            
            # Insert default plan for current year
            current_year = datetime.now().year
            conn.execute(
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
            conn.commit()
            print(f"✅ Created default annual plan for year {current_year}")
    except Exception as e:
        print(f"❌ Error seeding annual plan: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
