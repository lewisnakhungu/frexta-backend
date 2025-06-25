from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class ProjectStatus(str, Enum):
    PENDING = "Pending"
    ACTIVE = "Active"
    COMPLETED = "Completed"
    """
    Enum for project status, restricts values to Pending, Active, Completed.
    """

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.PENDING
    """
    Base schema for project with required name, optional description, and default status.
    """

class ProjectCreate(ProjectBase):
    client_id: int
    """
    Schema for creating a project, includes client_id to associate with a client.
    """

class Project(ProjectBase):
    id: int
    client_id: int
    created_at: datetime
    updated_at: datetime
    """
    Schema for project response, includes database fields (id, client_id, timestamps).
    """

    class Config:
        orm_mode = True
        """
        Enables Pydantic to convert SQLAlchemy ORM objects to JSON.
        """