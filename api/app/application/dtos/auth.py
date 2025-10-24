from pydantic import BaseModel, EmailStr, Field


class LoginIn(BaseModel):
  email: EmailStr
  password: str = Field(min_length=8)


class TokenOut(BaseModel):
  access_token: str
  refresh_token: str
  expires_in: int
