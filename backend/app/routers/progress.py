# app/api/routers/progress.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.schemas import progress
from app.schemas.auth import UserResponse
from helpers.security import require_roles, get_current_user
from app.services import progress_service 

router = APIRouter(
    prefix="/api/progress",
    tags=["Progress"]
)

# --- General Progress Endpoints ---

@router.get("/student/me", response_model=List[progress.ProgressBase])
async def get_my_progress(
    current_user: UserResponse = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """
    Retrieves progress records for the authenticated student via JWT identity.
    """
    student = progress_service.resolve_student(current_user.user_id, db)
    return progress_service.fetch_student_progress(student.id, db)


@router.get("/student/{student_id}", response_model=List[progress.ProgressBase], dependencies=[Depends(require_roles(["admin"]))])
async def get_progress_by_student_id(
    student_id: UUID, 
    db: Session = Depends(get_db)
):
    """
    Retrieves progress records for a target student. Restricted to administrators.
    """
    return progress_service.fetch_student_progress(student_id, db)


# --- Week Progress Endpoints ---
@router.get("/week/me/{week_id}", response_model=progress.WeekProgress)
async def get_my_week_progress(
    week_id: UUID, 
    current_user: UserResponse = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """
    Retrieves weekly completion metrics for the authenticated student.
    """
    student = progress_service.resolve_student(current_user.user_id, db)
    return progress_service.fetch_week_progress(student.id, week_id, db)


@router.get("/week/{student_id}/{week_id}", response_model=progress.WeekProgress, dependencies=[Depends(require_roles(["admin"]))])
async def get_student_week_progress(
    week_id: UUID, 
    student_id: UUID, 
    db: Session = Depends(get_db)
):
    """
    Retrieves weekly completion metrics for a target student. Restricted to administrators.
    """
    return progress_service.fetch_week_progress(student_id, week_id, db)


# --- Course Progress Endpoints ---
@router.get("/course/me/{course_id}", response_model=progress.CourseProgress)
async def get_my_course_progress(
    course_id: UUID, 
    current_user: UserResponse = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """
    Retrieves course-level completion metrics for the authenticated student.
    """
    student = progress_service.resolve_student(current_user.user_id, db)
    return progress_service.fetch_course_progress(student.id, course_id, db)


@router.get("/course/{student_id}/{course_id}", response_model=progress.CourseProgress, dependencies=[Depends(require_roles(["admin"]))])
async def get_student_course_progress(
    course_id: UUID, 
    student_id: UUID, 
    db: Session = Depends(get_db)
):
    """
    Retrieves course-level completion metrics for a target student. Restricted to administrators.
    """
    return progress_service.fetch_course_progress(student_id, course_id, db)


# --- Record Progress Endpoints ---
@router.post("/record/me", response_model=progress.ProgressBase)
async def record_my_progress(
    progress_data: progress.ProgressCreate, 
    current_user: UserResponse = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """
    Persists a new progress record for the authenticated student.
    Overrides any externally provided student_id in the payload payload.
    """
    student = progress_service.resolve_student(current_user.user_id, db)
    return progress_service.execute_record_progress(student.id, progress_data.lecture_id, db)


@router.post("/record/{student_id}", response_model=progress.ProgressBase, dependencies=[Depends(require_roles(["admin"]))])
async def record_student_progress(
    student_id: UUID,
    progress_data: progress.ProgressCreate, 
    db: Session = Depends(get_db)
):
    """
    Persists a new progress record for a target student. Restricted to administrators.
    """
    return progress_service.execute_record_progress(student_id, progress_data.lecture_id, db)


# --- Delete Progress Endpoints ---
@router.delete("/delete/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_progress(
    progress_data: progress.ProgressCreate, 
    current_user: UserResponse = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """
    Removes a progress record for the authenticated student.
    """
    student = progress_service.resolve_student(current_user.user_id, db)
    return progress_service.execute_delete_progress(student.id, progress_data.lecture_id, db)


@router.delete("/delete/{student_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_roles(["admin"]))])
async def delete_student_progress(
    student_id: UUID,
    progress_data: progress.ProgressCreate, 
    db: Session = Depends(get_db)
):
    """
    Removes a progress record for a target student. Restricted to administrators.
    """
    return progress_service.execute_delete_progress(student_id, progress_data.lecture_id, db)