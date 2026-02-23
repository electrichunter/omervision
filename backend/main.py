import logging
import json
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from brotli_asgi import BrotliMiddleware
from sqlalchemy.future import select
import time
from arq import create_pool
from arq.connections import RedisSettings

from config import settings
from database import init_db, redis_client, SessionLocal
from models import User, Role, UserRole, Project, Blog
from security import get_password_hash

# Import Routers
from routers import auth, blogs, projects, admin, public, comments, upload, paas, tts

# SlowAPI Initialization
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title=settings.PROJECT_NAME)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Middlewares
app.add_middleware(BrotliMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
)

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

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})

from fastapi.exceptions import RequestValidationError
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error: {exc.errors()} - Body: {exc.body}")
    return JSONResponse(status_code=422, content={"detail": exc.errors(), "body": str(exc.body)})

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
    allowed_paths = request.url.path.startswith("/api/admin") or request.url.path.startswith("/api/auth") or request.url.path == "/api/health"
    if is_maint and not allowed_paths:
        return JSONResponse(status_code=503, content={"detail": "System under maintenance. Please check back later."})
    return await call_next(request)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url} | Origin: {request.headers.get('origin')}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

@app.get("/api/health")
async def health_check():
    is_maint = redis_client.get("maintenance_mode") == "true"
    return {"status": "ok", "service": "backend", "maintenance": is_maint}

# --- Routers ---
app.include_router(auth.router)
app.include_router(blogs.router)
app.include_router(projects.router)
app.include_router(admin.router)
app.include_router(comments.router)
app.include_router(upload.router)
app.include_router(public.router)
app.include_router(paas.router)
app.include_router(tts.router)

# --- Events ---
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
            res = await db.execute(select(Role).limit(1))
            if not res.scalar_one_or_none():
                admin = Role(name='admin', slug='admin', description='Full access to system')
                editor = Role(name='editor', slug='editor', description='Can edit content')
                viewer = Role(name='viewer', slug='viewer', description='Read-only access')
                db.add_all([admin, editor, viewer])
                await db.commit()
            
            res = await db.execute(select(User).filter(User.username == settings.ADMIN_USERNAME))
            if not res.scalar_one_or_none():
                admin_user = User(
                    username=settings.ADMIN_USERNAME, 
                    email='admin@example.com', 
                    password_hash=get_password_hash(settings.ADMIN_PASSWORD), 
                    display_name='Admin User', 
                    is_active=True
                )
                db.add(admin_user)
                await db.commit()
                await db.refresh(admin_user)
                
                res = await db.execute(select(Role).filter(Role.name == 'admin'))
                admin_role = res.scalar_one_or_none()
                if admin_role:
                    ur = UserRole(user_id=admin_user.id, role_id=admin_role.id)
                    db.add(ur)
                    await db.commit()
            


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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
