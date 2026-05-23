from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from collections import defaultdict
from helpers.security import get_password_hash, verify_password
from app import models
from app.database import get_db


def week_completion(student_id, week, db):
    lectures = db.query(models.Lecture).filter(models.Lecture.week_id == week.id).all()
    lecture_ids = [lecture.id for lecture in lectures]

    progress_entries = db.query(models.StudentLecture).filter(
        models.StudentLecture.lecture_id.in_(lecture_ids), 
        models.StudentLecture.student_id == student_id
    ).all()

    return {
        "num_lectures": len(lecture_ids),
        "completed_lectures": len(progress_entries)
    }


def course_completion(student_id, course, db):
    weeks = db.query(models.Week).filter(models.Week.course_id == course.id).all()
    week_ids = [week.id for week in weeks]
    
    completed_weeks = 0
    for week in weeks:
        week_progress = week_completion(student_id, week, db)
        if week_progress["num_lectures"] > 0 and week_progress["completed_lectures"] == week_progress["num_lectures"]:
            completed_weeks += 1
    
    return {
        "num_weeks": len(week_ids),
        "completed_weeks": completed_weeks
    }
