from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NoteBase(BaseModel):
    content: str
    """
    Base schema for note with required content field.
    """

class NoteCreate(NoteBase):
    project_id: Optional[int] = None
    client_id: Optional[int] = None
    """
    Schema for creating a note, includes optional project_id and client_id.
    Only one of project_id or client_id should be provided.
    """

class Note(NoteBase):
    id: int
    project_id: Optional[int] = None
    client_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    """
    Schema for note response, includes database fields.
    """

    class Config:
        orm_mode = True
        """
        Enables Pydantic to convert SQLAlchemy ORM objects to JSON.
        """