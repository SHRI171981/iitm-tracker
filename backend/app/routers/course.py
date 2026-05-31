from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from uuid import UUID
from collections import defaultdict
from helpers.security import get_password_hash, verify_password
from app import models
from app.database import get_db
from app.schemas import course
from scripts.extract_playlist_duration import calculate_total_hours

router = APIRouter(
    prefix="/api/course",
    tags=["Course"]
)


@router.get("/all", response_model=List[course.CourseBase])
async def get_courses(db: Session = Depends(get_db)):
    courses = db.query(models.Course).all()
    for course in courses:
        course.num_weeks = len(course.weeks)
    return courses


@router.get("/one/{course_id}", response_model=course.CourseBase)
async def get_course(course_id: UUID, db: Session = Depends(get_db)):
    _course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not _course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    _course.num_weeks = len(_course.weeks)
    return _course


@router.get("/some", response_model=List[course.CourseBase])
async def get_courses_by_ids(course_ids: List[UUID], db: Session = Depends(get_db)):
    courses = db.query(models.Course).filter(models.Course.id.in_(course_ids)).all()
    for course in courses:
        course.num_weeks = len(course.weeks)
    return courses


@router.post("/create", response_model=course.CourseBase, status_code=status.HTTP_201_CREATED)
async def create_course(course_data: course.CourseCreate, db: Session = Depends(get_db)):
    existing_course = db.query(models.Course).filter((models.Course.code == course_data.code) | (models.Course.name == course_data.name)).first()
    if existing_course:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Course code or name already exists")
    
    try:
        new_course = models.Course(**course_data.model_dump())
        num_hours = await calculate_total_hours(course_data.playlist) if course_data.playlist else None
        new_course.num_hours = num_hours
        db.add(new_course)
        db.commit()
        db.refresh(new_course)
        new_course.num_weeks = len(new_course.weeks)
        return new_course
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create course: {str(e)}") from e


@router.patch("/update/{course_id}", response_model=course.CourseBase)
async def update_course(course_id: UUID, course_data: course.CourseCreate, db: Session = Depends(get_db)):
    _course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not _course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    existing_course = db.query(models.Course).filter((models.Course.code == course_data.code) | (models.Course.name == course_data.name), models.Course.id != course_id).first()
    if existing_course:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Course code or name already exists")
    
    try:
        for key, value in course_data.model_dump().items():
            setattr(_course, key, value)
        _course.num_hours = await calculate_total_hours(course_data.playlist) if course_data.playlist else None
        db.commit()
        db.refresh(_course)
        _course.num_weeks = len(_course.weeks)
        return _course
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to update course: {str(e)}") from e
    

@router.delete("/delete/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(course_id: UUID, db: Session = Depends(get_db)):
    _course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not _course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    try:
        db.delete(_course)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to delete course: {str(e)}") from e