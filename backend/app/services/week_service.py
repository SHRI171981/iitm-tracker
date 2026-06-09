from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app import models
from app.schemas import week


def fetch_weeks_by_course(course_id: UUID, db: Session):
    """
    Retrieves all structural weeks associated with a specific course identifier.
    """
    return db.query(models.Week).filter(models.Week.course_id == course_id).all()


def fetch_week_by_id(week_id: UUID, db: Session):
    """
    Retrieves a singular week record by its unique identifier.
    """
    _week = db.query(models.Week).filter(models.Week.id == week_id).first()
    if not _week:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Week not found"
        )
    return _week


def execute_create_week(week_data: week.WeekCreate, db: Session):
    """
    Validates the parent course existence, persists a new week entity, 
    and increments the denormalized num_weeks counter on the course.
    """
    _course = db.query(models.Course).filter(models.Course.id == week_data.course_id).first()
    if not _course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Associated course not found"
        )
    
    try:
        new_week = models.Week(
            name=week_data.name, 
            num=week_data.num, 
            course_id=week_data.course_id
        )
        db.add(new_week)
        
        # Maintain denormalized counter on parent entity
        _course.num_weeks = _course.num_weeks + 1 if _course.num_weeks is not None else 1
        
        db.commit()
        db.refresh(new_week)
        return new_week
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to create week: {str(e)}"
        ) from e


def execute_update_week(week_id: UUID, week_data: week.WeekCreate, db: Session):
    """
    Modifies scalar fields of an existing week entity.
    """
    _week = db.query(models.Week).filter(models.Week.id == week_id).first()
    if not _week:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Week not found"
        )
    
    _course = db.query(models.Course).filter(models.Course.id == week_data.course_id).first()
    if not _course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Associated course not found"
        )
    
    try:
        _week.name = week_data.name if week_data.name is not None else _week.name
        _week.num = week_data.num if week_data.num is not None else _week.num

        db.commit()
        db.refresh(_week)
        return _week
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to update week: {str(e)}"
        ) from e


def execute_delete_week(week_id: UUID, db: Session):
    """
    Dissolves an existing week entity and decrements the associated course counter.
    """
    _week = db.query(models.Week).filter(models.Week.id == week_id).first()
    if not _week:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Week not found"
        )
    
    try:
        _course = db.query(models.Course).filter(models.Course.id == _week.course_id).first()
        db.delete(_week)
        
        # Maintain denormalized counter on parent entity
        if _course:
            _course.num_weeks = (_course.num_weeks or 0) - 1
            
        db.commit()
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to delete week: {str(e)}"
        ) from e
