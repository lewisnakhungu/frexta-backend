from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.project import Project
from ..models.user import User
from ..models.client import Client
from ..schemas.project import ProjectCreate, ProjectUpdate, Project as ProjectSchema

router = APIRouter(tags=["projects"])

@router.post("/projects", response_model=ProjectSchema)
async def create_project(
    project: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    result = await db.execute(select(User).where(User.email == current_user))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(
        select(Client).where(Client.id == project.client_id, Client.user_id == user.id)
    )
    client = result.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found or not owned by user")

    db_project = Project(**project.dict())
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)
    return db_project

@router.get("/projects", response_model=List[ProjectSchema])
async def read_projects(
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    result = await db.execute(select(User).where(User.email == current_user))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(select(Client.id).where(Client.user_id == user.id))
    client_ids = result.scalars().all()

    result = await db.execute(select(Project).where(Project.client_id.in_(client_ids)))
    return result.scalars().all()

@router.get("/projects/{id}", response_model=ProjectSchema)
async def read_project(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    result = await db.execute(select(User).where(User.email == current_user))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(select(Client.id).where(Client.user_id == user.id))
    client_ids = result.scalars().all()

    result = await db.execute(
        select(Project).where(Project.id == id, Project.client_id.in_(client_ids))
    )
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or not owned by user")

    return project

@router.put("/projects/{id}", response_model=ProjectSchema)
async def update_project(
    id: int,
    project_data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    result = await db.execute(select(User).where(User.email == current_user))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(select(Client.id).where(Client.user_id == user.id))
    client_ids = result.scalars().all()

    result = await db.execute(
        select(Project).where(Project.id == id, Project.client_id.in_(client_ids))
    )
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or not owned by user")

    if project_data.client_id and project_data.client_id not in client_ids:
        raise HTTPException(status_code=403, detail="Cannot assign project to a client not owned by user")

    for key, value in project_data.dict(exclude_unset=True).items():
        setattr(project, key, value)

    await db.commit()
    await db.refresh(project)
    return project

@router.delete("/projects/{id}")
async def delete_project(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    result = await db.execute(select(User).where(User.email == current_user))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(select(Client.id).where(Client.user_id == user.id))
    client_ids = result.scalars().all()

    result = await db.execute(
        select(Project).where(Project.id == id, Project.client_id.in_(client_ids))
    )
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or not owned by user")

    await db.delete(project)
    await db.commit()
    return {"msg": "Project deleted successfully"}

@router.get("/clients/{client_id}/projects", response_model=List[ProjectSchema])
async def read_client_projects(
    client_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    result = await db.execute(select(User).where(User.email == current_user))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(
        select(Client).where(Client.id == client_id, Client.user_id == user.id)
    )
    client = result.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found or not owned by user")

    result = await db.execute(select(Project).where(Project.client_id == client_id))
    return result.scalars().all()
