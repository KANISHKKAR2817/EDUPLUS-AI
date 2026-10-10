import pytest
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.models import StudentProfile
from app.services.risk_scorer import calculate_student_risk
from app.core.config import settings

def test_risk_weights_sum_to_one():
    total_weights = (
        settings.WEIGHT_ATTENDANCE +
        settings.WEIGHT_ASSESSMENT +
        settings.WEIGHT_ASSIGNMENT +
        settings.WEIGHT_TREND
    )
    assert abs(total_weights - 1.0) < 0.0001, "Risk weights must sum up to exactly 1.0"

def test_risk_calculation_for_seeded_student():
    db = SessionLocal()
    try:
        # Fetch Arun Kumar (Flagged student)
        arun = db.query(StudentProfile).filter(StudentProfile.roll_number == "22CS101").first()
        assert arun is not None, "Seeded student 22CS101 should exist"

        result = calculate_student_risk(arun, db, save_snapshot=False)
        
        # Verify output keys
        assert "overall_score" in result
        assert "band" in result
        assert "components" in result
        assert len(result["components"]) == 4

        # Arun has low attendance and 0 test score on UT1, so overall score must be high concern
        assert result["overall_score"] >= 50.0, f"Arun Kumar expected high/moderate concern, got {result['overall_score']}"
        assert result["band"] in ["Moderate concern", "High concern", "Urgent review recommended"]

        # Verify component structure
        for comp in result["components"]:
            assert "name" in comp
            assert "concern_score" in comp
            assert "weight" in comp
            assert "weighted_contribution" in comp
            assert 0.0 <= comp["concern_score"] <= 100.0

    finally:
        db.close()

def test_high_performing_student_risk_band():
    db = SessionLocal()
    try:
        # Deepa Sundaram (High achiever)
        deepa = db.query(StudentProfile).filter(StudentProfile.roll_number == "22CS102").first()
        assert deepa is not None

        result = calculate_student_risk(deepa, db, save_snapshot=False)
        assert result["overall_score"] <= 35.0, f"Deepa should have low concern, got {result['overall_score']}"
        assert result["band"] in ["Low concern", "Moderate concern"]
    finally:
        db.close()
