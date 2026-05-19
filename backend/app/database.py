import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import DATABASE_URL
# Environment variable extraction for PostgreSQL connection string.
# Defaults to a local configuration suitable for the MVP testing phase.
SQLALCHEMY_DATABASE_URL = DATABASE_URL

# Engine instantiation with connection pooling settings.
# pool_pre_ping ensures the connection is valid before executing queries.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True
)

# Factory for creating new SQLAlchemy Session objects.
# autocommit=False and autoflush=False ensure explicit transaction management.
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Declarative base class from which all ORM models will inherit.
Base = declarative_base()

def get_db():
    """
    Generator function managing the database session lifecycle.
    Yields a session for request use and ensures closure upon completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()