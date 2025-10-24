from pydantic_settings import BaseSettings


class Settings(BaseSettings):
  DATABASE_URL: str = "postgresql+psycopg://audit:auditpw@db:5432/auditdb"
  JWT_SECRET: str = "devsecret"
  REDIS_URL: str = "redis://redis:6379/0"
  S3_ENDPOINT: str = "http://minio:9000"
  S3_BUCKET: str = "auditevidence"

  class Config:
    env_file = ".env"


settings = Settings()
