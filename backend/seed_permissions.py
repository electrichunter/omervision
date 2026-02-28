import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from database import SessionLocal
from models import Permission, Role, RolePermission
from sqlalchemy.future import select

# This list defines the granular permissions your app uses
DEFAULT_PERMISSIONS = [
    # Blog Permissions
    {"name": "blog.create", "description": "Create new blog posts"},
    {"name": "blog.read", "description": "Read blog posts (admin view)"},
    {"name": "blog.update", "description": "Update existing blog posts"},
    {"name": "blog.delete", "description": "Delete blog posts"},
    {"name": "blog.publish", "description": "Publish or unpublish blog posts"},
    
    # User Permissions
    {"name": "users.read", "description": "View user list and details"},
    {"name": "users.create", "description": "Create new users"},
    {"name": "users.update", "description": "Update user details"},
    {"name": "users.delete", "description": "Delete users"},
    {"name": "users.ban", "description": "Ban or unban users"},
    
    # Role & Permission Management
    {"name": "roles.manage", "description": "Manage roles and permissions"},
    
    # Support & Contact
    {"name": "support.read", "description": "View support tickets"},
    {"name": "support.manage", "description": "Respond to and update support tickets"},
    {"name": "contact.read", "description": "View contact form messages"},
    {"name": "contact.delete", "description": "Delete contact form messages"},
    
    # System Settings
    {"name": "system.settings", "description": "Manage system settings (maintenance, about, etc.)"},
    {"name": "system.logs", "description": "View system and error logs"}
]

async def seed_permissions():
    async with SessionLocal() as db:
        print("Starting permission seed...")
        
        # 1. Insert all defined permissions
        for perm_data in DEFAULT_PERMISSIONS:
            result = await db.execute(select(Permission).filter(Permission.name == perm_data["name"]))
            existing_perm = result.scalar_one_or_none()
            
            if not existing_perm:
                new_perm = Permission(name=perm_data["name"], description=perm_data["description"])
                db.add(new_perm)
                print(f"Created permission: {perm_data['name']}")
            elif existing_perm.description != perm_data["description"]:
                 # Update description if it changed
                 existing_perm.description = perm_data["description"]
                 print(f"Updated permission description: {perm_data['name']}")

        await db.commit()
        
        # 2. Automatically assign ALL permissions to the 'admin' role
        # Find the admin role
        admin_result = await db.execute(select(Role).filter(Role.slug == 'admin'))
        admin_role = admin_result.scalar_one_or_none()
        
        if admin_role:
            # Get all permissions in the DB
            all_perms_result = await db.execute(select(Permission))
            all_perms = all_perms_result.scalars().all()
            
            # Fetch existing role-permission links for admin to avoid duplicates
            existing_links_result = await db.execute(select(RolePermission).filter(RolePermission.role_id == admin_role.id))
            existing_links = existing_links_result.scalars().all()
            existing_perm_ids = {link.permission_id for link in existing_links}
            
            added_count = 0
            for perm in all_perms:
                if perm.id not in existing_perm_ids:
                    db.add(RolePermission(role_id=admin_role.id, permission_id=perm.id))
                    added_count += 1
            
            if added_count > 0:
                await db.commit()
                print(f"Assigned {added_count} new permissions to 'admin' role.")
            else:
                print("'admin' role already has all permissions.")
        else:
            print("WARNING: 'admin' role not found! Run the base seed first.")

        print("Permission seeding completed successfully.")

if __name__ == "__main__":
    asyncio.run(seed_permissions())
