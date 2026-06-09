# app/api/routers/auth.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from helpers.security import require_roles, get_current_user
from app.database import get_db
from app.schemas import auth
from app.schemas.auth import UserResponse
from app.services import auth_service

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.get("/users", response_model=List[auth.RegisterResponse], status_code=status.HTTP_200_OK, dependencies=[Depends(require_roles(["admin"]))])
async def list_users(db: Session = Depends(get_db)):
    """Retrieves a list of all registered users. Restricted to administrators."""
    return auth_service.fetch_all_users(db)


@router.get("/users/me", response_model=auth.RegisterResponse, status_code=status.HTTP_200_OK)
async def get_my_user(
    current_user: UserResponse = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Retrieves the profile of the currently authenticated user via JWT identity."""
    return auth_service.fetch_user_by_id(current_user.user_id, db)


@router.get("/users/{user_id}", response_model=auth.RegisterResponse, status_code=status.HTTP_200_OK, dependencies=[Depends(require_roles(["admin"]))])
async def get_user(
    user_id: UUID, 
    db: Session = Depends(get_db)
):
    """Retrieves details of a specific user by their unique identifier. Restricted to administrators."""
    return auth_service.fetch_user_by_id(user_id, db)


@router.post("/register", response_model=auth.RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: auth.UserEntry, db: Session = Depends(get_db)):
    """Registers a new user with the provided username and password."""
    return auth_service.execute_register_user(user, db)


@router.post("/login", response_model=auth.LoginResponse, status_code=status.HTTP_200_OK)
async def login_user(user: auth.UserEntry, db: Session = Depends(get_db)):
    """Authenticates a user and returns JWT tokens upon successful login."""
    login_payload = auth_service.execute_login_user(user, db)
    return auth.LoginResponse.model_validate(login_payload)