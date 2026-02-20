import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index, Text, BigInteger
from sqlalchemy.dialects.mysql import INTEGER as MYSQL_INTEGER
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = 'users'
    id = Column(MYSQL_INTEGER(unsigned=True), primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    display_name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    
    # 2FA / Security
    totp_secret = Column(String(32), nullable=True)
    mfa_enabled = Column(Boolean, default=False)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)

    roles = relationship('UserRole', back_populates='user')


class Role(Base):
    __tablename__ = 'roles'
    id = Column(MYSQL_INTEGER(unsigned=True), primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    slug = Column(String(50), unique=True, nullable=False)
    description = Column(String(255))
    is_default = Column(Boolean, default=False)

    users = relationship('UserRole', back_populates='role')
    permissions = relationship('RolePermission', back_populates='role')


class UserRole(Base):
    __tablename__ = 'user_roles'
    user_id = Column(MYSQL_INTEGER(unsigned=True), ForeignKey('users.id'), primary_key=True)
    role_id = Column(MYSQL_INTEGER(unsigned=True), ForeignKey('roles.id'), primary_key=True)

    user = relationship('User', back_populates='roles')
    role = relationship('Role', back_populates='users')


class Permission(Base):
    __tablename__ = 'permissions'
    id = Column(MYSQL_INTEGER(unsigned=True), primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(String(255))
    group = Column(String(50))

    roles = relationship('RolePermission', back_populates='permission')


class RolePermission(Base):
    __tablename__ = 'role_permissions'
    role_id = Column(MYSQL_INTEGER(unsigned=True), ForeignKey('roles.id'), primary_key=True)
    permission_id = Column(MYSQL_INTEGER(unsigned=True), ForeignKey('permissions.id'), primary_key=True)

    role = relationship('Role', back_populates='permissions')
    permission = relationship('Permission', back_populates='roles')


class Project(Base):
    __tablename__ = 'projects'
    id = Column(MYSQL_INTEGER(unsigned=True), primary_key=True, index=True, autoincrement=True)
    title = Column(String(200))
    slug = Column(String(200), unique=True, index=True)
    image = Column(String(255))
    tags = Column(String(255))  # comma-separated
    date = Column(String(20))
    author = Column(String(100))
    avatar = Column(String(255))
    href = Column(String(255))
    excerpt = Column(String(500))
    longDescription = Column(Text)
    featured = Column(Boolean, default=False)
    category = Column(String(50))
    year = Column(String(10))

    __table_args__ = (
        Index('ix_project_fulltext', 'title', 'excerpt', mysql_prefix='FULLTEXT'),
    )


class Blog(Base):
    __tablename__ = 'blogs'
    id = Column(MYSQL_INTEGER(unsigned=True), primary_key=True, index=True, autoincrement=True)
    title = Column(String(200))
    slug = Column(String(200), unique=True, index=True)
    image = Column(String(255))
    tags = Column(String(255))  # comma-separated
    date = Column(String(20))
    author = Column(String(100))
    avatar = Column(String(255))
    href = Column(String(255))
    excerpt = Column(String(500))
    content = Column(Text)
    readingTime = Column(String(50))
    featured = Column(Boolean, default=False)
    is_published = Column(Boolean, default=True)

    __table_args__ = (
        Index('ix_blog_fulltext', 'title', 'excerpt', mysql_prefix='FULLTEXT'),
    )

class Comment(Base):
    __tablename__ = 'comments'
    id = Column(MYSQL_INTEGER(unsigned=True), primary_key=True, index=True, autoincrement=True)
    post_id = Column(Integer, index=True) # Could be Blog ID
    post_type = Column(String(20)) # 'blog' or 'project'
    user_id = Column(MYSQL_INTEGER(unsigned=True), ForeignKey('users.id'), nullable=True)
    content = Column(Text, nullable=False)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship('User')

class NewsletterSubscription(Base):
    __tablename__ = 'newsletter_subscriptions'
    id = Column(MYSQL_INTEGER(unsigned=True), primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(100), unique=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class AuditLog(Base):
    __tablename__ = 'audit_logs'
    id = Column(MYSQL_INTEGER(unsigned=True), primary_key=True, index=True, autoincrement=True)
    user_id = Column(MYSQL_INTEGER(unsigned=True), ForeignKey('users.id'), nullable=True)
    action = Column(String(50), nullable=False)  # e.g., 'DELETE_PROJECT'
    target = Column(String(100), nullable=False)  # e.g., 'projects:12'
    ip_address = Column(String(45), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
