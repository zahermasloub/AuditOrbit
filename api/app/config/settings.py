from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  model_config = SettingsConfigDict(
    env_file=".env",
    env_file_encoding="utf-8",
    extra="ignore",  # Ignore extra fields from .env file
    case_sensitive=False
  )

  DATABASE_URL: str
  JWT_SECRET: str = "devsecret"
  REDIS_URL: str
  S3_ENDPOINT: str
  S3_BUCKET: str = "auditevidence"
  S3_ACCESS_KEY: str = "auditorbit"
  S3_SECRET_KEY: str = "auditorbit123"
  
  # Add fields used in .env to avoid validation errors
  WEB_ORIGIN: str = "http://localhost:3000"
  WEB_ORIGINS: str = "http://localhost:3000"


settings = Settings()
