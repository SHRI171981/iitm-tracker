from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from collections import defaultdict
from helpers.security import get_password_hash, verify_password
from app import models
from app.database import get_db
from app.schemas import week

router = APIRouter(
    prefix="/api/week",
    tags=["Week"]
)


@router.get("/", response_model=List[week.WeekBase])
def get_weeks(db: Session = Depends(get_db)):
    weeks = db.query(models.Week).all()
    return weeks


@router.get("/{week_id}", response_model=week.WeekBase)
def get_week(week_id: UUID, db: Session = Depends(get_db)):
    _week = db.query(models.Week).filter(models.Week.id == week_id).first()
    if not _week:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Week not found")
    return _week


@router.post("/", response_model=week.WeekBase, status_code=status.HTTP_201_CREATED)
def create_week(week_data: week.WeekCreate, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == week_data.course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated course not found")
    
    try:
        new_week = models.Week(name=week_data.name, num=week_data.num, course_id=week_data.course_id)
        db.add(new_week)
        db.commit()
        db.refresh(new_week)
        
        return new_week
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create week: {str(e)}") from e
    

@router.patch("/{week_id}", response_model=week.WeekBase)
def update_week(week_id: UUID, week_data: week.WeekCreate, db: Session = Depends(get_db)):
    _week = db.query(models.Week).filter(models.Week.id == week_id).first()
    if not _week:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Week not found")
    
    _course = db.query(models.Course).filter(models.Course.id == week_data.course_id).first()
    if not _course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated course not found")
    
    try:
        _week.name = week_data.name if week_data.name is not None else _week.name
        _week.num = week_data.num if week_data.num is not None else _week.num

        db.commit()
        db.refresh(_week)
        
        return _week
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to update week: {str(e)}") from e
    

@router.delete("/{week_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_week(week_id: UUID, db: Session = Depends(get_db)):
    _week = db.query(models.Week).filter(models.Week.id == week_id).first()
    if not _week:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Week not found")
    
    try:
        db.delete(_week)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to delete week: {str(e)}") from e