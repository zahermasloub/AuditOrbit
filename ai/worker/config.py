import os


class Config:
  S3_ENDPOINT = os.getenv("S3_ENDPOINT", "http://minio:9000")
  S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY", "minioadmin")
  S3_SECRET_KEY = os.getenv("S3_SECRET_KEY", "minioadmin")
  S3_BUCKET = os.getenv("S3_BUCKET", "auditorbit")
  REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
  QUEUE_NAME = os.getenv("AI_QUEUE", "ai-tasks")
  DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://audit:auditpw@db:5432/auditdb")
  TMP_DIR = os.getenv("AI_TMP", "/tmp/ai")
