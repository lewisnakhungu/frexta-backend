from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.authy import router as auth_router
from app.api.users import router as users_router
from app.api.clients import router as clients_router
from app.api.projects import router as projects_router
from app.api.payments import router as payments_router
from app.api.notes import router as notes_router
from app.api.dashboard import router as dashboard_router

from app.core.database import Base, engine

app = FastAPI(
    title="ClientConnect",
    version="1.0.0",
    description="API for managing clients, projects, payments, and notes",
    openapi_url="/api/openapi.json"
)

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Serve static frontend files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Redirect root to index.html
@app.get("/", include_in_schema=False)
async def serve_frontend():
    return FileResponse("static/index.html")


#  Async-compatible table creation
@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Routers
app.include_router(auth_router, prefix="/api", tags=["auth"])
app.include_router(users_router, prefix="/api", tags=["users"])
app.include_router(clients_router, prefix="/api", tags=["clients"])
app.include_router(projects_router, prefix="/api", tags=["projects"])
app.include_router(payments_router, prefix="/api", tags=["payments"])
app.include_router(notes_router, prefix="/api", tags=["notes"])
app.include_router(dashboard_router, prefix="/api", tags=["dashboard"])

