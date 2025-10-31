from typing import Any

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
  email: EmailStr
  name: str = Field(min_length=2, max_length=120)
  password: str = Field(min_length=8)
  role: str | None = Field(default="User", min_length=2, max_length=60)
  locale: str | None = Field(default="ar", min_length=2, max_length=5)
  timezone: str | None = Field(default=None, max_length=64)
  active: bool | None = Field(default=True)


class UserUpdate(BaseModel):
  name: str | None = Field(default=None, min_length=2, max_length=120)
  email: EmailStr | None = None
  password: str | None = Field(default=None, min_length=8)
  role: str | None = Field(default=None, min_length=2, max_length=60)
  locale: str | None = Field(default=None, min_length=2, max_length=5)
  timezone: str | None = Field(default=None, max_length=64)
  active: bool | None = None


class UserOut(BaseModel):
  id: str
  email: EmailStr
  name: str
  role: str | None = None
  locale: str | None = None
  timezone: str | None = None
  active: bool | None = None
  created_at: str | None = None
  updated_at: str | None = None


class PageOut(BaseModel):
  items: list[Any]
  page: int
  size: int
  total: int
