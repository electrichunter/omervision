import logging
import json
import time
from fastapi import FastAPI, HTTPException, Depends, Header, Request, Response, UploadFile, File
from fastapi.responses import JSONResponse, Response as FastAPIResponse
import psutil
import hashlib
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload, joinedload
from brotli_asgi import BrotliMiddleware
from typing import List, Optional
import os
import datetime
from arq import create_pool
from arq.connections import RedisSettings
from worker import send_welcome_email

from config import settings
from database import init_db, get_db, redis_client, SessionLocal
from models import User, Role, UserRole, Project, Blog, Permission, RolePermission, Comment, NewsletterSubscription, AuditLog
from auth import create_access_token, create_refresh_token, verify_totp, authenticate_user, decode_token, get_user_roles
from security import get_password_hash
from schemas import (
    UserOut, Token, ProjectOut, BlogOut, UserCreate, SubscribeRequest, 
    RoleCreate, LoginRequest, CommentCreate, CommentOut, NewsletterCreate, NewsletterOut, AuditLogOut
)
import uuid
from utils import MinioStorage, optimize_image, validate_file_magic

storage = MinioStorage()

# SlowAPI Initialization
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title=settings.PROJECT_NAME)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "backend"}

# Compression Middleware
app.add_middleware(BrotliMiddleware)

# Redis Cache Helper
async def get_cache(key: str):
    data = redis_client.get(f"cache:{key}")
    return json.loads(data) if data else None

async def set_cache(key: str, data: any, expire: int = 300):
    redis_client.set(f"cache:{key}", json.dumps(data), ex=expire)

# Structured Logging Setup
class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "level": record.levelname,
            "message": record.getMessage(),
            "timestamp": self.formatTime(record, self.datefmt),
            "name": record.name,
        }
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_record)

handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logging.basicConfig(level=logging.INFO, handlers=[handler])
logger = logging.getLogger("api")

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"}
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' cdn.jsdelivr.net fonts.googleapis.com; "
        "font-src 'self' fonts.gstatic.com; "
        "img-src 'self' data: fastly.jsdelivr.net;"
    )
    return response

@app.middleware("http")
async def maintenance_middleware(request: Request, call_next):
    # Maintenance Mode Toggle (Redis)
    is_maint = redis_client.get("maintenance_mode") == "true"
    if is_maint and not request.url.path.startswith("/api/admin") and not request.url.path.startswith("/api/auth"):
        return JSONResponse(status_code=503, content={"detail": "System under maintenance. Please check back later."})
    return await call_next(request)

class DBSession:
    def __init__(self, db: AsyncSession):
        self.db = db

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

# RBAC Dependent Logic
def requires_role(required_role: str):
    async def role_checker(user: User = Depends(get_current_user)):
        roles = get_user_roles(user)
        if required_role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return role_checker

async def get_current_user(request: Request, authorization: str = Header(None), db: AsyncSession = Depends(get_db)):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    else:
        token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Zombie Token Check (Blacklist) - redis client is usually sync here unless we use aioredis, but let's keep it simple
    if redis_client.get(f"blacklist:{token}"):
        raise HTTPException(status_code=401, detail="Token revoked (logged out)")

    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid or expired access token")
    
    user_id = payload.get("sub")
    # Async query pattern (N+1 optimization: joinedload roles)
    result = await db.execute(
        select(User).options(joinedload(User.roles).joinedload(UserRole.role)).filter(User.id == user_id)
    )
    user = result.unique().scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User inactive or not found")
    return user


# Event Handlers
@app.on_event("shutdown")
async def shutdown_event():
    if hasattr(app.state, "arq_pool"):
        await app.state.arq_pool.close()
    logger.info("Application shutdown complete.")

