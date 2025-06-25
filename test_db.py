# test_db.py
from sqlalchemy import create_engine
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
with engine.connect() as connection:
    print("Connection successful!")