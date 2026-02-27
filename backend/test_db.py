import asyncio
from database import engine
from sqlalchemy import text

async def main():
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT id, title, audio_url FROM blogs ORDER BY id DESC LIMIT 5"))
        print(res.fetchall())

asyncio.run(main())
