from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True

class ClientCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None

class ClientResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    user_id: int

    class Config:
        from_attributes = True

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    client_id: int

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    client_id: int
    user_id: int

    class Config:
        from_attributes = True

class PaymentCreate(BaseModel):
    amount: float
    project_id: int

class PaymentResponse(BaseModel):
    id: int
    amount: float
    project_id: int
    user_id: int

    class Config:
        from_attributes = True

class NoteCreate(BaseModel):
    content: str

class NoteResponse(BaseModel):
    id: int
    content: str
    client_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class KpiValue(BaseModel):
    value: float
    change: str

class KpiData(BaseModel):
    activeClients: KpiValue
    projectsInProgress: KpiValue
    revenueThisMonth: KpiValue
    pendingTasks: KpiValue

    class Config:
        from_attributes = True

class ActivitySchema(BaseModel):
    person: str
    action: str
    target: str
    time: datetime

    class Config:
        from_attributes = True