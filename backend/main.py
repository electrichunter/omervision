from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import redis
import os

app = FastAPI()

# --- CORS AYARLARI (Next.js ile iletişim için şart) ---
origins = [
    "http://localhost:3000",  # Frontend adresi
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- VERİTABANI BAĞLANTISI ---
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+mysqlconnector://blog_user:blog_password@db/blog_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- REDIS BAĞLANTISI ---
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
r = redis.from_url(REDIS_URL, decode_responses=True)

# Veritabanı oturumu için bağımlılık
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "FastAPI Blog Backend Çalışıyor!"}

@app.get("/health")
def health_check(db=Depends(get_db)):
    # 1. MySQL Testi
    try:
        db.execute(text("SELECT 1"))
        db_status = "Connected"
    except Exception as e:
        db_status = f"Failed: {str(e)}"

    # 2. Redis Testi
    try:
        r.set("test_key", "Redis is alive")
        redis_status = r.get("test_key")
    except Exception as e:
        redis_status = f"Failed: {str(e)}"

    return {
        "status": "ok",
        "mysql": db_status,
        "redis": redis_status
    }