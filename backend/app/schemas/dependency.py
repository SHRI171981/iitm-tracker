from pydantic import BaseModel, ConfigDict, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict
from uuid import UUID
from datetime import datetime


class DependencyBase(BaseModel):
    id: UUID = Field(
        ...,
        description="Unique identifier for the dependency",
    )
    from_course_id: UUID = Field(
        ...,
        description="ID of the course that has the dependency",
    )
    to_course_id: UUID = Field(
        ...,
        description="ID of the course that is depended on",
    )

    model_config = ConfigDict(from_attributes=True)


class DependencyCreate(BaseModel):
    from_course_id: UUID = Field(
        ...,
        description="ID of the course that has the dependency",
    )
    to_course_id: UUID = Field(
        ...,
        description="ID of the course that is depended on",
    )