from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class LoginIn(BaseModel):
  email: EmailStr
  password: str = Field(min_length=8)


class UserInfo(BaseModel):
  id: str
  email: str
  name: str
  role: str
  locale: str


class TokenOut(BaseModel):
  access_token: str
  refresh_token: str
  expires_in: int
  user: Optional[UserInfo] = None
