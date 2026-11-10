# IITM Tracker

## Problem statement

IIT Madras BS Data Science students juggle dozens of courses, each with many weeks of recorded lectures, and the prerequisites between them are spread across the program website. There is no single place to see what a course contains, what it depends on, how long it will take, or how far along you are.

## Solution

A full-stack progress tracker. The whole course catalogue is stored with its weeks, lectures and prerequisite links, and each student marks lectures as watched to see their progress per week and per course.

## Tech stack

| Layer | Technologies |
|---|---|
| Backend | Python, FastAPI, SQLAlchemy, Alembic, PostgreSQL, Pydantic |
| Auth | PyJWT, Argon2 password hashing, role-based access |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, React Router, Zustand, Axios |
| Data scripts | BeautifulSoup, Requests, HTTPX, YouTube Data API |

## Features

- **Course catalogue.** 64 courses scraped from the IITM website, with level, credits, hours and website, plus the total length of each course's lecture playlist calculated through the YouTube Data API
- **Weeks and lectures** for every course
- **Prerequisite graph**, with links from a course to each course it depends on
- **Progress tracking** per lecture, per week and per course, with a one-click "complete week"
- **Authentication** with JWT access and refresh tokens
- **Role-based access** for admins and students, enforced in both the API and the frontend routes
- **Admin tools** to create, edit and delete courses, weeks, lectures and prerequisites, and to view or edit any student's progress
- **Clean layered backend**: routers, services and schemas, with database migrations in Alembic

## Future steps

- Analytics dashboard showing progress over time
- Study timer
- Deployment, so other students can use it

## Getting started

```bash
# backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# create .env (see config.py for the variable names)
alembic upgrade head
python -m scripts.get_courses     # optional: scrape the course catalogue
uvicorn main:app --reload

# frontend
cd frontend
npm install
npm run dev
```

Interactive API docs are served at `/docs`. The migration workflow is described in `backend/MIGRATIONS.md`.
