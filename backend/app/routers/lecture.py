from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from collections import defaultdict
from helpers.security import get_password_hash, verify_password
from app import models
from app.database import get_db
from app.schemas import lecture

router = APIRouter(
    prefix="/api/lecture",
    tags=["Lecture"]
)


@router.get("/all/{week_id}", response_model=List[lecture.LectureBase])
async def read_lectures(week_id: UUID, db: Session = Depends(get_db)):
    _week = db.query(models.Week).filter(models.Week.id == week_id).first()
    if _week is None:
        raise HTTPException(status_code=404, detail="Associated week not found")
    lectures = db.query(models.Lecture).filter(models.Lecture.week_id == week_id).all()
    return lectures


@router.get("/one/{lecture_id}", response_model=lecture.LectureBase)
async def read_lecture(lecture_id: UUID, db: Session = Depends(get_db)):
    print(lecture_id)
    _lecture = db.query(models.Lecture).filter(models.Lecture.id == lecture_id).first()
    print(_lecture)
    if _lecture is None:
        raise HTTPException(status_code=404, detail="Lecture not found")
    return _lecture


@router.post("/create", response_model=lecture.LectureBase, status_code=status.HTTP_201_CREATED)
async def create_lecture(lecture: lecture.LectureCreate, db: Session = Depends(get_db)):
    _week = db.query(models.Week).filter(models.Week.id == lecture.week_id).first()
    if _week is None:
        raise HTTPException(status_code=404, detail="Associated week not found")
    
    try:
        new_lecture = models.Lecture(
            name=lecture.name,
            num=lecture.num,
            week_id=lecture.week_id
        )
        db.add(new_lecture)
        db.commit()
        db.refresh(new_lecture)
        return new_lecture
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/update/{lecture_id}", response_model=lecture.LectureBase)
async def update_lecture(lecture_id: UUID, lecture_data: lecture.LectureCreate, db: Session = Depends(get_db)):
    _lecture = db.query(models.Lecture).filter(models.Lecture.id == lecture_id).first()
    if _lecture is None:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    try:
        _lecture.name = lecture_data.name if lecture_data.name is not None else _lecture.name
        _lecture.num = lecture_data.num if lecture_data.num is not None else _lecture.num
        
        db.commit()
        db.refresh(_lecture)
        
        return _lecture
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    

@router.delete("/delete/{lecture_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lecture(lecture_id: UUID, db: Session = Depends(get_db)):
    _lecture = db.query(models.Lecture).filter(models.Lecture.id == lecture_id).first()
    if _lecture is None:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    db.delete(_lecture)
    db.commit()
    return
