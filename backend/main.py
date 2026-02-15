from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker
import redis
import os

# Kendi modüllerimizi dahil ediyoruz (Bunları oluşturduğunu varsayıyorum)
import models, schemas, auth

app = FastAPI()

# --- CORS AYARLARI ---
origins = ["http://localhost:3000"]
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

# Veritabanı tablolarını otomatik oluştur (Development ortamı için)
models.Base.metadata.create_all(bind=engine)

# --- REDIS BAĞLANTISI ---
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
r = redis.from_url(REDIS_URL, decode_responses=True)

# OAuth2 Şeması (Token endpoint'i /token adresindedir)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Dependency: Veritabanı oturumu
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 1. KAYIT OLMA (REGISTER) ---
@app.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Email kontrolü
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Bu email zaten kayıtlı.")
    
    # Username kontrolü
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı alınmış.")

    # Şifreyi hashle ve kullanıcıyı oluştur
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        username=user.username,
        display_name=user.display_name,
        password_hash=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # --- KRİTİK NOKTA: OTOMATİK ROL ATAMA (ID: 4 -> Reader) ---
    # Kullanıcı oluşturulduğu an ona 'Okuyucu' yetkisini yapıştırıyoruz.
    try:
        user_role = models.UserRole(user_id=new_user.id, role_id=4)
        db.add(user_role)
        db.commit()
    except Exception as e:
        # Rol atanamazsa kullanıcıyı sil ki veritabanı tutarlı kalsın (Transaction mantığı)
        db.delete(new_user)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Kullanıcı oluşturuldu ama rol atanamadı: {str(e)}")

    return new_user

# --- 2. GİRİŞ YAPMA (LOGIN) ---
@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Kullanıcıyı bul
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    
    # Kullanıcı yoksa veya şifre yanlışsa
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı veya şifre hatalı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Token üret
    access_token_expires = auth.timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# --- MEVCUT ENDPOINTLERİN ---
@app.get("/")
def read_root():
    return {"message": "FastAPI Blog Backend - Auth ve Redis Aktif!"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
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