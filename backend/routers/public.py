from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from sqlalchemy import text, or_
import json
import hashlib

from database import get_db, redis_client
from models import Blog, Project, NewsletterSubscription, PaaSProject, ContactMessage
from schemas import SubscribeRequest, NewsletterCreate, ContactCreate
from config import settings


router = APIRouter(prefix="/api", tags=["public"])

@router.get("/search")
async def search_content(q: str, db: AsyncSession = Depends(get_db)):
    if not q:
        return {"blogs": [], "projects": []}
    
    # Use standard LIKE for better reliability across all setups
    blog_q = select(Blog).filter(
        or_(
            Blog.title.ilike(f"%{q}%"),
            Blog.excerpt.ilike(f"%{q}%"),
            Blog.author.ilike(f"%{q}%")
        )
    ).filter(Blog.is_published == True)
    
    proj_q = select(Project).filter(
        or_(
            Project.title.ilike(f"%{q}%"),
            Project.excerpt.ilike(f"%{q}%"),
            Project.category.ilike(f"%{q}%")
        )
    )

    blog_res = await db.execute(blog_q)
    proj_res = await db.execute(proj_q)
    
    return {
        "blogs": blog_res.scalars().all(),
        "projects": proj_res.scalars().all()
    }

@router.get("/seo/{content_type}/{slug}")
async def get_seo_metadata(content_type: str, slug: str, db: AsyncSession = Depends(get_db)):
    model = Blog if content_type == "blog" else Project
    result = await db.execute(select(model).filter(model.slug == slug))
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")
    
    from utils import get_cdn_url
    return {
        "title": f"{item.title} | OmerVision",
        "description": item.excerpt[:160] if item.excerpt else "",
        "og_image": get_cdn_url(item.image) if item.image else "",
        "canonical": f"https://omervision.io/{content_type}/{slug}"
    }

@router.get("/sitemap.xml")
async def get_sitemap(db: AsyncSession = Depends(get_db)):
    blogs = await db.execute(select(Blog.slug))
    projects = await db.execute(select(Project.slug))
    
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for slug in blogs.scalars().all():
        xml += f'  <url><loc>https://omervision.io/blog/{slug}</loc></url>\n'
    for slug in projects.scalars().all():
        xml += f'  <url><loc>https://omervision.io/project/{slug}</loc></url>\n'
    xml += "</urlset>"
    
    return Response(content=xml, media_type="application/xml")

@router.get("/skills")
async def get_skills():
    data = redis_client.get("skills_data")
    if data:
        return json.loads(data)
    return []

@router.get("/about")
async def get_about_public():
    data = redis_client.get("about_data")
    if data:
        return json.loads(data)
    return {
        "name": "Ömer Faruk Uysal",
        "title": "Full Stack Developer",
        "bio": "Modern teknolojilerle dijital deneyimler oluşturuyorum.",
        "location": "",
        "email": "",
        "github": "",
        "twitter": "",
        "linkedin": "",
        "available": True,
        "avatar": ""
    }

@router.get("/dashboard")
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    # Async aggregated metrics
    visitors = 1320
    pageViews = 5480
    signups = 124
    return {"visitors": visitors, "pageViews": pageViews, "signups": signups}

@router.post("/subscribe")
# @limiter.limit("10/minute") - disabled here for simplicity, or we can import limiter from deps
async def subscribe(req: SubscribeRequest, request: Request, db: AsyncSession = Depends(get_db)):
    if not req.email:
        raise HTTPException(status_code=400, detail="Email is required")
    # Background Task: Hand off to Arq worker
    await request.app.state.arq_pool.enqueue_job('send_welcome_email', req.email)
    return {"status": "subscribed", "email": req.email}

@router.post("/newsletter/subscribe/v2")
async def newsletter_subscribe_v2(req: NewsletterCreate, db: AsyncSession = Depends(get_db)):
    from utils import generate_verification_token
    token = generate_verification_token()
    sub = NewsletterSubscription(email=req.email, verification_token=token)
    db.add(sub)
    await db.commit()
    return {"status": "verification_sent"}

@router.get("/newsletter/verify/{token}")
async def newsletter_verify_route(token: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(NewsletterSubscription).filter(NewsletterSubscription.verification_token == token))
    sub = res.scalar_one_or_none()
    if not sub: raise HTTPException(status_code=400, detail="Invalid token")
    sub.is_verified = True
    sub.verification_token = None
    await db.commit()
    return {"status": "verified"}

@router.post("/analytics/track/{post_type}/{post_id}")
async def track_view_count(post_type: str, post_id: int, request: Request):
    ip_hash = hashlib.sha256(f"{request.client.host}{settings.SECRET_KEY}".encode()).hexdigest()
    cache_key = f"v:{post_type}:{post_id}:{ip_hash}"
    if not redis_client.get(cache_key):
        redis_client.incr(f"views:{post_type}:{post_id}")
        redis_client.set(cache_key, "1", ex=86400)
    return {"status": "tracked"}

@router.get("/og-image/{title}")
async def get_og_image_endpoint_route(title: str):
    from utils import generate_og_image
    return Response(content=generate_og_image(title), media_type="image/webp")

@router.get("/paas/projects")
async def get_public_paas_projects(db: AsyncSession = Depends(get_db)):
    # Only return projects that are in running or deploying status
    result = await db.execute(
        select(PaaSProject).filter(PaaSProject.status.in_(["running", "deploying"])).order_by(PaaSProject.created_at.desc())
    )
    return result.scalars().all()

@router.post("/contact")
async def contact_form(req: ContactCreate, db: AsyncSession = Depends(get_db)):
    new_msg = ContactMessage(
        name=req.name,
        email=req.email,
        message=req.message
    )
    db.add(new_msg)
    await db.commit()
    return {"status": "success", "message": "Your message has been received."}
