from typing import List, Optional
from pydantic import BaseModel


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    display_name: str
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
    image: str
    tags: str
    date: str
    author: str
    avatar: Optional[str] = None
    href: str
    excerpt: Optional[str] = None

    model_config = {"from_attributes": True}


class BlogOut(ProjectOut):
    pass


class SubscribeRequest(BaseModel):
    email: str


class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str
