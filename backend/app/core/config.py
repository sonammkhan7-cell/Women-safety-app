import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Women Safety Guardian API"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-default-key-for-women-safety-guardian-2026")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./women_safety.db")
    
    # API Keys (optional; mocked if empty)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "")
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")

    class Config:
        case_sensitive = True

settings = Settings()
