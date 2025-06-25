from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, users, clients, projects, payments, notes
from app.core.database import Base, engine
from fastapi.responses import RedirectResponse

app = FastAPI(
    title="ClientConnect",
    version="1.0.0",
    description="API for managing clients, projects, payments, and notes",
    openapi_url="/api/openapi.json"
)

# CORS settings — adjust as needed for deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend dev URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create all tables
Base.metadata.create_all(bind=engine)

# Include all routers
app.include_router(auth)
app.include_router(users)
app.include_router(clients)
app.include_router(projects)
app.include_router(payments)
app.include_router(notes)

#doc 
@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")