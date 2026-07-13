from typing import Optional

from pydantic import BaseModel, EmailStr, validator

from .models import UserRead


class SignUpRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "Member"

    @validator("password")
    def strong_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str]
    email: Optional[EmailStr]
    role: Optional[str]
    password: Optional[str]


class AuthResponse(BaseModel):
    message: str
    user: Optional[UserRead]


class DeleteResponse(BaseModel):
    message: str