@app.on_event("startup")
async def startup_event():
    await init_db()
    app.state.arq_pool = await create_pool(RedisSettings.from_dsn(settings.REDIS_URL))
    logger.info("Application startup complete with Arq pool.")
    
    # Seed default data if necessary (admin user & roles)
    async with SessionLocal() as db:
        try:
            # Ensure roles exist
            res = await db.execute(select(Role).limit(1))
            if not res.scalar_one_or_none():
                admin = Role(name='admin', slug='admin', description='Full access to system')
                editor = Role(name='editor', slug='editor', description='Can edit content')
                viewer = Role(name='viewer', slug='viewer', description='Read-only access')
                db.add_all([admin, editor, viewer])
                await db.commit()
            
            # Ensure admin user exists
            res = await db.execute(select(User).filter(User.username == 'admin'))
            if not res.scalar_one_or_none():
                admin_user = User(
                    username='admin', 
                    email='admin@example.com', 
                    password_hash=get_password_hash('Admin@123'), 
                    display_name='Admin User', 
                    is_active=True
                )
                db.add(admin_user)
                await db.commit()
                await db.refresh(admin_user)
                
                # assign admin role
                res = await db.execute(select(Role).filter(Role.name == 'admin'))
                admin_role = res.scalar_one_or_none()
                if admin_role:
                    ur = UserRole(user_id=admin_user.id, role_id=admin_role.id)
                    db.add(ur)
                    await db.commit()
            
            # Seed sample projects/blogs if empty
            res = await db.execute(select(Project).limit(1))
            if not res.scalar_one_or_none():
                samples = [
                    Project(title='Realtime Collaboration Studio', image='/images/project1.jpg', tags='Next.js,Tailwind,Realtime', date='2025-11-01', author='Alex', avatar='/images/avatars/alex.png', href='/projects/realtime-studio', excerpt='A scalable collaborative editor powered by WebRTC and CRDTs.'),
                    Project(title='Portfolio Micro-UI Kit', image='/images/project2.jpg', tags='UI Kit,Design System,Tailwind', date='2025-08-18', author='Alex', avatar='/images/avatars/alex.png', href='/projects/micro-ui-kit', excerpt='A modular UI kit for rapid portfolio builds.') ,
                    Project(title='Docs Studio with MDX', image='/images/project3.jpg', tags='MDX,Docs,Next.js', date='2024-12-02', author='Alex', avatar='/images/avatars/alex.png', href='/projects/docs-studio', excerpt='Docs platform powered by MDX for developer content.')
                ]
                db.add_all(samples)
                await db.commit()
            
            res = await db.execute(select(Blog).limit(1))
            if not res.scalar_one_or_none():
                sample_blogs = [
                    Blog(title='Designing for Developers: A Minimalist UI Ethos', image='/images/blog1.jpg', tags='UX,Frontend,Design', date='2026-01-15', author='Alex', avatar='/images/avatars/alex.png', href='/blog/minimalist-ui', excerpt='Practical tips for crafting content-first developer portfolios with calm typography and generous whitespace.'),
                    Blog(title='Performance-First UI: 5 Habits for Smooth Interactions', image='/images/blog2.jpg', tags='Performance,React,Animation', date='2025-12-03', author='Alex', avatar='/images/avatars/alex.png', href='/blog/performance-ui', excerpt=None),
                    Blog(title='Tailwind v4: Beyond Utility Classes for Real Projects', image='/images/blog3.jpg', tags='Tailwind,CSS,Systems', date='2025-09-28', author='Alex', avatar='/images/avatars/alex.png', href='/blog/tailwind-v4-systems', excerpt=None),
                ]
                db.add_all(sample_blogs)
                await db.commit()

            # Seed Skills Category data (Stored in Redis or just hardcoded for this demo, 
            # but let's provide an endpoint)
            skills_data = [
                {
                    "category": "Frontend",
                    "color": "#3b82f6",
                    "skills": [
                        {"name": "React / Next.js", "level": 90, "justification": "Tekerlekteki en geniş dilimlerden biri."},
                        {"name": "TypeScript", "level": 85, "justification": "Mevcut projelerindeki tip güvenliği kullanımı."},
                        {"name": "Tailwind CSS", "level": 95, "justification": "UI Development hakimiyeti."}
                    ]
                },
                {
                    "category": "Backend",
                    "color": "#8b5cf6",
                    "skills": [
                        {"name": "Python (FastAPI)", "level": 80, "justification": "Backend tarafındaki baskınlığı."},
                        {"name": "Node.js (Express)", "level": 75, "justification": "RESTful API tecrübesi."},
                        {"name": "PostgreSQL", "level": 80, "justification": "Veri tabanı yönetimi."}
                    ]
                }
            ]
            redis_client.set("skills_data", json.dumps(skills_data))
        except Exception as e:
            logger.error(f"Error seeding database: {e}")
            await db.rollback()
        finally:
            await db.close()

@app.get("/api/projects/{slug}", response_model=ProjectOut)
async def get_project_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).filter(Project.slug == slug))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.get("/api/blogs/{slug}", response_model=BlogOut)
async def get_blog_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Blog).filter(Blog.slug == slug))
    blog = result.scalar_one_or_none()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog

# Cursor Pagination Helper
def apply_cursor_pagination(query, cursor_id: int = None, limit: int = 10):
    if cursor_id:
        query = query.filter(Project.id > cursor_id)
    return query.limit(limit)

