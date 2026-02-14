from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Docker ortam değişkenlerinden URL'i al, yoksa varsayılanı kullan
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+mysqlconnector://blog_user:blog_password@db/blog_db")

# MySQL Bağlantı Motoru
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Veritabanı Oturumu
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Modellerin miras alacağı temel sınıf
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()