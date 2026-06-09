# app/api/routers/course.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.schemas import course
from helpers.security import require_roles
from app.services import course_service

router = APIRouter(
    prefix="/api/course",
    tags=["Course"]
)


@router.get("/all", response_model=List[course.CourseBase], dependencies=[Depends(require_roles(["admin", "student"]))])
async def get_courses(db: Session = Depends(get_db)):
    """Retrieves all global course records."""
    return course_service.fetch_all_courses(db)


@router.get("/one/{course_id}", response_model=course.CourseBase, dependencies=[Depends(require_roles(["admin", "student"]))])
async def get_course(course_id: UUID, db: Session = Depends(get_db)):
    """Retrieves a specific course record by its unique identifier."""
    return course_service.fetch_course_by_id(course_id, db)


@router.post("/some", response_model=List[course.CourseBase], dependencies=[Depends(require_roles(["admin", "student"]))])
async def get_courses_by_ids(course_ids: List[UUID], db: Session = Depends(get_db)):
    """Retrieves multiple course records based on a provided array of UUIDs."""
    return course_service.fetch_courses_by_ids(course_ids, db)


@router.post("/create", response_model=course.CourseBase, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_roles(["admin"]))])
async def create_course(course_data: course.CourseCreate, db: Session = Depends(get_db)):
    """Creates a new course entity. Restricted to administrators."""
    return await course_service.execute_create_course(course_data, db)


@router.patch("/update/{course_id}", response_model=course.CourseBase, dependencies=[Depends(require_roles(["admin"]))])
async def update_course(course_id: UUID, course_data: course.CourseCreate, db: Session = Depends(get_db)):
    """Updates an existing course entity. Restricted to administrators."""
    return await course_service.execute_update_course(course_id, course_data, db)


@router.delete("/delete/{course_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_roles(["admin"]))])
async def delete_course(course_id: UUID, db: Session = Depends(get_db)):
    """Removes a course entity. Restricted to administrators."""
    return course_service.execute_delete_course(course_id, db)