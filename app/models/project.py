from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum as SqlEnum
from sqlalchemy.orm import relationship
from ..core.database import Base
from datetime import datetime
import enum

class ProjectStatus(str, enum.Enum):
    PENDING = "Pending"
    ACTIVE = "Active"
    COMPLETED = "Completed"

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    status = Column(SqlEnum(ProjectStatus), default=ProjectStatus.PENDING)
    client_id = Column(Integer, ForeignKey("clients.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    client = relationship("Client", back_populates="projects")
    payments = relationship("Payment", back_populates="project")
    notes = relationship("Note", back_populates="project")
