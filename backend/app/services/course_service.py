# app/services/course_service.py

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app import models
from app.schemas import course
from scripts.extract_playlist_duration import calculate_total_hours


def fetch_all_courses(db: Session):
    """
    Retrieves all course records from the database.
    """
    return db.query(models.Course).all()


def fetch_course_by_id(course_id: UUID, db: Session):
    """
    Retrieves a specific course record by UUID.
    """
    _course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not _course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Course not found"
        )
    return _course


def fetch_courses_by_ids(course_ids: List[UUID], db: Session):
    """
    Retrieves multiple course records matching a list of UUIDs.
    """
    return db.query(models.Course).filter(models.Course.id.in_(course_ids)).all()


async def execute_create_course(course_data: course.CourseCreate, db: Session):
    """
    Validates constraints, calculates playlist duration asynchronously, and persists a new course.
    """
    existing_course = db.query(models.Course).filter(
        (models.Course.code == course_data.code) | (models.Course.name == course_data.name)
    ).first()
    
    if existing_course:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Course code or name already exists"
        )
    
    try:
        new_course = models.Course(**course_data.model_dump())
        num_hours = await calculate_total_hours(course_data.playlist) if course_data.playlist else None
        new_course.num_hours = num_hours
        
        db.add(new_course)
        db.commit()
        db.refresh(new_course)
        return new_course
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to create course: {str(e)}"
        ) from e


async def execute_update_course(course_id: UUID, course_data: course.CourseCreate, db: Session):
    """
    Validates update constraints against existing records, recalculates duration, and applies modifications.
    """
    _course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not _course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Course not found"
        )
    
    existing_course = db.query(models.Course).filter(
        (models.Course.code == course_data.code) | (models.Course.name == course_data.name), 
        models.Course.id != course_id
    ).first()
    
    if existing_course:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Course code or name already exists"
        )
    
    try:
        for key, value in course_data.model_dump().items():
            setattr(_course, key, value)
            
        _course.num_hours = await calculate_total_hours(course_data.playlist) if course_data.playlist else None
        
        db.commit()
        db.refresh(_course)
        return _course
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to update course: {str(e)}"
        ) from e


def execute_delete_course(course_id: UUID, db: Session):
    """
    Validates existence and removes a specific course record.
    """
    _course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not _course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Course not found"
        )
    
    try:
        db.delete(_course)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to delete course: {str(e)}"
        ) from e