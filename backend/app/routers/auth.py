from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from collections import defaultdict
from helpers.security import get_password_hash, verify_password
from app import models
from app.database import get_db
from app.schemas import auth

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.get("/users", response_model=List[auth.RegisterResponse], status_code=status.HTTP_200_OK)
async def list_users(db: Session = Depends(get_db)):
    """Retrieves a list of all registered users."""
    users = db.query(models.User).all()
    return [auth.RegisterResponse(id=user.id, username=user.username, student_id=user.student.id, name=user.student.name, email=user.student.email, is_admin=user.is_admin) for user in users]


@router.get("/users/{user_id}", response_model=auth.RegisterResponse, status_code=status.HTTP_200_OK)
async def get_user(user_id: UUID, db: Session = Depends(get_db)):
    """Retrieves details of a specific user by their unique identifier."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    return auth.RegisterResponse(id=user.id, username=user.username, student_id=user.student.id, name=user.student.name, email=user.student.email, is_admin=user.is_admin)


@router.post("/register", response_model=auth.RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: auth.UserEntry, db: Session = Depends(get_db)):
    """Registers a new user with the provided username and password."""
    existing_user = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
    
    password_hash = get_password_hash(user.password)
    email = user.email
    name = user.name
    
    try:
        new_user = models.User(username=user.username, password_hash=password_hash)
        db.add(new_user)
        
        # Transmit INSERT to database to generate new_user.id without finalizing the transaction.
        db.flush()
        
        new_student = models.Student(name=name, email=email, user_id=new_user.id)
        db.add(new_student)
        
        # Instantiate the response model prior to commit to catch Pydantic validation errors.
        response_data = auth.RegisterResponse(
            id=new_user.id, 
            username=new_user.username, 
            student_id=new_student.id,
            name=new_student.name, 
            email=new_student.email, 
            is_admin=new_user.is_admin
        )
        
        # Finalize all database operations atomically.
        db.commit()
        
        return response_data
        
    except Exception as e:
        # Revert all pending state changes if any operation or validation fails.
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Registration failed due to an internal error."
        )
        

@router.post("/login", response_model=auth.LoginResponse, status_code=status.HTTP_200_OK)
async def login_user(user: auth.UserEntry, db: Session = Depends(get_db)):
    """Authenticates a user and returns JWT tokens upon successful login."""
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    
    # Token generation logic (not shown here)
    access_token = "generated_access_token"  # Placeholder
    refresh_token = "generated_refresh_token"  # Placeholder
    
    return auth.LoginResponse(
        user_id=db_user.id,
        refresh_token=refresh_token,
        access_token=access_token,
        token_type="bearer"
    )
