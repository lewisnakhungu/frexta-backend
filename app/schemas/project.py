from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class ProjectStatus(str, Enum):
    PENDING = "Pending"
    ACTIVE = "Active"
    COMPLETED = "Completed"
    """
    Enum for project status. Allowed values:
    - Pending
    - Active
    - Completed
    """

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.PENDING
    """
    Base schema for project with:
    - name (required)
    - description (optional)
    - status (optional, defaults to 'Pending')
    """

class ProjectCreate(ProjectBase):
    client_id: int
    """
    Schema for creating a project.
    Requires:
    - all fields from ProjectBase
    - client_id (int): ID of the client the project is associated with
    """

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    client_id: Optional[int] = None
    """
    Schema for updating a project.
    All fields are optional for partial updates:
    - name
    - description
    - status
    - client_id
    """

class Project(ProjectBase):
    id: int
    client_id: int
    created_at: datetime
    updated_at: datetime
    """
    Schema for returning a project from the API.
    Includes:
    - all fields from ProjectBase
    - id (project ID)
    - client_id
    - created_at
    - updated_at
    """

    class Config:
        orm_mode = True
        """
        Enable compatibility with SQLAlchemy ORM objects.
        """