@app.get("/api/projects", response_model=List[ProjectOut])
async def get_projects(cursor: int = None, limit: int = 10, db: AsyncSession = Depends(get_db)):
    # 1. Check Cache
    cache_key = f"projects_c{cursor}_l{limit}"
    cached = await get_cache(cache_key)
    if cached:
        return cached

    # 2. Optimized Query
    query = select(Project).order_by(Project.id.asc())
    if cursor:
        query = query.filter(Project.id > cursor)
    
    result = await db.execute(query.limit(limit))
    projects = result.scalars().all()
    
    # 3. Cache Result
    serialized = [ProjectOut.model_validate(p).model_dump() for p in projects]
    result = await db.execute(query.limit(limit))
    blogs = result.scalars().all()
    
    serialized = [BlogOut.model_validate(b).model_dump() for b in blogs]
@app.get("/api/blogs", response_model=List[BlogOut])
async def get_blogs(cursor: int = None, limit: int = 10, db: AsyncSession = Depends(get_db)):
    cache_key = f"blogs_c{cursor}_l{limit}"
    cached = await get_cache(cache_key)
    if cached:
        return cached

    query = select(Blog).order_by(Blog.id.asc())
    if cursor:
        query = query.filter(Blog.id > cursor)
    
    result = await db.execute(query.limit(limit))
    blogs = result.scalars().all()
    
    serialized = [BlogOut.model_validate(b).model_dump() for b in blogs]
    await set_cache(cache_key, serialized)
    
    return blogs

# --- Discovery & SEO ---

@app.get("/api/search")
async def search_content(q: str, db: AsyncSession = Depends(get_db)):
    if not q:
        return {"blogs": [], "projects": []}
    
    if "mysql" in settings.DATABASE_URL.lower():
        blog_q = select(Blog).filter(text("MATCH(title, excerpt) AGAINST(:query IN NATURAL LANGUAGE MODE)")).params(query=q)
        proj_q = select(Project).filter(text("MATCH(title, excerpt) AGAINST(:query IN NATURAL LANGUAGE MODE)")).params(query=q)
    else:
        blog_q = select(Blog).filter(Blog.title.ilike(f"%{q}%"))
        proj_q = select(Project).filter(Project.title.ilike(f"%{q}%"))

    blog_res = await db.execute(blog_q)
    proj_res = await db.execute(proj_q)
    
    return {
        "blogs": blog_res.scalars().all(),
        "projects": proj_res.scalars().all()
    }

@app.get("/api/seo/{content_type}/{slug}")
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

@app.get("/api/sitemap.xml")
async def get_sitemap(db: AsyncSession = Depends(get_db)):
    blogs = await db.execute(select(Blog.slug))
    projects = await db.execute(select(Project.slug))
    
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for slug in blogs.scalars().all():
        xml += f'  <url><loc>https://omervision.io/blog/{slug}</loc></url>\n'
    for slug in projects.scalars().all():
        xml += f'  <url><loc>https://omervision.io/project/{slug}</loc></url>\n'
    xml += "</urlset>"
    
    return FastAPIResponse(content=xml, media_type="application/xml")

@app.get("/api/skills")
async def get_skills():
    data = redis_client.get("skills_data")
    if data:
        return json.loads(data)
    return []

# --- Engagement & Analytics ---

@app.get("/api/comments/{post_type}/{post_id}", response_model=List[CommentOut])
async def get_comments(post_type: str, post_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Comment).options(joinedload(Comment.user)).filter(
            Comment.post_type == post_type, 
            Comment.post_id == post_id,
            Comment.is_approved == True
        ).order_by(Comment.created_at.desc())
    )
    return result.scalars().all()

@app.post("/api/comments")
async def post_comment(req: CommentCreate, db: AsyncSession = Depends(get_db), current: User = Depends(get_current_user)):
    new_comment = Comment(
        post_id=req.post_id,
        post_type=req.post_type,
        user_id=current.id,
        content=req.content,
        is_approved=False
    )
    db.add(new_comment)
    await db.commit()
    return {"status": "pending_approval"}

@app.post("/api/analytics/track/{post_type}/{post_id}")
async def track_view_count(post_type: str, post_id: int, request: Request):
    ip_hash = hashlib.sha256(f"{request.client.host}{settings.SECRET_KEY}".encode()).hexdigest()
    cache_key = f"v:{post_type}:{post_id}:{ip_hash}"
    if not redis_client.get(cache_key):
        redis_client.incr(f"views:{post_type}:{post_id}")
        redis_client.set(cache_key, "1", ex=86400)
    return {"status": "tracked"}

