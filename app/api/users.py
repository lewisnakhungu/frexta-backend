from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..schemas.user import User as UserSchema

router = APIRouter(tags=["users"])

@router.get("/users/me", response_model=UserSchema)
async def read_users_me(
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve the current authenticated user's details.
    """
    result = await db.execute(select(User).where(User.email == current_user))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/users/{id}", response_model=UserSchema)
async def read_user(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """
    Retrieve a user by ID (admin-only, placeholder for role check).
    """
    # Placeholder for admin role check
    result = await db.execute(select(User).where(User.id == id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
