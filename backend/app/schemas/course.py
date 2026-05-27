from pydantic import BaseModel, ConfigDict, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict
from uuid import UUID
from datetime import datetime


class CourseBase(BaseModel):
    id: UUID = Field(
        ...,
        description="Unique identifier for the course"
    )
    name: str = Field(
        ...,
        description="Name of the course",
        max_length=100
    )
    code: str = Field(
        ...,
        description="Unique code for the course",
        max_length=20
    )
    num_weeks: int = Field(
        ...,
        description="Number of weeks in the course",
        ge=0
    )

    model_config = ConfigDict(from_attributes=True)


class CourseCreate(BaseModel):
    name: Optional[str] = Field(
        None,
        description="Name of the course",
        max_length=100
    )
    code: Optional[str] = Field(
        None,
        description="Unique code for the course",
        max_length=20
    )