@app.get("/api/og-image/{title}")
async def get_og_image_endpoint_route(title: str):
    from utils import generate_og_image
    return FastAPIResponse(content=generate_og_image(title), media_type="image/webp")

@app.post("/api/newsletter/subscribe/v2")
async def newsletter_subscribe_v2(req: NewsletterCreate, db: AsyncSession = Depends(get_db)):
    from utils import generate_verification_token
    token = generate_verification_token()
    sub = NewsletterSubscription(email=req.email, verification_token=token)
    db.add(sub)
    await db.commit()
    return {"status": "verification_sent"}

@app.get("/api/newsletter/verify/{token}")
async def newsletter_verify_route(token: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(NewsletterSubscription).filter(NewsletterSubscription.verification_token == token))
    sub = res.scalar_one_or_none()
    if not sub: raise HTTPException(status_code=400, detail="Invalid token")
    sub.is_verified = True
    sub.verification_token = None
    await db.commit()
    return {"status": "verified"}

@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: int, request: Request, db: AsyncSession = Depends(get_db), current: User = Depends(requires_role('admin'))):
    check_ip_whitelist(request)
    result = await db.execute(select(Project).filter(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(project)
    await db.commit()
    await log_audit(db, current.id, "DELETE_PROJECT", f"Project:{project_id}", request)
    return {"status": "deleted"}

@app.get("/api/admin/audit-logs", response_model=List[AuditLogOut])
async def get_audit_logs(request: Request, db: AsyncSession = Depends(get_db), current: User = Depends(requires_role('admin'))):
    check_ip_whitelist(request)
    result = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()))
    return result.scalars().all()

@app.get("/api/admin/system-status")
async def get_system_status(current: User = Depends(requires_role('admin'))):
    return {
        "cpu": psutil.cpu_percent(),
        "memory": psutil.virtual_memory().percent,
        "disk": psutil.disk_usage('/').percent,
        "uptime": time.time() - psutil.boot_time()
    }

@app.post("/api/admin/maintenance")
async def toggle_maintenance(enable: bool, current: User = Depends(requires_role('admin'))):
    redis_client.set("maintenance_mode", "true" if enable else "false")
    return {"status": "success", "maintenance": enable}

@app.get("/api/dashboard")
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    # Async aggregated metrics
    visitors = 1320
    pageViews = 5480
    signups = 124
    return {"visitors": visitors, "pageViews": pageViews, "signups": signups}

@app.post("/api/subscribe")
@limiter.limit("10/minute")
async def subscribe(req: SubscribeRequest, request: Request, db: AsyncSession = Depends(get_db)):
    if not req.email:
        raise HTTPException(status_code=400, detail="Email is required")
    # Background Task: Hand off to Arq worker
    await request.app.state.arq_pool.enqueue_job('send_welcome_email', req.email)
    return {"status": "subscribed", "email": req.email}

@app.post("/api/upload")
async def upload_asset(file: UploadFile = File(...), current: User = Depends(requires_role('editor'))):
    # Support multiple roles via logic if needed, but 'editor' usually covers it. 
    # For now, let's keep it simple.
    content = await file.read()
    validate_file_magic(content)
    
    # 1. Optimize
    optimized = optimize_image(content)
    
    # 2. Upload to MinIO
    filename = f"{uuid.uuid4()}.webp"
    url = await storage.upload_file(optimized, filename)
    
    return {"url": url}

@app.post("/api/roles")
async def create_role(role: RoleCreate, request: Request, db: AsyncSession = Depends(get_db), current: User = Depends(requires_role('admin'))):
    check_ip_whitelist(request)
    result = await db.execute(select(Role).filter(Role.name == role.name))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Role already exists")
    new_role = Role(name=role.name, description=role.description)
    db.add(new_role)
    await db.commit()
    await log_audit(db, current.id, "CREATE_ROLE", f"Role:{role.name}", request)
    return {"id": new_role.id, "name": new_role.name, "description": new_role.description}

@app.post("/api/roles/{role_id}/permissions")
async def assign_permission_to_role(role_id: int, permission_name: str, request: Request, db: AsyncSession = Depends(get_db), current: User = Depends(requires_role('admin'))):
    check_ip_whitelist(request)
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

@app.get("/api/users/me", response_model=UserOut)
def read_current_user(current: User = Depends(get_current_user)):
    return current

