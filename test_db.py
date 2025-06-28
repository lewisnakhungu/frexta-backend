# test_db.py
import asyncio
from app.core.database import engine
from app.core.database import Base  # or wherever you define Base

async def test_connection():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Connection successful and tables created.")

if __name__ == "__main__":
    asyncio.run(test_connection())
