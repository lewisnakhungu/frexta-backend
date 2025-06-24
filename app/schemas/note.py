from pydantic import BaseModel
from datetime import datetime
from typing import Optional
#POST METHOD
class NoteCreate(BaseModel):
    content: str
#PATCH OR PUT
class NoteUpdate(BaseModel):
    
    content: Optional[str] = None
#GET RESPONSE STRUCTURE
class NoteRead (BaseModel):
    id:int
    content: str
    created_at: datetime
    updated_at : datetime

    class Config:
        orm_mode = True