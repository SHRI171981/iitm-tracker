from pydantic import BaseModel, ConfigDict, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Literal
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
    level: Optional[Literal["Foundation", "Diploma in Data Science", "Diploma in Programming", "BSc Degree", "BS Degree", "PG Diploma", "M Tech"]] = Field(
        None,
        description="Difficulty level of the course",
        max_length=20,
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
    credits: Optional[int] = Field(
        None,
        description="Number of credits for the course",
        ge=0
    )
    level: Optional[Literal["Foundation", "Diploma in Data Science", "Diploma in Programming", "BSc Degree", "BS Degree", "PG Diploma", "M Tech"]] = Field(
        None,
        description="Difficulty level of the course",
        max_length=20
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
