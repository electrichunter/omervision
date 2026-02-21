import datetime
import os
import shutil
import subprocess
import asyncio
from typing import List, Optional
import docker
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import get_db
from models import User, PaaSProject
from schemas import PaaSProjectCreate, PaaSProjectOut, PaaSProjectUpdate
from deps import get_current_user

router = APIRouter(prefix="/api/paas", tags=["paas"])

# Try to initialize Docker client
try:
    docker_client = docker.from_env()
except Exception as e:
    docker_client = None
    print(f"FAILED TO INIT DOCKER CLIENT: {e}")

WORKSPACE_DIR = "/tmp/paas_projects"
os.makedirs(WORKSPACE_DIR, exist_ok=True)

async def detect_project_type(project_dir: str) -> str:
    """Analyze the repository files to guess what kind of app it is."""
    files = os.listdir(project_dir)
    if "package.json" in files:
        # Check if NextJS
        with open(os.path.join(project_dir, "package.json"), "r") as f:
            content = f.read()
            if "next" in content:
                return "nextjs"
        return "nodejs"
    elif "requirements.txt" in files or "main.py" in files:
        return "fastapi"
    elif "index.html" in files:
        return "static"
    return "unknown"

def generate_dockerfile(project_type: str, project_dir: str):
    dockerfile_path = os.path.join(project_dir, "Dockerfile")
    if os.path.exists(dockerfile_path):
        return  # Use existing Dockerfile if any
        
    content = ""
    if project_type == "nextjs":
        content = """FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]"""
    elif project_type == "nodejs":
        content = """FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]"""
    elif project_type == "fastapi":
        content = """FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]"""
    elif project_type == "static":
        content = """FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80"""
    else:
        # Fallback to simple static
        content = """FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80"""

    with open(dockerfile_path, "w") as f:
        f.write(content)

def find_available_port() -> int:
    import socket
    from contextlib import closing
    with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(('', 0))
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        return s.getsockname()[1]

async def deploy_project_task(project_id: int, repo_url: str):
    from database import AsyncSessionLocal
    
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(PaaSProject).filter(PaaSProject.id == project_id))
        project = result.scalar_one_or_none()
        
        if not project:
            return

        project.status = "deploying"
        project.logs = "Starting deployment...\n"
        await db.commit()
        
        try:
            if not docker_client:
                raise Exception("Docker client is not available on the server.")

            project_dir = os.path.join(WORKSPACE_DIR, f"project_{project_id}")
            if os.path.exists(project_dir):
                shutil.rmtree(project_dir)
            
            # 1. Clone Repo
            project.logs += f"Cloning {repo_url}...\n"
            await db.commit()
            
            process = await asyncio.create_subprocess_exec(
                "git", "clone", repo_url, project_dir,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            if process.returncode != 0:
                raise Exception(f"Git clone failed: {stderr.decode()}")
                
            project.logs += "Clone successful.\nDetecting project type...\n"
            await db.commit()
            
            # 2. Detect & Generate Dockerfile
            ptype = await detect_project_type(project_dir)
            project.project_type = ptype
            generate_dockerfile(ptype, project_dir)
            
            project.logs += f"Detected project type: {ptype}. Building Docker image...\n"
            await db.commit()
            
            # 3. Build Docker Image
            image_name = f"paas_app_{project_id}"
            
            def build_image():
                return docker_client.images.build(path=project_dir, tag=image_name, rm=True)
                
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, build_image)
            
            project.logs += "Docker image built successfully. Staring container...\n"
            await db.commit()
            
            # 4. Run Docker Container
            target_port = 3000 if ptype in ["nextjs", "nodejs"] else (8000 if ptype == "fastapi" else 80)
            host_port = find_available_port()
            
            def run_container():
                return docker_client.containers.run(
                    image_name,
                    detach=True,
                    ports={f"{target_port}/tcp": host_port},
                    # Security boundaries
                    mem_limit="256m",
                    cpu_quota=50000,
                    restart_policy={"Name": "on-failure", "MaximumRetryCount": 3}
                )
                
            container = await loop.run_in_executor(None, run_container)
            
            project.container_id = container.id
            project.port = host_port
            project.status = "running"
            # Hardcoded host assumption for preview - assuming frontend accesses via localhost or the actual IP
            # For this test env, we'll return localhost:[port]
            project.host_url = f"http://localhost:{host_port}"
            project.logs += f"Container started successfully! Running on port {host_port}.\n"
            await db.commit()

        except Exception as e:
            project.status = "failed"
            project.logs += f"\nERROR: {str(e)}"
            await db.commit()

