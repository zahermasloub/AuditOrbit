#!/usr/bin/env python3
"""Seed initial departments into the departments table.
Run with the API environment configured (DB connection) and alembic upgrades applied.
"""

from sqlalchemy import text
from app.infrastructure.db.session import SessionLocal

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
  db = SessionLocal()
  try:
    for name in DEPARTMENTS:
      db.execute(
        text("INSERT INTO departments(name) VALUES (:name) ON CONFLICT (name) DO NOTHING"),
        {"name": name},
      )
    db.commit()
    print(f"✅ Seeded {len(DEPARTMENTS)} departments (existing rows preserved)")
  except Exception as e:  # noqa: BLE001
    db.rollback()
    print(f"❌ Error seeding departments: {e}")
    raise
  finally:
    db.close()


if __name__ == "__main__":
  main()
