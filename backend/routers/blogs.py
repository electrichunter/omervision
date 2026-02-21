import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import get_db
from models import Blog, User
from schemas import BlogCreate, BlogOut
from deps import get_current_user, requires_role, get_cache, set_cache, invalidate_blog_cache, log_audit

router = APIRouter(prefix="/api/blogs", tags=["blogs"])

@router.get("", response_model=List[BlogOut])
async def get_blogs(cursor: int = None, limit: int = 10, include_drafts: bool = False, db: AsyncSession = Depends(get_db)):
    cache_key = f"blogs_c{cursor}_l{limit}_d{include_drafts}"
    cached = await get_cache(cache_key)
    if cached:
        return cached

    query = select(Blog).order_by(Blog.id.asc())
    if not include_drafts:
        query = query.filter(Blog.is_published == True)
        
    if cursor:
        query = query.filter(Blog.id > cursor)
    
    result = await db.execute(query.limit(limit))
    blogs = result.scalars().all()
    
    serialized = [BlogOut.model_validate(b).model_dump() for b in blogs]
    await set_cache(cache_key, serialized)
    
    return blogs

@router.post("", response_model=BlogOut)
async def create_blog(blog: BlogCreate, db: AsyncSession = Depends(get_db), current: User = Depends(requires_role('admin'))):
    new_blog = Blog(**blog.model_dump())
    new_blog.author = current.display_name
    new_blog.date = datetime.datetime.utcnow()
    new_blog.href = f"/blog/{blog.slug}"
    word_count = len(blog.content.split())
    minutes = max(1, round(word_count / 200))
    new_blog.readingTime = minutes
    
    db.add(new_blog)
    try:
        await db.commit()
        await db.refresh(new_blog)
        invalidate_blog_cache()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
        
    return new_blog

@router.get("/id/{blog_id}", response_model=BlogOut)
async def get_blog_by_id(blog_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Blog).filter(Blog.id == blog_id))
    blog = result.scalar_one_or_none()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog

@router.get("/{slug}", response_model=BlogOut)
async def get_blog_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Blog).filter(Blog.slug == slug))
    blog = result.scalar_one_or_none()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog

@router.put("/{blog_id}", response_model=BlogOut)
async def update_blog(blog_id: int, blog: BlogCreate, request: Request, db: AsyncSession = Depends(get_db), current: User = Depends(requires_role('admin'))):
    result = await db.execute(select(Blog).filter(Blog.id == blog_id))
    existing_blog = result.scalar_one_or_none()
    
    if not existing_blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    existing_blog.title = blog.title
    existing_blog.slug = blog.slug
    existing_blog.image = blog.image
    existing_blog.tags = blog.tags
    existing_blog.excerpt = blog.excerpt
    existing_blog.content = blog.content
    existing_blog.featured = blog.featured
    existing_blog.is_published = blog.is_published
    
    word_count = len(blog.content.split())
    minutes = max(1, round(word_count / 200))
    existing_blog.readingTime = minutes
    
    try:
        await db.commit()
        await db.refresh(existing_blog)
        invalidate_blog_cache()
        await log_audit(db, current.id, "UPDATE_BLOG", f"Blog:{blog_id}", request)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
        
    return existing_blog

@router.delete("/{blog_id}")
async def delete_blog(blog_id: int, request: Request, db: AsyncSession = Depends(get_db), current: User = Depends(requires_role('admin'))):
    result = await db.execute(select(Blog).filter(Blog.id == blog_id))
    blog = result.scalar_one_or_none()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    await db.delete(blog)
    await db.commit()
    invalidate_blog_cache()
    await log_audit(db, current.id, "DELETE_BLOG", f"Blog:{blog_id}", request)
    return {"status": "deleted"}

@router.post("/{blog_id}/toggle-publish")
async def toggle_blog_publish(blog_id: int, request: Request, db: AsyncSession = Depends(get_db), current: User = Depends(requires_role('admin'))):
    result = await db.execute(select(Blog).filter(Blog.id == blog_id))
    blog = result.scalar_one_or_none()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    new_status = not blog.is_published
    blog.is_published = new_status
    await db.commit()
    invalidate_blog_cache()
    await log_audit(db, current.id, "TOGGLE_BLOG_PUBLISH", f"Blog:{blog_id}:{new_status}", request)
    return {"status": "success", "is_published": new_status}
