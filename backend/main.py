#!/usr/bin/env python3
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os

# DB & ORM (use absolute imports for compatibility with top-level execution in Docker)
from database import init_db, get_db
from models import User, Role, UserRole, Project, Blog, Permission, RolePermission
from auth import create_access_token, authenticate_user, decode_token, get_user_roles
from security import get_password_hash
from schemas import UserOut, Token, ProjectOut, BlogOut, UserCreate, SubscribeRequest, RoleCreate, LoginRequest

app = FastAPI(title="Dev Portfolio Backend")

origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DBSession:
    def __init__(self, db: Session):
        self.db = db

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@app.on_event("startup")
def startup_event():
    init_db()
    # Seed default data if necessary (admin user & roles)
    from sqlalchemy.orm import Session
    from database import SessionLocal
    db = SessionLocal()
    try:
        # Ensure roles exist
        if not db.query(Role).first():
            admin = Role(name='admin', slug='admin', description='Full access to system')
            editor = Role(name='editor', slug='editor', description='Can edit content')
            viewer = Role(name='viewer', slug='viewer', description='Read-only access')
            db.add_all([admin, editor, viewer])
            db.commit()
        # Ensure admin user exists
        if not db.query(User).filter(User.username == 'admin').first():
            from security import get_password_hash
            admin_user = User(username='admin', email='admin@example.com', password_hash=get_password_hash('Admin@123'), display_name='Admin User', is_active=True)
            db.add(admin_user)
            db.commit()
            # assign admin role
            admin_role = db.query(Role).filter(Role.name == 'admin').first()
            ur = UserRole(user_id=admin_user.id, role_id=admin_role.id)
            db.add(ur)
            db.commit()
        # Seed sample projects/blogs if empty
        if db.query(Project).count() == 0:
            samples = [
                Project(title='Realtime Collaboration Studio', image='/images/project1.jpg', tags='Next.js,Tailwind,Realtime', date='2025-11-01', author='Alex', avatar='/images/avatars/alex.png', href='/projects/realtime-studio', excerpt='A scalable collaborative editor powered by WebRTC and CRDTs.'),
                Project(title='Portfolio Micro-UI Kit', image='/images/project2.jpg', tags='UI Kit,Design System,Tailwind', date='2025-08-18', author='Alex', avatar='/images/avatars/alex.png', href='/projects/micro-ui-kit', excerpt='A modular UI kit for rapid portfolio builds.') ,
                Project(title='Docs Studio with MDX', image='/images/project3.jpg', tags='MDX,Docs,Next.js', date='2024-12-02', author='Alex', avatar='/images/avatars/alex.png', href='/projects/docs-studio', excerpt='Docs platform powered by MDX for developer content.')
            ]
            db.add_all(samples)
            db.commit()
        if db.query(Blog).count() == 0:
            sample_blogs = [
                Blog(title='Designing for Developers: A Minimalist UI Ethos', image='/images/blog1.jpg', tags='UX,Frontend,Design', date='2026-01-15', author='Alex', avatar='/images/avatars/alex.png', href='/blog/minimalist-ui', excerpt='Practical tips for crafting content-first developer portfolios with calm typography and generous whitespace.'),
                Blog(title='Performance-First UI: 5 Habits for Smooth Interactions', image='/images/blog2.jpg', tags='Performance,React,Animation', date='2025-12-03', author='Alex', avatar='/images/avatars/alex.png', href='/blog/performance-ui', excerpt=None),
                Blog(title='Tailwind v4: Beyond Utility Classes for Real Projects', image='/images/blog3.jpg', tags='Tailwind,CSS,Systems', date='2025-09-28', author='Alex', avatar='/images/avatars/alex.png', href='/blog/tailwind-v4-systems', excerpt=None),
            ]
            db.add_all(sample_blogs)
            db.commit()
    finally:
        db.close()

@app.get("/api/projects", response_model=List[ProjectOut])
def get_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()

@app.get("/api/blogs", response_model=List[BlogOut])
def get_blogs(db: Session = Depends(get_db)):
    return db.query(Blog).all()

@app.get("/api/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    # Simple aggregated metrics from sample entities
    visitors = 1320
    pageViews = 5480
    signups = 124
    return {"visitors": visitors, "pageViews": pageViews, "signups": signups}

@app.post("/api/subscribe")
def subscribe(req: SubscribeRequest, db: Session = Depends(get_db)):
    # Placeholder for subscription data; in a real app, store to DB
    if not req.email:
        raise HTTPException(status_code=400, detail="Email is required")
    return {"status": "subscribed", "email": req.email}

@app.post("/api/roles")
def create_role(role: RoleCreate, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    roles = get_user_roles(current)
    if 'admin' not in roles:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    if db.query(Role).filter(Role.name == role.name).first():
        raise HTTPException(status_code=400, detail="Role already exists")
    new_role = Role(name=role.name, description=role.description)
    db.add(new_role)
    db.commit()
    return {"id": new_role.id, "name": new_role.name, "description": new_role.description}

@app.post("/api/roles/{role_id}/permissions")
def assign_permission_to_role(role_id: int, permission_name: str, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    roles = get_user_roles(current)
    if 'admin' not in roles:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    perm = db.query(Permission).filter(Permission.name == permission_name).first()
    if not perm:
        perm = Permission(name=permission_name, description=f"Permission: {permission_name}")
        db.add(perm)
        db.commit()
    link = db.query(RolePermission).filter(RolePermission.role_id == role_id, RolePermission.permission_id == perm.id).first()
    if not link:
        db.add(RolePermission(role_id=role_id, permission_id=perm.id))
        db.commit()
    return {"role_id": role_id, "permission": permission_name}

@app.get("/api/users/me")
def read_current_user(current: User = Depends(get_current_user)):
    return {"id": current.id, "username": current.username, "email": current.email, "roles": get_user_roles(current)}

@app.post("/api/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, req.username, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    payload = {"sub": user.id, "roles": get_user_roles(user)}
    token = create_access_token(payload)
    return {"access_token": token, "token_type": "bearer"}

# Admin: create user
@app.post("/api/users")
def create_user(user: UserCreate, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    # Permission check: admin role required
    roles = get_user_roles(current)
    if 'admin' not in roles:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    hashed = get_password_hash(user.password)
    new_user = User(username=user.username, email=user.email, password_hash=hashed, display_name=user.display_name, is_active=True)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    # assign roles if provided
    if user.roles:
        for rname in user.roles:
            role = db.query(Role).filter(Role.name == rname).first()
            if role:
                db.add(UserRole(user_id=new_user.id, role_id=role.id))
        db.commit()
    return {"id": new_user.id, "username": new_user.username, "email": new_user.email}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
