import asyncio
from sqlalchemy import text
from database import engine

async def migrate_schemas():
    async with engine.begin() as conn:
        # Update Projects table
        try:
            print("Updating projects.date format...")
            await conn.execute(text("ALTER TABLE projects MODIFY COLUMN date DATETIME;"))
        except Exception as e:
            print(f"Projects date tweak error: {e}")
            
        # Update Blogs table  
        try:
            print("Adding audio_url column to blogs...")
            await conn.execute(text("ALTER TABLE blogs ADD COLUMN audio_url VARCHAR(255);"))
        except Exception as e:
            print(f"Blogs audio_url tweak error: {e}")
            
        try:
            print("Updating blogs.date format...")
            await conn.execute(text("ALTER TABLE blogs MODIFY COLUMN date DATETIME;"))
        except Exception as e:
            print(f"Blogs date tweak error: {e}")
            
        try:
            print("Cleaning up old string data in blogs.readingTime...")
            # Remove 'min read' from existing data first
            await conn.execute(text("UPDATE blogs SET readingTime = REPLACE(readingTime, ' min read', '');"))
            print("Updating blogs.readingTime format...")
            await conn.execute(text("ALTER TABLE blogs MODIFY COLUMN readingTime INT;"))
        except Exception as e:
            print(f"Blogs readingTime tweak error: {e}")

if __name__ == "__main__":
    asyncio.run(migrate_schemas())
