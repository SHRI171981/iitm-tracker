from pydantic import BaseModel, ConfigDict, Field, EmailStr
from typing import List, Optional, Dict
from uuid import UUID
from datetime import datetime


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


class LoginResponse(BaseModel):
    user_id: UUID = Field(
        ...,
        description="Unique identifier for the authenticated user"
    )
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
