import os
from pydantic_settings import BaseSettings
from typing import List

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEFAULT_DB_PATH = os.path.join(BASE_DIR, "edupulse.db").replace("\\", "/")

class Settings(BaseSettings):
    PROJECT_NAME: str = "EduPulse AI"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "edupulse-hackathon-super-secret-key-2026-secure-jwt")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours for hackathon demo
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(BASE_DIR, "uploads").replace("\\", "/"))
    
    # Configurable Risk Weights (must sum to 1.0)
    WEIGHT_ATTENDANCE: float = 0.25
    WEIGHT_ASSESSMENT: float = 0.35
    WEIGHT_ASSIGNMENT: float = 0.20
    WEIGHT_TREND: float = 0.20

    # Risk Display Bands
    # 0-29: Low concern, 30-59: Moderate concern, 60-79: High concern, 80-100: Urgent review
    BAND_LOW_MAX: float = 29.0
    BAND_MODERATE_MAX: float = 59.0
    BAND_HIGH_MAX: float = 79.0

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
