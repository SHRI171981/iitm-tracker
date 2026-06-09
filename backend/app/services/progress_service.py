# app/services/progress_service.py

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app import models
from app.schemas import progress
from helpers.progress import week_completion, course_completion


def resolve_student(user_id: UUID, db: Session) -> models.Student:
    """
    Resolves the internal student profile using the authenticated user_id.
    """
    student = db.query(models.Student).filter(models.Student.user_id == user_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Student profile not found"
        )
    return student


def fetch_student_progress(student_id: UUID, db: Session):
    """
    Retrieves all lecture progress records for a specific student.
    """
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Student not found"
        )
    return db.query(models.StudentLecture).filter(models.StudentLecture.student_id == student_id).all()


def fetch_week_progress(student_id: UUID, week_id: UUID, db: Session):
    """
    Calculates and returns the completion metrics for a specific week.
    """
    week = db.query(models.Week).filter(models.Week.id == week_id).first()
    if not week:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Week not found"
        )
    
    week_progress = week_completion(student_id, week, db)
    return progress.WeekProgress(
        week_id=week_id,
        num_lectures=week_progress["num_lectures"],
        completed_lectures=week_progress["completed_lectures"]
    )


def fetch_course_progress(student_id: UUID, course_id: UUID, db: Session):
    """
    Calculates and returns the aggregate completion metrics for an entire course.
    """
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Course not found"
        )
    
    course_progress = course_completion(student_id, course, db)
    return progress.CourseProgress(
        course_id=course_id,
        num_weeks=course_progress["num_weeks"],
        completed_weeks=course_progress["completed_weeks"]
    )


def execute_record_progress(student_id: UUID, lecture_id: UUID, db: Session):
    """
    Validates and persists a new progress entry for a student and lecture.
    """
    lecture = db.query(models.Lecture).filter(models.Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Lecture not found"
        )
    
    existing_progress = db.query(models.StudentLecture).filter(
        models.StudentLecture.student_id == student_id,
        models.StudentLecture.lecture_id == lecture_id
    ).first()
    
    if existing_progress:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Progress entry already exists"
        )
    
    try: 
        db_progress = models.StudentLecture(
            student_id=student_id,
            lecture_id=lecture_id,
        )
        db.add(db_progress)
        db.commit()
        db.refresh(db_progress)

        return progress.ProgressBase(
            id=db_progress.id,
            student_id=db_progress.student_id,
            lecture_id=db_progress.lecture_id, 
            completed=True,
            timestamp=db_progress.timestamp
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to record progress: {str(e)}"
        ) from e


def execute_delete_progress(student_id: UUID, lecture_id: UUID, db: Session):
    """
    Validates and removes an existing progress entry for a student and lecture.
    """
    progress_entry = db.query(models.StudentLecture).filter(
        models.StudentLecture.student_id == student_id,
        models.StudentLecture.lecture_id == lecture_id
    ).first()
    
    if not progress_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Progress entry not found"
        )
    
    try:
        db.delete(progress_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to delete progress: {str(e)}"
        ) from e