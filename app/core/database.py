from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings


SQLALCHEMY_DATABSE_URL = settings.DATABASE_URL
engine =create_engine(SQLALCHEMY_DATABSE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
# will chang e to asyn for faster speeds
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
