import uuid
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from arq.jobs import Job

router = APIRouter(prefix="/api/tts", tags=["tts"])

class TTSRequest(BaseModel):
    text: str
    voice: str = "tr-TR-AhmetNeural"

@router.post("/generate")
async def generate_tts(request: Request, body: TTSRequest):
    if not body.text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    # Enqueue the task
    pool = request.app.state.arq_pool
    job = await pool.enqueue_job('generate_tts_task', body.text, body.voice)
    
    return {"job_id": job.job_id, "status": "pending"}

@router.get("/status/{job_id}")
async def get_tts_status(request: Request, job_id: str):
    pool = request.app.state.arq_pool
    job = Job(job_id, pool)
    
    # Check if job exists and get its status
    status = await job.status()
    if status == 'not_found':
         raise HTTPException(status_code=404, detail="Job not found")
    
    if status == 'complete':
        result = await job.result()
        return result
    
    return {"status": status}
