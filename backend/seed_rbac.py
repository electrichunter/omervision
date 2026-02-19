import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from database import SessionLocal, engine
from models import Role, User, UserRole, Permission, RolePermission
from sqlalchemy.future import select
from security import get_password_hash

async def seed_advanced_rbac():
    async with SessionLocal() as db:
        # 1. Create Roles
        roles_data = [
            {'name': 'admin', 'slug': 'admin', 'description': 'Full System Access'},
            {'name': 'developer', 'slug': 'developer', 'description': 'System Logs & Metrics Access'},
            {'name': 'moderator', 'slug': 'moderator', 'description': 'Comment Moderation Access'},
            {'name': 'editor', 'slug': 'editor', 'description': 'Content Management Access'},
            {'name': 'viewer', 'slug': 'viewer', 'description': 'Read-Only Access'}
        ]

        for r in roles_data:
            res = await db.execute(select(Role).filter(Role.slug == r['slug']))
            if not res.scalar_one_or_none():
                db.add(Role(**r))
        
        await db.commit()
        print("--- Advanced Roles Seeded ---")

        # 2. Permissions (Conceptual for now)
        perms_data = [
            {'name': 'view_system_status', 'slug': 'view_system_status', 'group': 'system'},
            {'name': 'moderate_comments', 'slug': 'moderate_comments', 'group': 'engagement'},
            {'name': 'manage_content', 'slug': 'manage_content', 'group': 'content'}
        ]
        
        for p in perms_data:
            res = await db.execute(select(Permission).filter(Permission.slug == p['slug']))
            if not res.scalar_one_or_none():
                db.add(Permission(**p))
        
        await db.commit()
        print("--- Permissions Seeded ---")

if __name__ == "__main__":
    asyncio.run(seed_advanced_rbac())
