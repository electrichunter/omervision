from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import get_db
from models import Project, User
from schemas import ProjectOut
from deps import get_current_user, requires_role, get_cache, set_cache, log_audit, check_ip_whitelist

router = APIRouter(prefix="/api/projects", tags=["projects"])

@router.get("", response_model=List[ProjectOut])
async def get_projects(cursor: int = None, limit: int = 10, db: AsyncSession = Depends(get_db)):
    cache_key = f"projects_c{cursor}_l{limit}"
    cached = await get_cache(cache_key)
    if cached:
        return cached

    query = select(Project).order_by(Project.id.asc())
    if cursor:
        query = query.filter(Project.id > cursor)
    
    result = await db.execute(query.limit(limit))
    projects = result.scalars().all()
    
    serialized = [ProjectOut.model_validate(p).model_dump() for p in projects]
    await set_cache(cache_key, serialized)
    return serialized

@router.get("/{slug}", response_model=ProjectOut)
async def get_project_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).filter(Project.slug == slug))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.delete("/{project_id}")
async def delete_project(project_id: int, request: Request, db: AsyncSession = Depends(get_db), current: User = Depends(requires_role('admin'))):
    # Depending if we want IP whitelist or not
    # check_ip_whitelist(request) 
    result = await db.execute(select(Project).filter(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(project)
    await db.commit()
    await log_audit(db, current.id, "DELETE_PROJECT", f"Project:{project_id}", request)
    return {"status": "deleted"}
