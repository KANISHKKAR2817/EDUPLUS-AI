import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models.models import User
from app.api import (
    auth, students, interventions, knowledge_graph, risk_engine,
    ai_assistant, study_materials, assignments, courses,
    assessments, reports, import_export, admin
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    Base.metadata.create_all(bind=engine)
    
    # Check if database is empty; if so, run auto seed
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            print("Database is empty, automatically seeding initial demo dataset...")
            from seed import seed_all_data
            seed_all_data()
            print("Demo dataset seeded successfully!")
    except Exception as e:
        print(f"Error checking/seeding database: {e}")
    finally:
        db.close()
    
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Student Performance Analysis & Early Intervention System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
api_v1 = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1)
app.include_router(students.router, prefix=api_v1)
app.include_router(interventions.router, prefix=api_v1)
app.include_router(knowledge_graph.router, prefix=api_v1)
app.include_router(risk_engine.router, prefix=api_v1)
app.include_router(ai_assistant.router, prefix=api_v1)
app.include_router(study_materials.router, prefix=api_v1)
app.include_router(assignments.router, prefix=api_v1)
app.include_router(courses.router, prefix=api_v1)
app.include_router(assessments.router, prefix=api_v1)
app.include_router(reports.router, prefix=api_v1)
app.include_router(import_export.router, prefix=api_v1)
app.include_router(admin.router, prefix=api_v1)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "Online",
        "documentation": "/docs",
        "message": "EduPulse AI Academic Early Intervention System Operational"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "sqlite_connected",
        "gemini_api_configured": bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here")
    }
