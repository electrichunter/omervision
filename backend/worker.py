import asyncio
from arq import create_pool
from arq.connections import RedisSettings
from config import settings

async def send_welcome_email(ctx, email: str):
    # Simulated long-running task
    print(f"--- Background Task: Sending welcome email to {email} ---")
    await asyncio.sleep(2) 
    print(f"--- Welcome email sent to {email} ---")

async def startup(ctx):
    print("--- Arq Worker Starting ---")

async def shutdown(ctx):
    print("--- Arq Worker Shutting Down ---")

class WorkerSettings:
    functions = [send_welcome_email]
    on_startup = startup
    on_shutdown = shutdown
    redis_settings = RedisSettings.from_dsn(settings.REDIS_URL)
