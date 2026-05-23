from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from helpers.security import get_password_hash, verify_password
from helpers.progress import week_completion, course_completion
from app import models
from app.database import get_db
from app.schemas import progress

router = APIRouter(
    prefix="/api/progress",
    tags=["Progress"]
)


@router.get("/student/all/{student_id}", response_model=List[progress.ProgressBase])
async def get_progress_by_student(student_id: UUID, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    
    progress_entries = db.query(models.StudentLecture).filter(models.StudentLecture.student_id == student_id).all()
    return progress_entries


@router.get("/week/{student_id}/{week_id}", response_model=progress.WeekProgress)
async def get_progress_by_week(week_id: UUID, student_id: UUID, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    week = db.query(models.Week).filter(models.Week.id == week_id).first()
    if not week:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Week not found")
    
    week_progress = week_completion(student_id, week, db)

    return progress.WeekProgress(
        week_id=week_id,
        num_lectures=week_progress["num_lectures"],
        completed_lectures=week_progress["completed_lectures"]
    )


@router.get("/course/{student_id}/{course_id}", response_model=progress.CourseProgress)
async def get_progress_by_course(course_id: UUID, student_id: UUID, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    course_progress = course_completion(student_id, course, db)

    return progress.CourseProgress(
        course_id=course_id,
        num_weeks=course_progress["num_weeks"],
        completed_weeks=course_progress["completed_weeks"]
    )
                                 

@router.post("/record", response_model=progress.ProgressBase)
async def record_progress(progress_data: progress.ProgressCreate, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == progress_data.student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    lecture = db.query(models.Lecture).filter(models.Lecture.id == progress_data.lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lecture not found")
    
    existing_progress = db.query(models.StudentLecture).filter(
        models.StudentLecture.student_id == progress_data.student_id,
        models.StudentLecture.lecture_id == progress_data.lecture_id
    ).first()
    if existing_progress:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Progress entry already exists")
    
    try: 
        db_progress = models.StudentLecture(
            student_id=progress_data.student_id,
            lecture_id=progress_data.lecture_id,
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
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to record progress: {str(e)}") from e


@router.delete("/delete", status_code=status.HTTP_204_NO_CONTENT)
async def delete_progress(progress_data: progress.ProgressCreate, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == progress_data.student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    lecture = db.query(models.Lecture).filter(models.Lecture.id == progress_data.lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lecture not found")
    
    progress_entry = db.query(models.StudentLecture).filter(
        models.StudentLecture.student_id == progress_data.student_id,
        models.StudentLecture.lecture_id == progress_data.lecture_id
    ).first()
    
    if not progress_entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Progress entry not found")
    
    try:
        db.delete(progress_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to delete progress: {str(e)}") from e
