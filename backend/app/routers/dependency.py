from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.schemas import dependency
from helpers.security import require_roles
from app.services import dependency_service

router = APIRouter(
    prefix="/api/dependency",
    tags=["Dependency"]
)


@router.get("/from/{course_id}", response_model=List[dependency.DependencyBase], dependencies=[Depends(require_roles(["admin", "student"]))])
async def read_from_dependencies(course_id: UUID, db: Session = Depends(get_db)):
    """
    Retrieves records where the specified course acts as the prerequisite.
    """
    return dependency_service.fetch_from_dependencies(course_id, db)


@router.get("/to/{course_id}", response_model=List[dependency.DependencyBase], dependencies=[Depends(require_roles(["admin", "student"]))])
async def read_to_dependencies(course_id: UUID, db: Session = Depends(get_db)):
    """
    Retrieves prerequisite records necessary to unlock the specified course.
    """
    return dependency_service.fetch_to_dependencies(course_id, db)


@router.get("/one/{dependency_id}", response_model=dependency.DependencyBase, dependencies=[Depends(require_roles(["admin", "student"]))])
async def read_dependency(dependency_id: UUID, db: Session = Depends(get_db)):
    """
    Retrieves the details of a singular dependency binding via its UUID.
    """
    return dependency_service.fetch_dependency_by_id(dependency_id, db)


@router.get("/all", response_model=List[dependency.DependencyBase], dependencies=[Depends(require_roles(["admin", "student"]))])
async def read_all_dependencies(db: Session = Depends(get_db)):
    """
    Retrieves the global map of all defined course dependencies.
    """
    return dependency_service.fetch_all_dependencies(db)


@router.post("/create", response_model=dependency.DependencyBase, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_roles(["admin"]))])
async def create_dependency(dependency_data: dependency.DependencyCreate, db: Session = Depends(get_db)):
    """
    Binds a new prerequisite relationship between two courses.
    Strictly restricted to administrative execution.
    """
    return dependency_service.execute_create_dependency(dependency_data, db)


@router.delete("/delete/{dependency_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_roles(["admin"]))])
async def delete_dependency(dependency_id: UUID, db: Session = Depends(get_db)):
    """
    Dissolves an existing prerequisite relationship via its UUID.
    Strictly restricted to administrative execution.
    """
    return dependency_service.execute_delete_dependency(dependency_id, db)