@router.post("", response_model=PaaSProjectOut)
async def create_project(project: PaaSProjectCreate, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current: User = Depends(get_current_user)):
    new_proj = PaaSProject(
        user_id=current.id,
        repo_url=project.repo_url,
        name=project.name,
        description=project.description,
        status="pending"
    )
    db.add(new_proj)
    await db.commit()
    await db.refresh(new_proj)
    
    background_tasks.add_task(deploy_project_task, new_proj.id, new_proj.repo_url)
    return new_proj

@router.get("", response_model=List[PaaSProjectOut])
async def get_projects(db: AsyncSession = Depends(get_db), current: User = Depends(get_current_user)):
    result = await db.execute(select(PaaSProject).filter(PaaSProject.user_id == current.id).order_by(PaaSProject.created_at.desc()))
    return result.scalars().all()

@router.get("/{project_id}", response_model=PaaSProjectOut)
async def get_project(project_id: int, db: AsyncSession = Depends(get_db), current: User = Depends(get_current_user)):
    result = await db.execute(select(PaaSProject).filter(PaaSProject.id == project_id, PaaSProject.user_id == current.id))
    proj = result.scalar_one_or_none()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return proj

@router.post("/{project_id}/stop")
async def stop_project(project_id: int, db: AsyncSession = Depends(get_db), current: User = Depends(get_current_user)):
    result = await db.execute(select(PaaSProject).filter(PaaSProject.id == project_id, PaaSProject.user_id == current.id))
    proj = result.scalar_one_or_none()
    if not proj or not proj.container_id:
        raise HTTPException(status_code=404, detail="Running project not found")
        
    try:
        if docker_client:
            container = docker_client.containers.get(proj.container_id)
            container.stop()
            container.remove()
    except Exception as e:
        pass # Allow DB update even if docker fails
        
    proj.status = "stopped"
    proj.container_id = None
    proj.port = None
    proj.host_url = None
    await db.commit()
    return {"status": "stopped"}

@router.put("/{project_id}", response_model=PaaSProjectOut)
async def update_project(project_id: int, update_data: PaaSProjectUpdate, db: AsyncSession = Depends(get_db), current: User = Depends(get_current_user)):
    result = await db.execute(select(PaaSProject).filter(PaaSProject.id == project_id, PaaSProject.user_id == current.id))
    proj = result.scalar_one_or_none()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    if update_data.name is not None:
        proj.name = update_data.name
    if update_data.repo_url is not None:
        proj.repo_url = update_data.repo_url
    if update_data.description is not None:
        proj.description = update_data.description

    await db.commit()
    await db.refresh(proj)
    return proj

@router.delete("/{project_id}")
async def delete_project(project_id: int, db: AsyncSession = Depends(get_db), current: User = Depends(get_current_user)):
    result = await db.execute(select(PaaSProject).filter(PaaSProject.id == project_id, PaaSProject.user_id == current.id))
    proj = result.scalar_one_or_none()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    # Stop container if running
    if proj.container_id and docker_client:
        try:
            container = docker_client.containers.get(proj.container_id)
            container.stop()
            container.remove()
        except:
            pass

    # Delete workspace dir
    workspace = os.path.join(WORKSPACE_DIR, f"project_{proj.id}")
    if os.path.exists(workspace):
        shutil.rmtree(workspace, ignore_errors=True)

    await db.delete(proj)
    await db.commit()
    return {"status": "deleted"}

@router.post("/{project_id}/start")
async def start_project(project_id: int, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current: User = Depends(get_current_user)):
    result = await db.execute(select(PaaSProject).filter(PaaSProject.id == project_id, PaaSProject.user_id == current.id))
    proj = result.scalar_one_or_none()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    background_tasks.add_task(deploy_project_task, proj.id, proj.repo_url)
    return {"status": "deploying_started"}
