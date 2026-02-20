import json
import logging
from typing import List
from fastapi import Request, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from database import get_db, redis_client
from models import User, UserRole, AuditLog
from auth import decode_token
from config import settings

logger = logging.getLogger("api")

# Redis Cache Help
async def get_cache(key: str):
    data = redis_client.get(f"cache:{key}")
    return json.loads(data) if data else None

async def set_cache(key: str, data: any, expire: int = 300):
    redis_client.set(f"cache:{key}", json.dumps(data), ex=expire)

def invalidate_blog_cache():
    try:
        keys = redis_client.keys("cache:blogs_*")
        if keys:
            redis_client.delete(*keys)
    except Exception as e:
        logger.error(f"Failed to invalidate blog cache: {e}")

# Audit Log Helper
async def log_audit(db: AsyncSession, user_id: int, action: str, target: str, request: Request):
    ip = request.client.host
    log_entry = AuditLog(user_id=user_id, action=action, target=target, ip_address=ip)
    db.add(log_entry)
    await db.commit()

# IP Whitelisting Middleware logic
def check_ip_whitelist(request: Request):
    client_ip = request.client.host
    if client_ip not in settings.ALLOWED_ADMIN_IPS:
        logger.warning(f"Unauthorized IP access attempt: {client_ip}")
        raise HTTPException(status_code=403, detail="Access denied from this IP")

async def get_current_user(request: Request, authorization: str = Header(None), db: AsyncSession = Depends(get_db)):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    else:
        token = request.cookies.get("access_token")

    if not token:
        logger.warning("get_current_user: No token found in headers or cookies")
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Zombie Token Check (Blacklist)
    try:
        is_blacklisted = redis_client.get(f"blacklist:{token}")
        if is_blacklisted:
            logger.warning(f"get_current_user: Token blacklisted: {token[:10]}...")
            raise HTTPException(status_code=401, detail="Token revoked (logged out)")
    except Exception as e:
        logger.error(f"Redis error in get_current_user: {e}", exc_info=True)

    logger.info(f"Decoding token: {token[:10]}...{token[-10:] if len(token)>20 else ''} Length: {len(token)}")
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        logger.warning(f"get_current_user: Invalid or expired token. Payload: {payload}")
        raise HTTPException(status_code=401, detail="Invalid or expired access token")
    
    user_id = payload.get("sub")
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
         logger.error(f"get_current_user: Invalid user_id in token: {user_id}")
         raise HTTPException(status_code=401, detail="Invalid token data")

    # Async query pattern
    result = await db.execute(
        select(User).options(selectinload(User.roles).selectinload(UserRole.role)).filter(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        logger.warning(f"get_current_user: User not found for id {user_id}")
        raise HTTPException(status_code=401, detail="User not found")
        
    if not user.is_active:
        logger.warning(f"get_current_user: User inactive {user.username}")
        raise HTTPException(status_code=401, detail="User inactive")
        
    return user

# RBAC Dependent Logic
def requires_role(required_role: str):
    async def role_checker(user: User = Depends(get_current_user)):
        try:
            roles = [ur.role.slug for ur in user.roles] if user.roles else []
        except Exception as e:
            logger.error(f"requires_role: Error extracting roles: {e}")
            roles = []
        logger.info(f"requires_role: user={user.username}, roles={roles}, required={required_role}")
        if required_role not in roles:
            raise HTTPException(status_code=403, detail=f"Insufficient permissions. You have: {roles}, need: {required_role}")
        return user
    return role_checker
