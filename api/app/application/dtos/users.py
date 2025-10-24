from typing import Any

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
  email: EmailStr
  name: str = Field(min_length=2, max_length=120)
  password: str = Field(min_length=8)


class UserOut(BaseModel):
  id: str
  email: EmailStr
  name: str
  locale: str
  tz: str
  active: bool


class PageOut(BaseModel):
  items: list[Any]
  page: int
  size: int
  total: int
