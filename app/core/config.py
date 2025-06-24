from pydantic import BaseSettings

class Settings(BaseSettings):
    PROJECT-NAME: str = "frexta-backend"
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()