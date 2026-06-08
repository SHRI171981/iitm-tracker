from pydantic import BaseModel, ConfigDict, Field, EmailStr
from typing import List, Optional, Dict
from uuid import UUID
from datetime import datetime
from config import ACCESS_TOKEN_EXPIRE_MINUTES

class UserEntry(BaseModel):
    username: str = Field(
        ..., 
        description="Unique username for the user",
        max_length=255
    )
    password: str = Field(
        ...,
        description="Password for the user account",
        min_length=8,
        max_length=128
    )
    name: Optional[str] = Field(
        None,
        description="Full name of the user",
        max_length=255
    )
    email: Optional[EmailStr] = Field(
        None,
        description="Email address of the user",
        max_length=255
    )


class RegisterResponse(BaseModel):
    id: UUID = Field(
        ...,
        description="Unique identifier for the user"
    )
    username: str = Field(
        ...,
        description="Username of the registered user",
        max_length=255
    )
    student_id: UUID = Field(
        ...,
        description="Unique identifier for the associated student profile"
    )
    name: str = Field(
        ...,
        description="Full name of the registered user",
        max_length=255
    )
    email: EmailStr = Field(
        ...,
        description="Email address of the registered user",
        max_length=255
    )
    is_admin: Optional[bool] = Field(   
        False,
        description="Indicates if the user has administrative privileges"
    )


class UserResponse(BaseModel):
    user_id: UUID = Field(
        ...,
        description="Unique identifier for the user"
    )
    role: str = Field(
        ...,
        description="Role of the user (e.g., 'admin', 'student')"
    )

class LoginResponse(BaseModel):
    refresh_token: str = Field(
        ...,
        description="JWT refresh token for obtaining new access tokens"
    )
    access_token: str = Field(
        ...,
        description="JWT access token for authenticated requests"
    )
    token_type: str = Field(
        "bearer",
        description="Type of the token, typically 'bearer'"
    )
    expires_in: int = Field(
        ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        description="Expiration time of the access token in seconds"
    )
    user: UserResponse = Field(
        ...,
        description="Information about the authenticated user"
    )
