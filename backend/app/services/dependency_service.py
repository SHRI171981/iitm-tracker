from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app import models
from app.schemas import dependency

def fetch_from_dependencies(course_id: UUID, db: Session):
    """
    Retrieves all courses that require the specified course as a prerequisite.
    Validates the existence of the source course prior to querying dependencies.
    """
    _course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not _course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Associated course not found"
        )
    return db.query(models.Dependency).filter(models.Dependency.from_course_id == course_id).all()

def fetch_to_dependencies(course_id: UUID, db: Session):
    """
    Retrieves all prerequisite courses required by the specified course.
    Validates the existence of the target course prior to querying dependencies.
    """
    _course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not _course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Associated course not found"
        )
    return db.query(models.Dependency).filter(models.Dependency.to_course_id == course_id).all()

def fetch_dependency_by_id(dependency_id: UUID, db: Session):
    """
    Retrieves a single dependency record by its unique identifier.
    """
    _dependency = db.query(models.Dependency).filter(models.Dependency.id == dependency_id).first()
    if not _dependency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Dependency not found"
        )
    return _dependency

def fetch_all_dependencies(db: Session):
    """
    Retrieves all dependency records across the global curriculum.
    """
    return db.query(models.Dependency).all()

def execute_create_dependency(dependency_data: dependency.DependencyCreate, db: Session):
    """
    Validates the existence of both structural course endpoints and persists a new dependency relationship.
    Implements transaction rollback to prevent orphaned relationships or partial state commits.
    """
    _from_course = db.query(models.Course).filter(models.Course.id == dependency_data.from_course_id).first()
    if not _from_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="From course not found"
        )
    
    _to_course = db.query(models.Course).filter(models.Course.id == dependency_data.to_course_id).first()
    if not _to_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="To course not found"
        )
    
    try:
        new_dependency = models.Dependency(
            from_course_id=dependency_data.from_course_id,
            to_course_id=dependency_data.to_course_id
        )
        db.add(new_dependency)
        db.commit()
        db.refresh(new_dependency)
        return new_dependency
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=str(e)
        ) from e

def execute_delete_dependency(dependency_id: UUID, db: Session):
    """
    Validates the existence of a dependency record and executes a strict database deletion.
    """
    _dependency = db.query(models.Dependency).filter(models.Dependency.id == dependency_id).first()
    if not _dependency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Dependency not found"
        )
    
    try:
        db.delete(_dependency)
        db.commit()
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=str(e)
        ) from e