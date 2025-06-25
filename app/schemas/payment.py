from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional

class PaymentBase(BaseModel):
    amount: float
    date_paid: date
    notes: Optional[str] = None
    """
    Base schema for payment with required amount and date_paid, optional notes.
    """

class PaymentCreate(PaymentBase):
    project_id: int
    """
    Schema for creating a payment, includes project_id to associate with a project.
    """

class Payment(PaymentBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime
    """
    Schema for payment response, includes database fields (id, project_id, timestamps).
    """

    class Config:
        orm_mode = True
        """
        Enables Pydantic to convert SQLAlchemy ORM objects to JSON.
        """