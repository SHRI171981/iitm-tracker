import uuid
import enum
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = 'user'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    username = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    is_admin = Column(Boolean, default=False)
    student = relationship("Student", back_populates="user", uselist=False)

class Student(Base):
    __tablename__ = 'student'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('user.id'), nullable=False)
    user = relationship("User", back_populates="student")
    student_lectures = relationship("StudentLecture", back_populates="student")

class Course(Base):
    __tablename__ = 'course'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False)  
    code = Column(String(255), unique=True, nullable=False)
    level = Column(String(255), nullable=True)
    credits = Column(Integer, nullable=True)
    num_hours = Column(Integer, nullable=True)
    website = Column(String(255), nullable=True)
    playlist = Column(String(255), nullable=True)
    
    weeks = relationship("Week", back_populates="course")
    dependencies_from = relationship("Dependency", foreign_keys="[Dependency.from_course_id]", back_populates="from_course")
    dependencies_to = relationship("Dependency", foreign_keys="[Dependency.to_course_id]", back_populates="to_course")


class Week(Base):
    __tablename__ = 'week'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False)
    num = Column(Integer, nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey('course.id'), nullable=False)
    course = relationship("Course", back_populates="weeks")
    lectures = relationship("Lecture", back_populates="week")

class Lecture(Base):
    __tablename__ = 'lecture'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False)
    num = Column(Integer, nullable=False)
    week_id = Column(UUID(as_uuid=True), ForeignKey('week.id'), nullable=False)
    week = relationship("Week", back_populates="lectures")
    student_lectures = relationship("StudentLecture", back_populates="lecture")
    
class StudentLecture(Base):
    __tablename__ = 'student_lecture'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey('student.id'), nullable=False)
    lecture_id = Column(UUID(as_uuid=True), ForeignKey('lecture.id'), nullable=False)
    student = relationship("Student", back_populates="student_lectures")
    lecture = relationship("Lecture", back_populates="student_lectures")
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Dependency(Base):
    __tablename__ = 'dependency'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    from_course_id = Column(UUID(as_uuid=True), ForeignKey('course.id'), nullable=False)
    to_course_id = Column(UUID(as_uuid=True), ForeignKey('course.id'), nullable=False)

    from_course = relationship("Course", foreign_keys=[from_course_id], back_populates="dependencies_from")
    to_course = relationship("Course", foreign_keys=[to_course_id], back_populates="dependencies_to")