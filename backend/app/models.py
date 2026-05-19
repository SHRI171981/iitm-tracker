import uuid
import enum
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

# Absolute import from the root module enforcing namespace clarity
from app.database import Base


class User(Base):
    __tablename__ = 'user'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    username = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)


class Student(Base):
    __tablename__ = 'student'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('user.id'), nullable=False)

    user = relationship("User", back_populates="student")


class Course(Base):
    __tablename__ = 'course'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(100), nullable=False)  
    code = Column(String(20), unique=True, nullable=False)


class Week(Base):
    __tablename__ = 'week'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(100), nullable=False)
    num = Column(Integer, nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey('course.id'), nullable=False)

    course = relationship("Course", back_populates="weeks")


class Lecture(Base):
    __tablename__ = 'lecture'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(100), nullable=False)
    num = Column(Integer, nullable=False)
    week_id = Column(UUID(as_uuid=True), ForeignKey('week.id'), nullable=False)

    week = relationship("Week", back_populates="lectures")
    
    
class StudentLecture(Base):
    __tablename__ = 'student_lecture'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey('student.id'), nullable=False)
    lecture_id = Column(UUID(as_uuid=True), ForeignKey('lecture.id'), nullable=False)

    student = relationship("Student", back_populates="student_lectures")
    lecture = relationship("Lecture", back_populates="student_lectures")
