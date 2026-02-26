import asyncio
from sqlalchemy import text
from database import engine

async def check():
    async with engine.begin() as conn:
        res = await conn.execute(text("DESCRIBE blogs;"))
        for row in res:
            print(row)
    await engine.dispose()

asyncio.run(check())
