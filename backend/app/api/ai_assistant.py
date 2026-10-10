from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, StudentProfile, Concept, Course
from app.schemas.schemas import (
    AIChatRequest, AIChatResponse, StudyPlanRequest, StudyPlanResponse
)
from app.services.ai_service import ai_service

router = APIRouter(prefix="/ai", tags=["AI Learning Assistant"])

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_tutor(
    request: AIChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI Learning Assistant grounded in authorized course materials.
    Seamless live Gemini API integration with graceful deterministic fallback.
    """
    student_ctx = None
    if current_user.role == "student" and current_user.student_profile:
        sp = current_user.student_profile
        course_names = [e.course.title for e in sp.enrollments if e.course]
        student_ctx = {
            "course": ", ".join(course_names) if course_names else "Computer Science",
            "concept": "Core Syllabus"
        }
    elif request.student_id:
        sp = db.query(StudentProfile).filter(StudentProfile.id == request.student_id).first()
        if sp:
            course_names = [e.course.title for e in sp.enrollments if e.course]
            student_ctx = {
                "course": ", ".join(course_names) if course_names else "Computer Science",
                "concept": "Targeted Concepts"
            }

    response_data = await ai_service.chat(
        user_message=request.message,
        student_context=student_ctx
    )
    return response_data

@router.post("/study-plan", response_model=StudyPlanResponse)
async def generate_study_plan(
    request: StudyPlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates personalized study plan from a selected concept gap."""
    concept = db.query(Concept).filter(Concept.id == request.concept_id).first()
    concept_name = concept.name if concept else "Foundational Programming"

    res = await ai_service.generate_study_plan(
        concept_name=concept_name,
        baseline_accuracy=30.0
    )
    return res
