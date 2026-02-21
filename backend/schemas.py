import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern="^[a-zA-Z0-9_@.-]+$")
    email: EmailStr
    password: str = Field(..., min_length=4, max_length=128)
    display_name: str = Field(..., min_length=2, max_length=100)
    roles: List[str] = []


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    display_name: str
    is_active: bool
    roles: List[str] = []

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProjectOut(BaseModel):
    id: int
    title: str
    slug: Optional[str] = None
    image: str
    tags: str
    date: datetime.datetime
    author: str
    avatar: Optional[str] = None
    href: str
    excerpt: Optional[str] = None
    longDescription: Optional[str] = None
    featured: bool = False
    category: Optional[str] = None
    year: Optional[str] = None

    model_config = {"from_attributes": True}


class BlogCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    slug: str = Field(..., min_length=1, max_length=100)
    image: Optional[str] = None
    tags: str
    excerpt: Optional[str] = None
    content: str
    featured: bool = False
    is_published: bool = True

class BlogOut(BaseModel):
    id: int
    title: str
    slug: Optional[str] = None
    image: Optional[str] = None
    tags: str
    date: datetime.datetime
    author: str
    avatar: Optional[str] = None
    href: str
    excerpt: Optional[str] = None
    content: Optional[str] = None
    readingTime: Optional[int] = 5
    featured: bool = False
    is_published: bool = True

    model_config = {"from_attributes": True}


class SubscribeRequest(BaseModel):
    email: str


class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None


class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    target: str
    ip_address: Optional[str]
    timestamp: datetime.datetime

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    username: str
    password: str
    totp_code: Optional[str] = None
class CommentCreate(BaseModel):
    post_id: int
    post_type: str = "blog"
    content: str = Field(..., min_length=1, max_length=1000)

class CommentOut(BaseModel):
    id: int
    user_id: Optional[int]
    post_id: Optional[int] = None
    post_type: Optional[str] = None
    content: str
    is_approved: bool
    created_at: datetime.datetime
    user: Optional[UserOut] = None

    model_config = {"from_attributes": True}

class NewsletterCreate(BaseModel):
    email: EmailStr

class NewsletterOut(BaseModel):
    email: str
    is_verified: bool
    created_at: datetime.datetime

    model_config = {"from_attributes": True}

class PaaSProjectCreate(BaseModel):
    repo_url: str
    name: str
    description: Optional[str] = None

class PaaSProjectUpdate(BaseModel):
    repo_url: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None

class PaaSProjectOut(BaseModel):
    id: int
    user_id: Optional[int]
    repo_url: str
    name: str
    description: Optional[str] = None
    status: str
    project_type: Optional[str]
    port: Optional[int]
    container_id: Optional[str]
    host_url: Optional[str]
    logs: Optional[str]
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = {"from_attributes": True}
