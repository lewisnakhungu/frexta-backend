from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from models.project import ProjectStatus

class ProjectCreate(BaseModel):
    name : str
    description : str
    

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    


class ProjectRead(BaseModel):
    id:int
    name: str
    description: str
    status: ProjectStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
