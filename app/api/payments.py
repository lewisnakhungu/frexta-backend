from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.payment import Payment
from ..models.user import User
from ..models.client import Client
from ..models.project import Project
from ..schemas.payment import PaymentCreate, Payment as PaymentSchema
from typing import List

router = APIRouter(tags=["payments"])

@router.post("/payments", response_model=PaymentSchema)
async def create_payment(
    payment: PaymentCreate,
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
        select(Project).where(Project.id == payment.project_id, Project.client_id.in_(client_ids))
    )
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or not owned by user")

    db_payment = Payment(**payment.dict())
    db.add(db_payment)
    await db.commit()
    await db.refresh(db_payment)
    return db_payment

@router.get("/payments", response_model=List[PaymentSchema])
async def read_payments(db: AsyncSession = Depends(get_db), current_user: str = Depends(get_current_user)):
    result = await db.execute(select(User).where(User.email == current_user))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(select(Client.id).where(Client.user_id == user.id))
    client_ids = result.scalars().all()

    result = await db.execute(select(Project.id).where(Project.client_id.in_(client_ids)))
    project_ids = result.scalars().all()

    result = await db.execute(select(Payment).where(Payment.project_id.in_(project_ids)))
    return result.scalars().all()

@router.get("/payments/{id}", response_model=PaymentSchema)
async def read_payment(id: int, db: AsyncSession = Depends(get_db), current_user: str = Depends(get_current_user)):
    result = await db.execute(select(User).where(User.email == current_user))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(select(Client.id).where(Client.user_id == user.id))
    client_ids = result.scalars().all()

    result = await db.execute(select(Project.id).where(Project.client_id.in_(client_ids)))
    project_ids = result.scalars().all()

    result = await db.execute(
        select(Payment).where(Payment.id == id, Payment.project_id.in_(project_ids))
    )
    payment = result.scalars().first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found or not owned by user")

    return payment

@router.put("/payments/{id}", response_model=PaymentSchema)
async def update_payment(
    id: int,
    payment_data: PaymentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    result = await db.execute(select(User).where(User.email == current_user))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(select(Client.id).where(Client.user_id == user.id))
    client_ids = result.scalars().all()

    result = await db.execute(select(Project.id).where(Project.client_id.in_(client_ids)))
    project_ids = result.scalars().all()

    result = await db.execute(
        select(Payment).where(Payment.id == id, Payment.project_id.in_(project_ids))
    )
    payment = result.scalars().first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found or not owned by user")

    for key, value in payment_data.dict().items():
        setattr(payment, key, value)

    await db.commit()
    await db.refresh(payment)
    return payment

@router.delete("/payments/{id}")
async def delete_payment(
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

    result = await db.execute(select(Project.id).where(Project.client_id.in_(client_ids)))
    project_ids = result.scalars().all()

    result = await db.execute(
        select(Payment).where(Payment.id == id, Payment.project_id.in_(project_ids))
    )
    payment = result.scalars().first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found or not owned by user")

    await db.delete(payment)
    await db.commit()
    return {"msg": "Payment deleted successfully"}

@router.get("/projects/{project_id}/payments", response_model=List[PaymentSchema])
async def read_project_payments(
    project_id: int,
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
        select(Project).where(Project.id == project_id, Project.client_id.in_(client_ids))
    )
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or not owned by user")

    result = await db.execute(select(Payment).where(Payment.project_id == project_id))
    return result.scalars().all()
