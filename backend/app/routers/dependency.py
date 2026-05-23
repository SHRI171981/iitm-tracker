from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from collections import defaultdict
from helpers.security import get_password_hash, verify_password
from app import models
from app.database import get_db
from app.schemas import dependency


router = APIRouter(
    prefix="/api/dependency",
    tags=["Dependency"]
)


@router.get("/from/{course_id}", response_model=List[dependency.DependencyBase])
async def read_from_dependencies(course_id: UUID, db: Session = Depends(get_db)):
    _course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if _course is None:
        raise HTTPException(status_code=404, detail="Associated course not found")
    dependencies = db.query(models.Dependency).filter(models.Dependency.from_course_id == course_id).all()
    return dependencies


@router.get("/to/{course_id}", response_model=List[dependency.DependencyBase])
async def read_to_dependencies(course_id: UUID, db: Session = Depends(get_db)):
    _course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if _course is None:
        raise HTTPException(status_code=404, detail="Associated course not found")
    dependencies = db.query(models.Dependency).filter(models.Dependency.to_course_id == course_id).all()
    return dependencies


@router.get("/one/{dependency_id}", response_model=dependency.DependencyBase)
async def read_dependency(dependency_id: UUID, db: Session = Depends(get_db)):
    _dependency = db.query(models.Dependency).filter(models.Dependency.id == dependency_id).first()
    if _dependency is None:
        raise HTTPException(status_code=404, detail="Dependency not found")
    return _dependency


@router.get("/all", response_model=List[dependency.DependencyBase])
async def read_all_dependencies(db: Session = Depends(get_db)):
    dependencies = db.query(models.Dependency).all()
    return dependencies


@router.post("/create", response_model=dependency.DependencyBase, status_code=status.HTTP_201_CREATED)
async def create_dependency(dependency: dependency.DependencyCreate, db: Session = Depends(get_db)):
    _from_course = db.query(models.Course).filter(models.Course.id == dependency.from_course_id).first()
    if _from_course is None:
        raise HTTPException(status_code=404, detail="From course not found")
    
    _to_course = db.query(models.Course).filter(models.Course.id == dependency.to_course_id).first()
    if _to_course is None:
        raise HTTPException(status_code=404, detail="To course not found")
    
    try:
        new_dependency = models.Dependency(
            from_course_id=dependency.from_course_id,
            to_course_id=dependency.to_course_id
        )
        db.add(new_dependency)
        db.commit()
        db.refresh(new_dependency)
        return new_dependency
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/delete/{dependency_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dependency(dependency_id: UUID, db: Session = Depends(get_db)):
    _dependency = db.query(models.Dependency).filter(models.Dependency.id == dependency_id).first()
    if _dependency is None:
        raise HTTPException(status_code=404, detail="Dependency not found")
    
    try:
        db.delete(_dependency)
        db.commit()
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    
