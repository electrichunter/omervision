import os
import pyotp
from datetime import datetime, timedelta
from typing import Optional

from jose import jwt, JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from config import settings
from security import get_password_hash, verify_password
from models import User
from sqlalchemy.orm import Session


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15)) # Short-lived: 15 mins
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_totp(secret: str, code: str) -> bool:
    totp = pyotp.TOTP(secret)
    return totp.verify(code)


async def authenticate_user(db: AsyncSession, username: str, password: str):
    result = await db.execute(select(User).filter(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user


def get_user_roles(user: User):
    roles = [ur.role.slug for ur in user.roles] if user and user.roles else []
    return roles


import logging
logger = logging.getLogger("api")

def decode_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        return None
    except JWTError as e:
        logger.error(f"JWT Decode Error: {e}")
        return None
