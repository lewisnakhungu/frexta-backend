from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.client import Client
from ..models.user import User
from ..schemas.client import ClientCreate, Client as ClientSchema

router = APIRouter(tags=["clients"])

# Create a new client
@router.post("/clients", response_model=ClientSchema)
async def create_client(
    client: ClientCreate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    result = await db.execute(select(User).where(User.email == current_user))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db_client = Client(**client.dict(), user_id=user.id)
    db.add(db_client)
    await db.commit()
    await db.refresh(db_client)
    return db_client

# Read all clients
@router.get("/clients", response_model=List[ClientSchema])
async def read_clients(
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    result = await db.execute(select(User).where(User.email == current_user))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(select(Client).where(Client.user_id == user.id))
    return result.scalars().all()

# Read a specific client by ID
@router.get("/clients/{id}", response_model=ClientSchema)
async def read_client(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    result = await db.execute(select(User).where(User.email == current_user))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(select(Client).where(Client.id == id, Client.user_id == user.id))
    client = result.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

# Update a client
@router.put("/clients/{id}", response_model=ClientSchema)
async def update_client(
    id: int,
    client_data: ClientCreate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    result = await db.execute(select(User).where(User.email == current_user))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(select(Client).where(Client.id == id, Client.user_id == user.id))
    client = result.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    for key, value in client_data.dict().items():
        setattr(client, key, value)

    await db.commit()
    await db.refresh(client)
    return client

# Delete a client
@router.delete("/clients/{id}")
async def delete_client(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    result = await db.execute(select(User).where(User.email == current_user))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(select(Client).where(Client.id == id, Client.user_id == user.id))
    client = result.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    await db.delete(client)
    await db.commit()
    return {"msg": "Client deleted successfully"}
