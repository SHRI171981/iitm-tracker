from pydantic import BaseModel, ConfigDict, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict
from uuid import UUID
from datetime import datetime


class ProgressBase(BaseModel):
    id: UUID = Field(
        ...,
        description="Unique identifier for the progress entry"
    )
    student_id: UUID = Field(
        ...,
        description="Identifier for the associated student"
    )
    lecture_id: UUID = Field(
        ...,
        description="Identifier for the associated lecture"
    )
    completed: Optional[bool] = Field(
        False,
        description="Indicates whether the lecture has been completed"
    )
    timestamp: datetime = Field(
        ...,
        description="Timestamp of when the progress was recorded"
    )

    model_config = ConfigDict(from_attributes=True)


class ProgressCreate(BaseModel):
    student_id: UUID = Field(
        ...,
        description="Identifier for the associated student"
    )
    lecture_id: UUID = Field(
        ...,
        description="Identifier for the associated lecture"
    )


class WeekProgress(BaseModel):
    week_id: UUID = Field(
        ...,
        description="Identifier for the week"
    )
    num_lectures: int = Field(
        ...,
        description="Total number of lectures in the week"
    )
    completed_lectures: int = Field(
        ...,
        description="Number of lectures completed by the student in the week"
    )


class CourseProgress(BaseModel):
    course_id: UUID = Field(
        ...,
        description="Identifier for the course"
    )
    num_weeks: int = Field(
        ...,
        description="Total number of weeks in the course"
    )
    completed_weeks: int = Field(
        ...,
        description="Number of weeks completed by the student in the course"
    )