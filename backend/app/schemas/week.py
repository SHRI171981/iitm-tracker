from pydantic import BaseModel, ConfigDict, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict
from uuid import UUID
from datetime import datetime


class WeekBase(BaseModel):
    id: UUID = Field(
        ...,
        description="Unique identifier for the week"
    )
    name: str = Field(
        ...,
        description="Name of the week",
        max_length=100
    )
    num: int = Field(
        ...,
        description="Week number in the course",
        ge=1
    )
    course_id: UUID = Field(
        ...,
        description="Identifier for the associated course"
    )

    model_config = ConfigDict(from_attributes=True)


class WeekCreate(BaseModel):
    name: Optional[str] = Field(
        None,
        description="Name of the week",
        max_length=100
    )
    num: Optional[int] = Field(
        None,
        description="Week number in the course",
        ge=1
    )
    course_id: UUID = Field(
        ...,
        description="Identifier for the associated course"
    )
