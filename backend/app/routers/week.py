from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.schemas import week
from helpers.security import require_roles
from app.services import week_service

router = APIRouter(
    prefix="/api/week",
    tags=["Week"]
)


@router.get("/all/{course_id}", response_model=List[week.WeekBase], dependencies=[Depends(require_roles(["admin", "student"]))])
async def get_weeks(course_id: UUID, db: Session = Depends(get_db)):
    """
    Retrieves all structural weeks associated with a specific course.
    """
    return week_service.fetch_weeks_by_course(course_id, db)


@router.get("/one/{week_id}", response_model=week.WeekBase, dependencies=[Depends(require_roles(["admin", "student"]))])
async def get_week(week_id: UUID, db: Session = Depends(get_db)):
    """
    Retrieves the details of a singular week entity via its UUID.
    """
    return week_service.fetch_week_by_id(week_id, db)


@router.post("/create", response_model=week.WeekBase, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_roles(["admin"]))])
async def create_week(week_data: week.WeekCreate, db: Session = Depends(get_db)):
    """
    Instantiates a new week entity and updates parent course metrics. 
    Strictly restricted to administrative execution.
    """
    return week_service.execute_create_week(week_data, db)


@router.patch("/update/{week_id}", response_model=week.WeekBase, dependencies=[Depends(require_roles(["admin"]))])
async def update_week(week_id: UUID, week_data: week.WeekCreate, db: Session = Depends(get_db)):
    """
    Modifies an existing week entity. Strictly restricted to administrative execution.
    """
    return week_service.execute_update_week(week_id, week_data, db)


@router.delete("/delete/{week_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_roles(["admin"]))])
async def delete_week(week_id: UUID, db: Session = Depends(get_db)):
    """
    Dissolves an existing week entity and updates parent course metrics. 
    Strictly restricted to administrative execution.
    """
    return week_service.execute_delete_week(week_id, db)