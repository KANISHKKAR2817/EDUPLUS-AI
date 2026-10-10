from typing import List, Optional
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Assessment, Question, User, StudentAttempt

router = APIRouter(prefix="/assessments", tags=["Assessments & Question Mapping"])

@router.get("")
def get_assessments(
    course_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Assessment)
    if course_id:
        query = query.filter(Assessment.course_id == course_id)
    items = query.order_by(Assessment.date_conducted.desc()).all()

    res = []
    for a in items:
        # Question details
        q_list = []
        for q in a.questions:
            concepts = [qc.concept.name for qc in q.concept_links if qc.concept]
            attempts = db.query(StudentAttempt).filter(StudentAttempt.question_id == q.id).all()
            correct = sum(1 for att in attempts if att.is_correct)
            acc = round((correct / len(attempts) * 100.0) if attempts else 0.0, 1)

            q_list.append({
                "id": q.id,
                "question_text": q.question_text,
                "question_type": q.question_type,
                "max_marks": q.max_marks,
                "concepts": concepts,
                "total_attempts": len(attempts),
                "cohort_accuracy": acc,
            })

        res.append({
            "id": a.id,
            "course_id": a.course_id,
            "course_code": a.course.code if a.course else "",
            "course_title": a.course.title if a.course else "",
            "title": a.title,
            "assessment_type": a.assessment_type,
            "max_marks": a.max_marks,
            "passing_marks": a.passing_marks,
            "date_conducted": a.date_conducted.isoformat(),
            "questions": q_list,
        })
    return res
