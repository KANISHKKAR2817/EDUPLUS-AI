import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db, Base, engine
from app.core.security import require_roles
from app.models.models import (
    User, StudentProfile, TeacherProfile, Course, Concept,
    Assessment, Question, StudentAttempt, AttendanceRecord,
    Assignment, Submission, LearningMaterial, Intervention,
    RiskScoreSnapshot, AlertReview, AuditLog
)
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/admin", tags=["System Administration"])

@router.get("/stats")
def get_system_stats(
    current_user: User = Depends(require_roles(["admin", "teacher"])),
    db: Session = Depends(get_db)
):
    """System operational metrics and record counts."""
    return {
        "total_users": db.query(User).count(),
        "total_students": db.query(StudentProfile).count(),
        "total_teachers": db.query(TeacherProfile).count(),
        "total_courses": db.query(Course).count(),
        "total_concepts": db.query(Concept).count(),
        "total_assessments": db.query(Assessment).count(),
        "total_attempts": db.query(StudentAttempt).count(),
        "total_attendance_records": db.query(AttendanceRecord).count(),
        "total_assignments": db.query(Assignment).count(),
        "total_submissions": db.query(Submission).count(),
        "total_interventions": db.query(Intervention).count(),
        "total_audit_logs": db.query(AuditLog).count(),
        "database_type": "SQLite Persistent Hackathon Engine",
        "system_status": "Healthy & Operational"
    }

@router.post("/reset-demo-data")
def reset_demo_data(
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """
    Resets the database and re-seeds with realistic synthetic student cohort data.
    """
    from seed import seed_all_data
    # Recreate tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    # Seed
    seed_all_data()

    log_audit_event(
        db=db,
        action="DATABASE_RESET_AND_RESEEDED",
        actor=current_user,
        target_type="System",
        details="Admin triggered complete database reset and loaded synthetic dataset."
    )

    return {
        "status": "success",
        "message": "EduPulse AI database reset and re-seeded with 35 students, 4 courses, and full relationships!"
    }
