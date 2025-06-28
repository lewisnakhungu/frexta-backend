from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from sqlalchemy.sql import extract
from datetime import datetime
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.client import Client
from app.models.user import User
from app.models.payment import Payment
from app.models.project import Project
from app.schemas.dashboard import (
    PaymentCreate,
    PaymentResponse,
    KpiData,
    KpiValue,
    ActivitySchema,
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/kpis", response_model=KpiData)
async def get_dashboard_kpis(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve Key Performance Indicators for the dashboard.
    """
    result = await db.execute(select(func.count(Client.id)))
    active_clients_count = result.scalar() or 0

    result = await db.execute(select(func.count(Project.id)).where(Project.status == 'Active'))
    projects_in_progress_count = result.scalar() or 0

    result = await db.execute(select(func.count(Project.id)).where(Project.status == 'Pending'))
    pending_tasks_count = result.scalar() or 0

    now = datetime.utcnow()
    result = await db.execute(
        select(func.sum(Payment.amount)).where(
            extract('month', Payment.date_paid) == now.month,
            extract('year', Payment.date_paid) == now.year,
        )
    )
    revenue_this_month = result.scalar() or 0.0

    return KpiData(
        activeClients=KpiValue(value=active_clients_count, change="+0"),
        projectsInProgress=KpiValue(value=projects_in_progress_count, change="+0"),
        revenueThisMonth=KpiValue(value=revenue_this_month, change="+0%"),
        pendingTasks=KpiValue(value=pending_tasks_count, change="+0"),
    )

@router.get("/activities", response_model=List[ActivitySchema])
async def get_dashboard_activities(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve a feed of recent activities.
    """
    result = await db.execute(
        select(Client).order_by(Client.created_at.desc()).limit(5)
    )
    recent_clients = result.scalars().all()

    result = await db.execute(
        select(Project)
        .where(Project.status == 'Completed')
        .order_by(Project.updated_at.desc())
        .limit(5)
    )
    completed_projects = result.scalars().all()

    client_activities = [
        ActivitySchema(
            person='System',
            action='added client',
            target=c.name,
            time=c.created_at,
        )
        for c in recent_clients
    ]

    project_activities = [
        ActivitySchema(
            person='System',
            action='completed project',
            target=p.name,
            time=p.updated_at,
        )
        for p in completed_projects
    ]

    all_activities = sorted(
        client_activities + project_activities, key=lambda x: x.time, reverse=True
    )
    return all_activities[:5]
