from pydantic import BaseModel, ConfigDict, Field, ConfigDict, field_validator
from typing import Optional
from uuid import UUID
from config import LEVEL_LIST


class CourseBase(BaseModel):
    id: UUID = Field(
        ...,
        description="Unique identifier for the course"
    )
    name: str = Field(
        ...,
        description="Name of the course",
        max_length=255
    )
    code: str = Field(
        ...,
        description="Unique code for the course",
        max_length=255
    )
    credits: Optional[int] = Field(
        None,
        description="Number of credits for the course",
        ge=0
    )
    num_weeks: int = Field(
        ...,
        description="Number of weeks in the course",
        ge=0
    )
    num_hours: Optional[int] = Field(
        None,
        description="Total number of hours for the course",
        ge=0
    )
    level: Optional[str] = Field(
        None,
        description=f"Difficulty level of the course. Must be one of: {{LEVEL_LIST}}",
        max_length=255,
    )
    website: Optional[str] = Field(
        None,
        description="Official website for the course",
        max_length=255
    )
    playlist: Optional[str] = Field(
        None,
        description="URL to the course playlist",
        max_length=255
    )

    @field_validator('level')
    def validate_level(cls, value):
        if value is not None and value not in LEVEL_LIST:
            raise ValueError(f"Level must be one of {LEVEL_LIST}")
        return value

    model_config = ConfigDict(from_attributes=True)


class CourseCreate(BaseModel):
    name: Optional[str] = Field(
        None,
        description="Name of the course",
        max_length=255
    )
    code: Optional[str] = Field(
        None,
        description="Unique code for the course",
        max_length=255
    )
    credits: Optional[int] = Field(
        None,
        description="Number of credits for the course",
        ge=0
    )
    level: Optional[str] = Field(
        None,
        description=f"Difficulty level of the course. Must be one of: {{LEVEL_LIST}}",
        max_length=255
    )
    website: Optional[str] = Field(
        None,
        description="Official website for the course",
        max_length=255
    )
    playlist: Optional[str] = Field(
        None,
        description="URL to the course playlist",
        max_length=255
    )

    @field_validator('level')
    def validate_level(cls, value):
        if value is not None and value not in LEVEL_LIST:
            raise ValueError(f"Level must be one of {LEVEL_LIST}")
        return value
