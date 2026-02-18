import os
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# If DATABASE_URL is not provided, fall back to a local SQLite for development.
DATABASE_URL = os.getenv("DATABASE_URL", None)

if DATABASE_URL:
    # Expecting a URL like: mysql+pymysql://user:password@host:3306/dbname
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
else:
    # Lightweight fallback for local development without DB setup
    engine = create_engine("sqlite:///./devportfolio.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
