from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app import models
from app.schemas import lecture


def fetch_lectures_by_week(week_id: UUID, db: Session):
    """
    Validates the existence of the parent week and retrieves all associated lecture records.
    """
    _week = db.query(models.Week).filter(models.Week.id == week_id).first()
    if not _week:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Associated week not found"
        )
    return db.query(models.Lecture).filter(models.Lecture.week_id == week_id).all()


def fetch_lecture_by_id(lecture_id: UUID, db: Session):
    """
    Retrieves a singular lecture record by its unique identifier.
    """
    _lecture = db.query(models.Lecture).filter(models.Lecture.id == lecture_id).first()
    if not _lecture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Lecture not found"
        )
    return _lecture


def execute_create_lecture(lecture_data: lecture.LectureCreate, db: Session):
    """
    Validates the parent week constraint and persists a new lecture entity.
    """
    _week = db.query(models.Week).filter(models.Week.id == lecture_data.week_id).first()
    if not _week:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Associated week not found"
        )
    
    try:
        new_lecture = models.Lecture(
            name=lecture_data.name,
            num=lecture_data.num,
            week_id=lecture_data.week_id
        )
        db.add(new_lecture)
        db.commit()
        db.refresh(new_lecture)
        return new_lecture
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=str(e)
        ) from e


def execute_update_lecture(lecture_id: UUID, lecture_data: lecture.LectureCreate, db: Session):
    """
    Retrieves an existing lecture, applies scalar updates, and commits the transaction.
    """
    _lecture = db.query(models.Lecture).filter(models.Lecture.id == lecture_id).first()
    if not _lecture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Lecture not found"
        )
    
    try:
        _lecture.name = lecture_data.name if lecture_data.name is not None else _lecture.name
        _lecture.num = lecture_data.num if lecture_data.num is not None else _lecture.num
        
        db.commit()
        db.refresh(_lecture)
        return _lecture
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=str(e)
        ) from e


def execute_delete_lecture(lecture_id: UUID, db: Session):
    """
    Validates the existence of a lecture record and executes a database deletion.
    """
    _lecture = db.query(models.Lecture).filter(models.Lecture.id == lecture_id).first()
    if not _lecture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Lecture not found"
        )
    
    try:
        db.delete(_lecture)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=str(e)
        ) from e