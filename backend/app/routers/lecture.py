from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.schemas import lecture
from helpers.security import require_roles
from app.services import lecture_service

router = APIRouter(
    prefix="/api/lecture",
    tags=["Lecture"]
)


@router.get("/all/{week_id}", response_model=List[lecture.LectureBase], dependencies=[Depends(require_roles(["admin", "student"]))])
async def read_lectures(week_id: UUID, db: Session = Depends(get_db)):
    """
    Retrieves all lecture entities associated with a specific structural week.
    """
    return lecture_service.fetch_lectures_by_week(week_id, db)


@router.get("/one/{lecture_id}", response_model=lecture.LectureBase, dependencies=[Depends(require_roles(["admin", "student"]))])
async def read_lecture(lecture_id: UUID, db: Session = Depends(get_db)):
    """
    Retrieves the details of a singular lecture entity via its UUID.
    """
    return lecture_service.fetch_lecture_by_id(lecture_id, db)


@router.post("/create", response_model=lecture.LectureBase, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_roles(["admin"]))])
async def create_lecture(lecture_data: lecture.LectureCreate, db: Session = Depends(get_db)):
    """
    Instantiates a new lecture entity. Strictly restricted to administrative execution.
    """
    return lecture_service.execute_create_lecture(lecture_data, db)


@router.patch("/update/{lecture_id}", response_model=lecture.LectureBase, dependencies=[Depends(require_roles(["admin"]))])
async def update_lecture(lecture_id: UUID, lecture_data: lecture.LectureCreate, db: Session = Depends(get_db)):
    """
    Modifies an existing lecture entity. Strictly restricted to administrative execution.
    """
    return lecture_service.execute_update_lecture(lecture_id, lecture_data, db)


@router.delete("/delete/{lecture_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_roles(["admin"]))])
async def delete_lecture(lecture_id: UUID, db: Session = Depends(get_db)):
    """
    Dissolves an existing lecture entity. Strictly restricted to administrative execution.
    """
    return lecture_service.execute_delete_lecture(lecture_id, db)