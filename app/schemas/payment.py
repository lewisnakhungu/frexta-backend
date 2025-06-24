from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NoteCreate(BaseModel):
    amount : int
    date_paid: datetime
    notes: str

class NoteUpdate(BaseModel):
    amount : Optional[str]= None
    date_paid:Optional[datetime]= None
    notes:Optional[str] = None

class NoteRead(BaseModel):
    id: int
    amount: int
    date_paid : datetime
    notes: str

    class Config:
        orm_mode = True