import os
import asyncio
import logging
from typing import Generator

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

logger = logging.getLogger("api")

# If DATABASE_URL is not provided, fall back to a local SQLite for development.
DATABASE_URL = os.getenv("DATABASE_URL", None)

if DATABASE_URL:
    # Use async driver for MySQL
    ASYNC_DATABASE_URL = DATABASE_URL.replace("mysql+pymysql://", "mysql+aiomysql://")
    engine = create_async_engine(
        ASYNC_DATABASE_URL, 
        pool_recycle=3600,
        pool_size=10,
        max_overflow=20
    )
else:
    # SQLite async support
    engine = create_async_engine("sqlite+aiosqlite:///./devportfolio.db", connect_args={"check_same_thread": False})

AsyncSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession, expire_on_commit=False)
SessionLocal = AsyncSessionLocal
Base = declarative_base()

import redis
from config import settings

# Redis Client for Blacklist and Lockout (Keep direct for sync checks if needed, but usually async is better)
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

async def get_db() -> Generator:
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    """Initialize database with retries to handle startup delay."""
    retries = 10
    retry_interval = 3
    
    while retries > 0:
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Database initialized successfully.")
            return
        except Exception as e:
            retries -= 1
            if retries == 0:
                logger.error(f"Failed to initialize database after multiple retries: {e}")
                raise e
            logger.warning(f"Database connection failed, retrying in {retry_interval}s... ({retries} retries left): {e}")
            await asyncio.sleep(retry_interval)
