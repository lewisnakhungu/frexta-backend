from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.project import Project
from ..models.user import User
from ..models.client import Client
from ..schemas.project import ProjectCreate, Project as ProjectSchema
from typing import List

router = APIRouter(prefix="/api", tags=["projects"])
"""
Router for project-related CRUD operations, prefixed with /api.
"""

@router.post("/projects", response_model=ProjectSchema)
async def create_project(project: ProjectCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Create a new project associated with a client and the current user.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    client = db.query(Client).filter(Client.id == project.client_id, Client.user_id == user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found or not owned by user")
    db_project = Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/projects", response_model=List[ProjectSchema])
async def read_projects(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Retrieve all projects for the current user's clients.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    clients = db.query(Client).filter(Client.user_id == user.id).all()
    client_ids = [client.id for client in clients]
    return db.query(Project).filter(Project.client_id.in_(client_ids)).all()

@router.get("/projects/{id}", response_model=ProjectSchema)
async def read_project(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Retrieve a project by ID, ensuring it belongs to the user's client.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    clients = db.query(Client).filter(Client.user_id == user.id).all()
    client_ids = [client.id for client in clients]
    project = db.query(Project).filter(Project.id == id, Project.client_id.in_(client_ids)).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or not owned by user")
    return project

@router.put("/projects/{id}", response_model=ProjectSchema)
async def update_project(id: int, project_data: ProjectCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Update a project's details, ensuring it belongs to the user's client.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    clients = db.query(Client).filter(Client.user_id == user.id).all()
    client_ids = [client.id for client in clients]
    project = db.query(Project).filter(Project.id == id, Project.client_id.in_(client_ids)).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or not owned by user")
    for key, value in project_data.dict().items():
        setattr(project, key, value)
    db.commit()
    db.refresh(project)
    return project

@router.delete("/projects/{id}")
async def delete_project(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Delete a project, ensuring it belongs to the user's client.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    clients = db.query(Client).filter(Client.user_id == user.id).all()
    client_ids = [client.id for client in clients]
    project = db.query(Project).filter(Project.id == id, Project.client_id.in_(client_ids)).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or not owned by user")
    db.delete(project)
    db.commit()
    return {"msg": "Project deleted successfully"}

@router.get("/clients/{client_id}/projects", response_model=List[ProjectSchema])
async def read_client_projects(client_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Retrieve all projects for a specific client, ensuring client ownership.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    client = db.query(Client).filter(Client.id == client_id, Client.user_id == user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found or not owned by user")
    return db.query(Project).filter(Project.client_id == client_id).all()