@app.post("/api/auth/register", response_model=UserOut)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).filter((User.username == user.username) | (User.email == user.email)))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    new_user = User(
        username=user.username,
        email=user.email,
        password_hash=get_password_hash(user.password),
        display_name=user.display_name,
        is_active=True
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Assign default role 'viewer'
    res = await db.execute(select(Role).filter(Role.slug == 'viewer'))
    role = res.scalar_one_or_none()
    if role:
        db.add(UserRole(user_id=new_user.id, role_id=role.id))
        await db.commit()
    
    return new_user

@app.post("/api/auth/login")
@limiter.limit("5/minute")
async def login(req: LoginRequest, request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).options(joinedload(User.roles)).filter(User.username == req.username))
    user = result.unique().scalar_one_or_none()
    
    # 1. Account Lockout Check
    if user and user.locked_until and user.locked_until > datetime.datetime.utcnow():
        logger.warning(f"Login attempt on locked account: {req.username}")
        raise HTTPException(status_code=403, detail="Account locked. Try again later.")

    # 2. Authenticate
    authenticated_user = await authenticate_user(db, req.username, req.password)
    
    if not authenticated_user:
        if user:
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                user.locked_until = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
                logger.error(f"Account locked due to too many fails: {req.username}")
            await db.commit()
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    # 3. Successful password check - Reset fails
    authenticated_user.failed_login_attempts = 0
    authenticated_user.locked_until = None
    await db.commit()

    # 4. MFA Check (TOTP)
    if authenticated_user.mfa_enabled:
        if not req.totp_code:
            return {"status": "mfa_required"}
        if not verify_totp(authenticated_user.totp_secret, req.totp_code):
            raise HTTPException(status_code=401, detail="Invalid TOTP code")

    # 5. Issue Tokens (Rotation)
    payload = {"sub": authenticated_user.id, "roles": get_user_roles(authenticated_user)}
    access_token = create_access_token(payload)
    refresh_token = create_refresh_token(payload)
    
    redis_client.set(f"refresh:{authenticated_user.id}", refresh_token, ex=datetime.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))

    # Secure Cookie implementation
    response.set_cookie(key="access_token", value=access_token, httponly=True, max_age=15 * 60, samesite="lax", secure=False)
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600, path="/api/auth/refresh", samesite="lax", secure=False)
    
    await log_audit(db, authenticated_user.id, "LOGIN", "auth", request)
    return {"status": "success", "roles": get_user_roles(authenticated_user)}

@app.post("/api/auth/refresh")
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
        logger.warning(f"Refresh token reuse detected for user {user_id}")
        raise HTTPException(status_code=401, detail="Session expired due to security violation")

    result = await db.execute(select(User).options(joinedload(User.roles)).filter(User.id == user_id))
    user = result.unique().scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User inactive")

    # Issue new pair
    new_payload = {"sub": user.id, "roles": get_user_roles(user)}
    new_access = create_access_token(new_payload)
    new_refresh = create_refresh_token(new_payload)
    
    redis_client.set(f"refresh:{user.id}", new_refresh, ex=datetime.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))

    response.set_cookie(key="access_token", value=new_access, httponly=True, max_age=15 * 60, samesite="lax", secure=True)
    response.set_cookie(key="refresh_token", value=new_refresh, httponly=True, max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600, path="/api/auth/refresh", samesite="lax", secure=True)
    
    return {"status": "refreshed"}

@app.post("/api/auth/logout")
def logout(request: Request, response: Response, user: User = Depends(get_current_user)):
    access_token = request.cookies.get("access_token")
    if access_token:
        # Blacklist for the remainder of its life
        redis_client.set(f"blacklist:{access_token}", "1", ex=15 * 60)
    
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token", path="/api/auth/refresh")
    return {"status": "logged_out"}

# Admin: create user
@app.post("/api/users", response_model=UserOut)
async def create_user(user: UserCreate, request: Request, db: AsyncSession = Depends(get_db), current: User = Depends(requires_role('admin'))):
    check_ip_whitelist(request)
    hashed = get_password_hash(user.password)
    new_user = User(username=user.username, email=user.email, password_hash=hashed, display_name=user.display_name, is_active=True)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    await log_audit(db, current.id, "CREATE_USER", f"User:{new_user.username}", request)
    
    # assign roles if provided
    if user.roles:
        for rname in user.roles:
            role_res = await db.execute(select(Role).filter(Role.name == rname))
            role = role_res.scalar_one_or_none()
            if role:
                db.add(UserRole(user_id=new_user.id, role_id=role.id))
        await db.commit()
    return new_user

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
