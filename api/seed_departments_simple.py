#!/usr/bin/env python3
"""Seed departments using direct DB connection.
Set DATABASE_URL environment variable or update the connection string below.
"""

import os
import sys
from sqlalchemy import create_engine, text

# Get database URL from environment or use default
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/auditOrbit"
)

DEPARTMENTS = [
    "الإدارة المالية",
    "إدارة الموارد البشرية",
    "إدارة تقنية المعلومات",
    "إدارة المشتريات",
    "إدارة العمليات",
    "إدارة المبيعات",
    "إدارة الجودة",
    "إدارة المخاطر",
]

def main() -> None:
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            for name in DEPARTMENTS:
                conn.execute(
                    text("INSERT INTO departments(name) VALUES (:name) ON CONFLICT (name) DO NOTHING"),
                    {"name": name},
                )
            conn.commit()
            print(f"✅ Seeded {len(DEPARTMENTS)} departments (existing rows preserved)")
    except Exception as e:
        print(f"❌ Error seeding departments: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
