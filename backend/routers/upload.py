import uuid
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from database import get_db
from models import User
from deps import requires_role
from utils import optimize_image, validate_file_magic, storage

router = APIRouter(prefix="/api/upload", tags=["upload"])

@router.post("")
async def upload_file(file: UploadFile = File(...), current: User = Depends(requires_role('admin'))):
    # Validate magic bytes
    content = await file.read(1024)
    file_type = validate_file_magic(content) 
    await file.seek(0)
    full_content = await file.read()
    
    if file_type.startswith("image/"):
         optimized_content = optimize_image(full_content)
         filename = f"{uuid.uuid4()}.webp"
         url = await storage.upload_file(optimized_content, filename, "image/webp")
    else:
         filename = f"{uuid.uuid4()}{os.path.splitext(file.filename)[1]}"
         url = await storage.upload_file(full_content, filename, file_type)
         
    return {"url": url}
