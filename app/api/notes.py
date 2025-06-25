from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.note import Note
from ..models.user import User
from ..models.client import Client
from ..models.project import Project
from ..schemas.note import NoteCreate, Note as NoteSchema
from typing import List

router = APIRouter(prefix="/api", tags=["notes"])
"""
Router for note-related CRUD operations, prefixed with /api.
"""

@router.post("/notes", response_model=NoteSchema)
async def create_note(note: NoteCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Create a new note associated with a project or client, ensuring ownership.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if note.project_id and note.client_id:
        raise HTTPException(status_code=400, detail="Note cannot be linked to both project and client")
    if note.project_id:
        clients = db.query(Client).filter(Client.user_id == user.id).all()
        client_ids = [client.id for client in clients]
        project = db.query(Project).filter(Project.id == note.project_id, Project.client_id.in_(client_ids)).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found or not owned by user")
    elif note.client_id:
        client = db.query(Client).filter(Client.id == note.client_id, Client.user_id == user.id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found or not owned by user")
    else:
        raise HTTPException(status_code=400, detail="Note must be linked to a project or client")
    db_note = Note(**note.dict())
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@router.get("/notes", response_model=List[NoteSchema])
async def read_notes(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Retrieve all notes for the user's projects and clients.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    clients = db.query(Client).filter(Client.user_id == user.id).all()
    client_ids = [client.id for client in clients]
    projects = db.query(Project).filter(Project.client_id.in_(client_ids)).all()
    project_ids = [project.id for project in projects]
    return db.query(Note).filter(
        (Note.client_id.in_(client_ids)) | (Note.project_id.in_(project_ids))
    ).all()

@router.get("/notes/{id}", response_model=NoteSchema)
async def read_note(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Retrieve a note by ID, ensuring it belongs to the user's project or client.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    clients = db.query(Client).filter(Client.user_id == user.id).all()
    client_ids = [client.id for client in clients]
    projects = db.query(Project).filter(Project.client_id.in_(client_ids)).all()
    project_ids = [project.id for project in projects]
    note = db.query(Note).filter(
        Note.id == id,
        (Note.client_id.in_(client_ids)) | (Note.project_id.in_(project_ids))
    ).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found or not owned by user")
    return note

@router.put("/notes/{id}", response_model=NoteSchema)
async def update_note(id: int, note_data: NoteCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Update a note's details, ensuring it belongs to the user's project or client.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    clients = db.query(Client).filter(Client.user_id == user.id).all()
    client_ids = [client.id for client in clients]
    projects = db.query(Project).filter(Project.client_id.in_(client_ids)).all()
    project_ids = [project.id for project in projects]
    note = db.query(Note).filter(
        Note.id == id,
        (Note.client_id.in_(client_ids)) | (Note.project_id.in_(project_ids))
    ).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found or not owned by user")
    for key, value in note_data.dict().items():
        setattr(note, key, value)
    db.commit()
    db.refresh(note)
    return note

@router.delete("/notes/{id}")
async def delete_note(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Delete a note, ensuring it belongs to the user's project or client.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    clients = db.query(Client).filter(Client.user_id == user.id).all()
    client_ids = [client.id for client in clients]
    projects = db.query(Project).filter(Project.client_id.in_(client_ids)).all()
    project_ids = [project.id for project in projects]
    note = db.query(Note).filter(
        Note.id == id,
        (Note.client_id.in_(client_ids)) | (Note.project_id.in_(project_ids))
    ).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found or not owned by user")
    db.delete(note)
    db.commit()
    return {"msg": "Note deleted successfully"}

@router.get("/projects/{project_id}/notes", response_model=List[NoteSchema])
async def read_project_notes(project_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Retrieve all notes for a specific project, ensuring project ownership.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    clients = db.query(Client).filter(Client.user_id == user.id).all()
    client_ids = [client.id for client in clients]
    project = db.query(Project).filter(Project.id == project_id, Project.client_id.in_(client_ids)).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or not owned by user")
    return db.query(Note).filter(Note.project_id == project_id).all()

@router.get("/clients/{client_id}/notes", response_model=List[NoteSchema])
async def read_client_notes(client_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Retrieve all notes for a specific client, ensuring client ownership.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    client = db.query(Client).filter(Client.id == client_id, Client.user_id == user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found or not owned by user")
    return db.query(Note).filter(Note.client_id == client_id).all()