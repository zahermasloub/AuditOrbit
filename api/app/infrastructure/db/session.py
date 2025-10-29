from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

from ...config.settings import settings

# استخدام os.getenv كـ fallback في حالة عدم تحميل المتغيرات من settings
database_url = os.getenv("DATABASE_URL") or settings.DATABASE_URL
print(f"🔍 DATABASE_URL from env: {os.getenv('DATABASE_URL')}")
print(f"🔍 DATABASE_URL from settings: {settings.DATABASE_URL}")
print(f"🔍 Using DATABASE_URL: {database_url}")

engine = create_engine(database_url, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
