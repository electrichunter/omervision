from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload, joinedload
import datetime
import logging

from database import get_db, redis_client
from models import User, Role, UserRole
from schemas import UserCreate, UserOut, LoginRequest
from auth import create_access_token, create_refresh_token, decode_token, verify_totp
from security import get_password_hash, verify_password
from deps import get_current_user, log_audit
from config import settings

logger = logging.getLogger("api")
router = APIRouter(prefix="/api/auth", tags=["auth"])

from security import get_password_hash, verify_password, validate_password

@router.post("/register", response_model=UserOut)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    try:
        hashed_pw = get_password_hash(user.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    result = await db.execute(select(User).filter((User.username == user.username) | (User.email == user.email)))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    new_user = User(
        username=user.username,
        email=user.email,
        password_hash=hashed_pw,
        display_name=user.display_name,
        is_active=True
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    res = await db.execute(select(Role).filter(Role.slug == 'viewer'))
    role = res.scalar_one_or_none()
    if role:
        db.add(UserRole(user_id=new_user.id, role_id=role.id))
        await db.commit()

    result = await db.execute(
        select(User)
        .options(joinedload(User.roles).joinedload(UserRole.role))
        .filter(User.id == new_user.id)
    )
    user_with_roles = result.unique().scalar_one()

    return UserOut(
        id=user_with_roles.id,
        username=user_with_roles.username,
        email=user_with_roles.email,
        display_name=user_with_roles.display_name,
        is_active=user_with_roles.is_active,
        roles=[ur.role.slug for ur in user_with_roles.roles]
    )

@router.post("/login")
async def login(req: LoginRequest, request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User)
        .options(selectinload(User.roles).selectinload(UserRole.role))
        .filter(User.username == req.username)
    )
    user = result.scalar_one_or_none()
    
    if user and user.locked_until and user.locked_until > datetime.datetime.utcnow():
        logger.warning(f"Login attempt on locked account: {req.username}")
        raise HTTPException(status_code=403, detail="Account locked. Try again later.")

    authenticated_user = None
    if user and verify_password(req.password, user.password_hash):
        authenticated_user = user
    
    if not authenticated_user:
        if user:
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                user.locked_until = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
                logger.error(f"Account locked due to too many fails: {req.username}")
            await db.commit()
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    authenticated_user.failed_login_attempts = 0
    authenticated_user.locked_until = None
    
    user_id = authenticated_user.id
    mfa_enabled = authenticated_user.mfa_enabled
    totp_secret = authenticated_user.totp_secret
    user_roles = [ur.role.slug for ur in authenticated_user.roles]
    
    await db.commit()

    if mfa_enabled:
        if not req.totp_code:
            return {"status": "mfa_required"}
        if not verify_totp(totp_secret, req.totp_code):
            raise HTTPException(status_code=401, detail="Invalid TOTP code")

    token_payload = {"sub": str(user_id), "roles": user_roles, "type": "access"}
    access_token = create_access_token(data=token_payload)
    refresh_token = create_refresh_token(data=token_payload)
    
    redis_client.set(f"refresh:{user_id}", refresh_token, ex=datetime.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))

    response.set_cookie(key="access_token", value=access_token, httponly=True, max_age=15 * 60, samesite="lax", secure=False)
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600, samesite="lax", secure=False)
    
    await log_audit(db, user_id, "LOGIN", "auth", request)
    return {"status": "success", "roles": user_roles}

@router.post("/refresh")
async def refresh_token_route(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user_id = payload.get("sub")
    stored_token = redis_client.get(f"refresh:{user_id}")
    if stored_token != refresh_token:
        redis_client.delete(f"refresh:{user_id}")
        from auth import revoke_token
        revoke_token(refresh_token, 7 * 24 * 3600)  # blacklist leaked refresh token
        raise HTTPException(status_code=401, detail="Session expired due to security violation")

    result = await db.execute(select(User).options(selectinload(User.roles).selectinload(UserRole.role)).filter(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User inactive")

    user_roles = [ur.role.slug for ur in user.roles]
    new_payload = {"sub": str(user.id), "roles": user_roles}
    new_access = create_access_token(data=new_payload)
    new_refresh = create_refresh_token(data=new_payload)
    
    redis_client.set(f"refresh:{user.id}", new_refresh, ex=datetime.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))

    response.set_cookie(key="access_token", value=new_access, httponly=True, max_age=15 * 60, samesite="lax", secure=False)
    response.set_cookie(key="refresh_token", value=new_refresh, httponly=True, max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600, samesite="lax", secure=False)
    
    return {"status": "refreshed"}

@router.get("/me", response_model=UserOut)
async def read_current_user(current: User = Depends(get_current_user)):
    return UserOut(
        id=current.id,
        username=current.username,
        email=current.email,
        display_name=current.display_name,
        is_active=current.is_active,
        roles=[ur.role.slug for ur in current.roles]
    )

@router.post("/logout")
def logout(request: Request, response: Response, user: User = Depends(get_current_user)):
    authorization = request.headers.get("Authorization")
    if authorization and authorization.startswith("Bearer "):
        access_token = authorization.split(" ")[1]
    else:
        access_token = request.cookies.get("access_token")
        
    if access_token:
        from auth import revoke_token
        revoke_token(access_token)
    
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"status": "logged_out"}

# MFA & Security
from schemas import MFASetupResponse, PasswordChangeRequest
from auth import generate_totp_secret, get_totp_uri

@router.post("/mfa/setup", response_model=MFASetupResponse)
async def setup_mfa(current: User = Depends(get_current_user)):
    secret = generate_totp_secret()
    uri = get_totp_uri(secret, current.username)
    return MFASetupResponse(secret=secret, qr_code_uri=uri)

@router.post("/mfa/enable")
async def enable_mfa(req: dict, request: Request, db: AsyncSession = Depends(get_db), current: User = Depends(get_current_user)):
    secret = req.get("secret")
    code = req.get("code")
    if not secret or not code:
         raise HTTPException(status_code=400, detail="Secret and code required")
    
    if verify_totp(secret, code):
        current.totp_secret = secret
        current.mfa_enabled = True
        await db.commit()
        await log_audit(db, current.id, "MFA_ENABLED", "auth", request)
        return {"status": "success"}
    else:
        raise HTTPException(status_code=400, detail="Invalid verification code")

@router.post("/mfa/disable")
async def disable_mfa(req: dict, request: Request, db: AsyncSession = Depends(get_db), current: User = Depends(get_current_user)):
    code = req.get("code")
    if not code:
         raise HTTPException(status_code=400, detail="MFA code required to disable")
    
    if verify_totp(current.totp_secret, code):
        current.mfa_enabled = False
        current.totp_secret = None
        await db.commit()
        await log_audit(db, current.id, "MFA_DISABLED", "auth", request)
        return {"status": "success"}
    else:
        raise HTTPException(status_code=400, detail="Invalid verification code")

@router.post("/password/change")
async def change_password(req: PasswordChangeRequest, request: Request, db: AsyncSession = Depends(get_db), current: User = Depends(get_current_user)):
    if not verify_password(req.old_password, current.password_hash):
        raise HTTPException(status_code=400, detail="Old password incorrect")
    
    try:
        current.password_hash = get_password_hash(req.new_password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    await db.commit()
    await log_audit(db, current.id, "PASSWORD_CHANGED", "auth", request)
    return {"status": "success"}
