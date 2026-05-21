from pydantic import BaseModel, ConfigDict, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict
from uuid import UUID
from datetime import datetime


class LectureBase(BaseModel):
    id: UUID = Field(
        ...,
        description="Unique identifier for the lecture"
    )
    name: str = Field(
        ...,    
        description="Name of the lecture",
        max_length=100
    )
    num: int = Field(
        ...,
        description="Lecture number in the week",
        ge=1
    )
    week_id: UUID = Field(
        ...,
        description="Identifier for the associated week"
    )

    model_config = ConfigDict(from_attributes=True)


class LectureCreate(BaseModel):
    name: Optional[str] = Field(
        None,
        description="Name of the lecture",
        max_length=100
    )
    num: Optional[int] = Field(
        None,
        description="Lecture number in the week",
        ge=1
    )
    week_id: UUID = Field(
        ...,
        description="Identifier for the associated week"
    )