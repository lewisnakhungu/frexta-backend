from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.note import Note
from ..models.user import User
from ..models.client import Client
from ..models.project import Project
from ..schemas.note import NoteCreate, Note as NoteSchema
from typing import List

router = APIRouter(tags=["notes"])

@router.post("/notes", response_model=NoteSchema)
async def create_note(
    note: NoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    result = await db.execute(select(User).where(User.email == current_user))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if note.project_id and note.client_id:
        raise HTTPException(status_code=400, detail="Note cannot be linked to both project and client")

    if note.project_id:
        result = await db.execute(select(Client.id).where(Client.user_id == user.id))
        client_ids = result.scalars().all()
        result = await db.execute(
            select(Project).where(Project.id == note.project_id, Project.client_id.in_(client_ids))
        )
        project = result.scalars().first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found or not owned by user")

    elif note.client_id:
        result = await db.execute(
            select(Client).where(Client.id == note.client_id, Client.user_id == user.id)
        )
        client = result.scalars().first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found or not owned by user")
    else:
        raise HTTPException(status_code=400, detail="Note must be linked to a project or client")

    db_note = Note(**note.dict())
    db.add(db_note)
    await db.commit()
    await db.refresh(db_note)
    return db_note

@router.get("/notes", response_model=List[NoteSchema])
async def read_notes(db: AsyncSession = Depends(get_db), current_user: str = Depends(get_current_user)):
    result = await db.execute(select(User).where(User.email == current_user))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(select(Client.id).where(Client.user_id == user.id))
    client_ids = result.scalars().all()

    result = await db.execute(select(Project.id).where(Project.client_id.in_(client_ids)))
    project_ids = result.scalars().all()

    result = await db.execute(
        select(Note).where(or_(Note.client_id.in_(client_ids), Note.project_id.in_(project_ids)))
    )
    return result.scalars().all()

@router.get("/notes/{id}", response_model=NoteSchema)
async def read_note(id: int, db: AsyncSession = Depends(get_db), current_user: str = Depends(get_current_user)):
    result = await db.execute(select(User).where(User.email == current_user))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(select(Client.id).where(Client.user_id == user.id))
    client_ids = result.scalars().all()

    result = await db.execute(select(Project.id).where(Project.client_id.in_(client_ids)))
    project_ids = result.scalars().all()

    result = await db.execute(
        select(Note).where(
            Note.id == id,
            or_(Note.client_id.in_(client_ids), Note.project_id.in_(project_ids))
        )
    )
    note = result.scalars().first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found or not owned by user")
    return note

@router.put("/notes/{id}", response_model=NoteSchema)
async def update_note(id: int, note_data: NoteCreate, db: AsyncSession = Depends(get_db), current_user: str = Depends(get_current_user)):
    result = await db.execute(select(User).where(User.email == current_user))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(select(Client.id).where(Client.user_id == user.id))
    client_ids = result.scalars().all()

    result = await db.execute(select(Project.id).where(Project.client_id.in_(client_ids)))
    project_ids = result.scalars().all()

    result = await db.execute(
        select(Note).where(
            Note.id == id,
            or_(Note.client_id.in_(client_ids), Note.project_id.in_(project_ids))
        )
    )
    note = result.scalars().first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found or not owned by user")

    for key, value in note_data.dict().items():
        setattr(note, key, value)
    await db.commit()
    await db.refresh(note)
    return note

@router.delete("/notes/{id}")
async def delete_note(id: int, db: AsyncSession = Depends(get_db), current_user: str = Depends(get_current_user)):
    result = await db.execute(select(User).where(User.email == current_user))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(select(Client.id).where(Client.user_id == user.id))
    client_ids = result.scalars().all()

    result = await db.execute(select(Project.id).where(Project.client_id.in_(client_ids)))
    project_ids = result.scalars().all()

    result = await db.execute(
        select(Note).where(
            Note.id == id,
            or_(Note.client_id.in_(client_ids), Note.project_id.in_(project_ids))
        )
    )
    note = result.scalars().first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found or not owned by user")

    await db.delete(note)
    await db.commit()
    return {"msg": "Note deleted successfully"}

@router.get("/projects/{project_id}/notes", response_model=List[NoteSchema])
async def read_project_notes(project_id: int, db: AsyncSession = Depends(get_db), current_user: str = Depends(get_current_user)):
    result = await db.execute(select(User).where(User.email == current_user))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(select(Client.id).where(Client.user_id == user.id))
    client_ids = result.scalars().all()

    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.client_id.in_(client_ids))
    )
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or not owned by user")

    result = await db.execute(select(Note).where(Note.project_id == project_id))
    return result.scalars().all()

@router.get("/clients/{client_id}/notes", response_model=List[NoteSchema])
async def read_client_notes(client_id: int, db: AsyncSession = Depends(get_db), current_user: str = Depends(get_current_user)):
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

    result = await db.execute(select(Note).where(Note.client_id == client_id))
    return result.scalars().all()
