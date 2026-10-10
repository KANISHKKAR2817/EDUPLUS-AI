from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user
from app.models.models import User, StudentProfile, RiskScoreSnapshot
from app.schemas.schemas import GlobalExplanationResponse
from app.services.risk_scorer import calculate_student_risk

router = APIRouter(prefix="/risk-engine", tags=["Risk Engine & Explainability"])

@router.get("/global-explanation", response_model=GlobalExplanationResponse)
def get_global_explanation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Rule #03: Global model explainability, weights, thresholds, and cohort distribution.
    """
    # Evaluate cohort distribution across students
    all_students = db.query(StudentProfile).all()
    band_counts = {
        "Low concern": 0,
        "Moderate concern": 0,
        "High concern": 0,
        "Urgent review recommended": 0
    }

    for s in all_students:
        latest = db.query(RiskScoreSnapshot).filter(
            RiskScoreSnapshot.student_id == s.id
        ).order_by(RiskScoreSnapshot.calculated_at.desc()).first()

        if latest:
            b = latest.band
        else:
            calc = calculate_student_risk(s, db, save_snapshot=False)
            b = calc["band"]

        if b in band_counts:
            band_counts[b] += 1
        else:
            band_counts["Moderate concern"] += 1

    weights = {
        "attendance": settings.WEIGHT_ATTENDANCE,
        "assessment": settings.WEIGHT_ASSESSMENT,
        "assignment": settings.WEIGHT_ASSIGNMENT,
        "trend": settings.WEIGHT_TREND,
    }

    bands = [
        {"range": "0 – 29", "band": "Low concern", "action": "Standard continuous monitoring", "color": "emerald"},
        {"range": "30 – 59", "band": "Moderate concern", "action": "Targeted practice & mentor check-in", "color": "amber"},
        {"range": "60 – 79", "band": "High concern", "action": "Active intervention & faculty consultation", "color": "orange"},
        {"range": "80 – 100", "band": "Urgent review recommended", "action": "Urgent review by HOD/Faculty committee", "color": "rose"},
    ]

    safeguards = [
        "Auditable Formula: All concern factors produce 0–100 scores multiplied by configured weights.",
        "No Autonomous Penalty: Risk scores serve strictly as faculty decision-support flags.",
        "Missing Data Safeguard: Partial records flag 'Insufficient Data' rather than penalizing students.",
        "Teacher Review & Override: Teachers can confirm, edit, or dismiss alerts with documented justification.",
        "No Sensitive Personal Attributes: Family income, disability, gender, and caste are strictly excluded."
    ]

    return {
        "formula_name": "EduPulse Multi-Signal Academic Health Index (v1.0)",
        "formula_string": "Risk Score = (0.25 × Attendance) + (0.35 × Assessment) + (0.20 × Assignment) + (0.20 × Trend)",
        "component_weights": weights,
        "band_definitions": bands,
        "total_students_evaluated": len(all_students),
        "band_distribution": band_counts,
        "safeguards_and_limitations": safeguards,
        "disclaimer": (
            "Disclaimer: EduPulse AI risk scores are demonstrative decision-support estimates. "
            "They do not guarantee or predict future university examination outcomes with certainty."
        ),
    }
