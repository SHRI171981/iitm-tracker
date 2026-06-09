# app/services/auth_service.py
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from helpers.security import get_password_hash, verify_password, generate_auth_tokens
from app import models
from app.schemas import auth


def fetch_all_users(db: Session):
    users = db.query(models.User).all()
    return [
        auth.RegisterResponse(
            id=user.id, 
            username=user.username, 
            student_id=user.student.id, 
            name=user.student.name, 
            email=user.student.email, 
            is_admin=user.is_admin
        ) for user in users
    ]


def fetch_user_by_id(user_id: UUID, db: Session):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found"
        )
    
    return auth.RegisterResponse(
        id=user.id, 
        username=user.username, 
        student_id=user.student.id, 
        name=user.student.name, 
        email=user.student.email, 
        is_admin=user.is_admin
    )


def execute_register_user(user_data: auth.UserEntry, db: Session):
    existing_user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Username already exists"
        )
    
    try:
        new_user = models.User(
            username=user_data.username, 
            password_hash=get_password_hash(user_data.password)
        )
        db.add(new_user)
        db.flush()
        
        new_student = models.Student(
            name=user_data.name, 
            email=user_data.email, 
            user_id=new_user.id
        )
        db.add(new_student)
        
        response_data = auth.RegisterResponse(
            id=new_user.id, 
            username=new_user.username, 
            student_id=new_student.id,
            name=new_student.name, 
            email=new_student.email, 
            is_admin=new_user.is_admin
        )
        
        db.commit()
        return response_data
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Registration failed due to an internal error."
        ) from e


def execute_login_user(user_data: auth.UserEntry, db: Session):
    db_user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if not db_user or not verify_password(user_data.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid username or password"
        )
    
    user_role = "admin" if db_user.is_admin else "student"
    return generate_auth_tokens(db_user.id, user_role)