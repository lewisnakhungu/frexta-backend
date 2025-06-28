from datetime import datetime
from typing import List

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Enum as SqlEnum
from ..core.database import Base
import enum


class ProjectStatus(str, enum.Enum):
    PENDING = "Pending"
    ACTIVE = "Active"
    COMPLETED = "Completed"


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(nullable=False)
    description: Mapped[str] = mapped_column(nullable=False)
    status: Mapped[ProjectStatus] = mapped_column(SqlEnum(ProjectStatus), default=ProjectStatus.PENDING)
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id"))
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    client: Mapped["Client"] = relationship(back_populates="projects")
    payments: Mapped[List["Payment"]] = relationship(back_populates="project")
    notes: Mapped[List["Note"]] = relationship(back_populates="project")
