import uuid
import edge_tts
from arq import create_pool
from arq.connections import RedisSettings
from config import settings
from utils import storage
from database import engine
from sqlalchemy import text as sql_text

async def send_welcome_email(ctx, email: str):
    # Simulated long-running task
    print(f"--- Background Task: Sending welcome email to {email} ---")
    await asyncio.sleep(2) 
    print(f"--- Welcome email sent to {email} ---")

async def generate_tts_task(ctx, blog_id: int, text: str, voice: str = "tr-TR-AhmetNeural"):
    print(f"--- Background Task: Generating TTS for blog {blog_id}, text length {len(text)} ---")
    try:
        communicate = edge_tts.Communicate(text, voice)
        audio_data = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]
        
        if not audio_data:
            return {"status": "error", "message": "Failed to generate audio"}

        filename = f"tts/{uuid.uuid4()}.mp3"
        url = await storage.upload_file(audio_data, filename, "audio/mpeg")
        print(f"--- TTS Generated: {url} ---")
        
        if blog_id > 0:
            async with engine.begin() as conn:
                # We must use kwargs list for parameters in async sqlalchemy
                await conn.execute(
                    sql_text("UPDATE blogs SET audio_url = :url WHERE id = :blog_id"), 
                    [{"url": url, "blog_id": blog_id}]
                )
            
        return {"status": "completed", "url": url}
    except Exception as e:
        print(f"--- TTS Task Error: {e} ---")
        return {"status": "error", "message": str(e)}

async def startup(ctx):
    print("--- Arq Worker Starting ---")

async def shutdown(ctx):
    print("--- Arq Worker Shutting Down ---")

class WorkerSettings:
    functions = [send_welcome_email, generate_tts_task]
    on_startup = startup
    on_shutdown = shutdown
    redis_settings = RedisSettings.from_dsn(settings.REDIS_URL)
