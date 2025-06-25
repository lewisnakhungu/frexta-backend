from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.payment import Payment
from ..models.user import User
from ..models.client import Client
from ..models.project import Project
from ..schemas.payment import PaymentCreate, Payment as PaymentSchema
from typing import List

router = APIRouter(prefix="/api", tags=["payments"])
"""
Router for payment-related CRUD operations, prefixed with /api.
"""

@router.post("/payments", response_model=PaymentSchema)
async def create_payment(payment: PaymentCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Create a new payment associated with a project and user.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    clients = db.query(Client).filter(Client.user_id == user.id).all()
    client_ids = [client.id for client in clients]
    project = db.query(Project).filter(Project.id == payment.project_id, Project.client_id.in_(client_ids)).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or not owned by user")
    db_payment = Payment(**payment.dict())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.get("/payments", response_model=List[PaymentSchema])
async def read_payments(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Retrieve all payments for the user's projects.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    clients = db.query(Client).filter(Client.user_id == user.id).all()
    client_ids = [client.id for client in clients]
    projects = db.query(Project).filter(Project.client_id.in_(client_ids)).all()
    project_ids = [project.id for project in projects]
    return db.query(Payment).filter(Payment.project_id.in_(project_ids)).all()

@router.get("/payments/{id}", response_model=PaymentSchema)
async def read_payment(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Retrieve a payment by ID, ensuring it belongs to the user's project.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    clients = db.query(Client).filter(Client.user_id == user.id).all()
    client_ids = [client.id for client in clients]
    projects = db.query(Project).filter(Project.client_id.in_(client_ids)).all()
    project_ids = [project.id for project in projects]
    payment = db.query(Payment).filter(Payment.id == id, Payment.project_id.in_(project_ids)).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found or not owned by user")
    return payment

@router.put("/payments/{id}", response_model=PaymentSchema)
async def update_payment(id: int, payment_data: PaymentCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Update a payment's details, ensuring it belongs to the user's project.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    clients = db.query(Client).filter(Client.user_id == user.id).all()
    client_ids = [client.id for client in clients]
    projects = db.query(Project).filter(Project.client_id.in_(client_ids)).all()
    project_ids = [project.id for project in projects]
    payment = db.query(Payment).filter(Payment.id == id, Payment.project_id.in_(project_ids)).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found or not owned by user")
    for key, value in payment_data.dict().items():
        setattr(payment, key, value)
    db.commit()
    db.refresh(payment)
    return payment

@router.delete("/payments/{id}")
async def delete_payment(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Delete a payment, ensuring it belongs to the user's project.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    clients = db.query(Client).filter(Client.user_id == user.id).all()
    client_ids = [client.id for client in clients]
    projects = db.query(Project).filter(Project.client_id.in_(client_ids)).all()
    project_ids = [project.id for project in projects]
    payment = db.query(Payment).filter(Payment.id == id, Payment.project_id.in_(project_ids)).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found or not owned by user")
    db.delete(payment)
    db.commit()
    return {"msg": "Payment deleted successfully"}

@router.get("/projects/{project_id}/payments", response_model=List[PaymentSchema])
async def read_project_payments(project_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """
    Retrieve all payments for a specific project, ensuring project ownership.
    """
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    clients = db.query(Client).filter(Client.user_id == user.id).all()
    client_ids = [client.id for client in clients]
    project = db.query(Project).filter(Project.id == project_id, Project.client_id.in_(client_ids)).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or not owned by user")
    return db.query(Payment).filter(Payment.project_id == project_id).all()