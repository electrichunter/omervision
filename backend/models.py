import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    display_name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    roles = relationship('UserRole', back_populates='user')


class Role(Base):
    __tablename__ = 'roles'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    slug = Column(String(50), unique=True, nullable=False)
    description = Column(String(255))
    is_default = Column(Boolean, default=False)

    users = relationship('UserRole', back_populates='role')
    permissions = relationship('RolePermission', back_populates='role')


class UserRole(Base):
    __tablename__ = 'user_roles'
    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    role_id = Column(Integer, ForeignKey('roles.id'), primary_key=True)

    user = relationship('User', back_populates='roles')
    role = relationship('Role', back_populates='users')


class Permission(Base):
    __tablename__ = 'permissions'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(String(255))
    group = Column(String(50))

    roles = relationship('RolePermission', back_populates='permission')


class RolePermission(Base):
    __tablename__ = 'role_permissions'
    role_id = Column(Integer, ForeignKey('roles.id'), primary_key=True)
    permission_id = Column(Integer, ForeignKey('permissions.id'), primary_key=True)

    role = relationship('Role', back_populates='permissions')
    permission = relationship('Permission', back_populates='roles')


class Project(Base):
    __tablename__ = 'projects'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200))
    image = Column(String(255))
    tags = Column(String(255))  # comma-separated
    date = Column(String(20))
    author = Column(String(100))
    avatar = Column(String(255))
    href = Column(String(255))
    excerpt = Column(String(500))


class Blog(Base):
    __tablename__ = 'blogs'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200))
    image = Column(String(255))
    tags = Column(String(255))  # comma-separated
    date = Column(String(20))
    author = Column(String(100))
    avatar = Column(String(255))
    href = Column(String(255))
    excerpt = Column(String(500))
