from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  model_config = SettingsConfigDict(
    env_file=".env",
    extra="ignore"  # Ignore extra fields from .env file
  )

  DATABASE_URL: str = "postgresql+psycopg://audit:auditpw@localhost:5432/auditdb"
  JWT_SECRET: str = "devsecret"
  REDIS_URL: str = "redis://localhost:6379/0"
  S3_ENDPOINT: str = "http://localhost:9000"
  S3_BUCKET: str = "auditevidence"


settings = Settings()
