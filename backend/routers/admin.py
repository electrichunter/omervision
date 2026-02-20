import time
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
import psutil

from database import get_db, redis_client
from models import User, Role, UserRole, Permission, RolePermission, Comment, AuditLog
from schemas import UserCreate, UserOut, RoleCreate, AuditLogOut, CommentOut
from security import get_password_hash
from deps import get_current_user, requires_role, log_audit, check_ip_whitelist

router = APIRouter(prefix="/api/admin", tags=["admin"])



@router.post("/users", response_model=UserOut)
async def create_user(user: UserCreate, request: Request, db: AsyncSession = Depends(get_db), current: User = Depends(requires_role('admin'))):
    # check_ip_whitelist(request)
    hashed = get_password_hash(user.password)
    new_user = User(username=user.username, email=user.email, password_hash=hashed, display_name=user.display_name, is_active=True)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    await log_audit(db, current.id, "CREATE_USER", f"User:{new_user.username}", request)
    
    if user.roles:
        for rname in user.roles:
            role_res = await db.execute(select(Role).filter(Role.name == rname))
            role = role_res.scalar_one_or_none()
            if role:
                db.add(UserRole(user_id=new_user.id, role_id=role.id))
        await db.commit()
    
    return UserOut.model_validate(new_user)

@router.post("/roles")
async def create_role(role: RoleCreate, request: Request, db: AsyncSession = Depends(get_db), current: User = Depends(requires_role('admin'))):
    # check_ip_whitelist(request)
    result = await db.execute(select(Role).filter(Role.name == role.name))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Role already exists")
    new_role = Role(name=role.name, description=role.description)
    db.add(new_role)
    await db.commit()
    await log_audit(db, current.id, "CREATE_ROLE", f"Role:{role.name}", request)
    return {"id": new_role.id, "name": new_role.name, "description": new_role.description}

@router.post("/roles/{role_id}/permissions")
async def assign_permission_to_role(role_id: int, permission_name: str, request: Request, db: AsyncSession = Depends(get_db), current: User = Depends(requires_role('admin'))):
    # check_ip_whitelist(request)
    result = await db.execute(select(Role).filter(Role.id == role_id))
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    p_result = await db.execute(select(Permission).filter(Permission.name == permission_name))
    perm = p_result.scalar_one_or_none()
    if not perm:
        perm = Permission(name=permission_name, description=f"Permission: {permission_name}")
        db.add(perm)
        await db.commit()
        await db.refresh(perm)

    link_result = await db.execute(select(RolePermission).filter(RolePermission.role_id == role_id, RolePermission.permission_id == perm.id))
    if not link_result.scalar_one_or_none():
        db.add(RolePermission(role_id=role_id, permission_id=perm.id))
        await db.commit()
    
    await log_audit(db, current.id, "ASSIGN_PERM", f"Role:{role_id}/Perm:{permission_name}", request)
    return {"role_id": role_id, "permission": permission_name}

@router.get("/comments", response_model=List[CommentOut])
async def get_all_comments(status: Optional[str] = None, db: AsyncSession = Depends(get_db), current: User = Depends(requires_role('admin'))):
    query = select(Comment).options(joinedload(Comment.user)).order_by(Comment.created_at.desc())
    if status == 'pending':
        query = query.filter(Comment.is_approved == False)
    elif status == 'approved':
        query = query.filter(Comment.is_approved == True)
        
    result = await db.execute(query)
    return result.unique().scalars().all()

@router.get("/audit-logs", response_model=List[AuditLogOut])
async def get_audit_logs(request: Request, db: AsyncSession = Depends(get_db), current: User = Depends(requires_role('admin'))):
    # check_ip_whitelist(request)
    result = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()))
    return result.scalars().all()

@router.get("/system-status")
async def get_system_status(current: User = Depends(requires_role('admin'))):
    return {
        "cpu": psutil.cpu_percent(),
        "memory": psutil.virtual_memory().percent,
        "disk": psutil.disk_usage('/').percent,
        "uptime": time.time() - psutil.boot_time(),
        "maintenance_mode": redis_client.get("maintenance_mode") == "true"
    }

@router.post("/maintenance")
async def toggle_maintenance(enable: bool, current: User = Depends(requires_role('admin'))):
    redis_client.set("maintenance_mode", "true" if enable else "false")
    return {"status": "success", "maintenance": enable}

# ─── Skills Management ───────────────────────────────────────────────────────

@router.get("/skills")
async def get_skills_admin(current: User = Depends(requires_role('admin'))):
    data = redis_client.get("skills_data")
    return json.loads(data) if data else []

@router.put("/skills")
async def update_skills(request: Request, current: User = Depends(requires_role('admin'))):
    body = await request.json()
    redis_client.set("skills_data", json.dumps(body))
    return {"status": "ok"}

# ─── About / Profile Management ──────────────────────────────────────────────

@router.get("/about")
async def get_about(current: User = Depends(requires_role('admin'))):
    data = redis_client.get("about_data")
    if data:
        return json.loads(data)
    return {
        "name": "Ömer Faruk Uysal",
        "title": "Full Stack Developer",
        "bio": "",
        "location": "",
        "email": "",
        "github": "",
        "twitter": "",
        "linkedin": "",
        "available": True,
        "avatar": ""
    }

@router.put("/about")
async def update_about(request: Request, current: User = Depends(requires_role('admin'))):
    body = await request.json()
    redis_client.set("about_data", json.dumps(body))
    return {"status": "ok"}
