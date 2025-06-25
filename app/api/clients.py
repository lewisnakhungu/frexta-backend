from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.client import Client
from ..models.user import User
from ..schemas.client import ClientCreate, Client as ClientSchema
from typing import List

router = APIRouter(tags=["clients"])
"""
Router for client-related CRUD operations, prefixed with /api.
"""

@router.post("/clients", response_model=ClientSchema)
async def create_client(client: ClientCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Create a new client associated with the current user.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db_client = Client(**client.dict(), user_id=user.id)
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

@router.get("/clients", response_model=List[ClientSchema])
async def read_clients(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Retrieve all clients for the current user.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return db.query(Client).filter(Client.user_id == user.id).all()

@router.get("/clients/{id}", response_model=ClientSchema)
async def read_client(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Retrieve a client by ID, ensuring it belongs to the current user.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    client = db.query(Client).filter(Client.id == id, Client.user_id == user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.put("/clients/{id}", response_model=ClientSchema)
async def update_client(id: int, client_data: ClientCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Update a client's details, ensuring it belongs to the current user.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    client = db.query(Client).filter(Client.id == id, Client.user_id == user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    for key, value in client_data.dict().items():
        setattr(client, key, value)
    db.commit()
    db.refresh(client)
    return client

@router.delete("/clients/{id}")
async def delete_client(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Delete a client, ensuring it belongs to the current user.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    client = db.query(Client).filter(Client.id == id, Client.user_id == user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(client)
    db.commit()
    return {"msg": "Client deleted successfully"}