from typing import Dict, Any, List, Optional
from datetime import datetime
import json
from sqlalchemy.orm import Session
from app.models.models import (
    StudentProfile, AttendanceRecord, StudentAttempt, Submission, Assignment, RiskScoreSnapshot
)
from app.core.config import settings

def calculate_student_risk(student: StudentProfile, db: Session, save_snapshot: bool = True) -> Dict[str, Any]:
    """
    Transparent, auditable, configurable 4-factor risk calculation engine.
    Rule #01:
      1. Attendance concern (25%)
      2. Assessment performance concern (35%)
      3. Assignment completion concern (20%)
      4. Learning progress & trend concern (20%)
    """
    missing_signals: List[str] = []
    
    # 1. Attendance Signal
    attendance_records = db.query(AttendanceRecord).filter(AttendanceRecord.student_id == student.id).all()
    if not attendance_records:
        attendance_pct = 75.0
        missing_signals.append("No recorded attendance records")
        att_concern = 40.0
        att_raw = "No data"
        att_expl = "Attendance data unavailable; provisional baseline applied."
    else:
        total_classes = sum(r.total_classes for r in attendance_records)
        attended = sum(r.classes_attended for r in attendance_records)
        attendance_pct = (attended / total_classes * 100.0) if total_classes > 0 else 0.0
        att_raw = f"{attendance_pct:.1f}% ({attended}/{total_classes} classes)"
        
        if attendance_pct >= 85.0:
            att_concern = max(0.0, (100.0 - attendance_pct) * 0.6)
            att_expl = f"Regular attendance ({attendance_pct:.1f}%), well above institutional benchmark (75%)."
        elif attendance_pct >= 75.0:
            att_concern = 20.0 + (85.0 - attendance_pct) * 2.5
            att_expl = f"Attendance ({attendance_pct:.1f}%) is near minimum requirement (75%)."
        elif attendance_pct >= 60.0:
            att_concern = 50.0 + (75.0 - attendance_pct) * 2.0
            att_expl = f"Attendance ({attendance_pct:.1f}%) has fallen below 75% threshold."
        else:
            att_concern = min(100.0, 80.0 + (60.0 - attendance_pct) * 1.5)
            att_expl = f"Critical attendance deficit ({attendance_pct:.1f}%), severe risk of detention/arrears."

    # 2. Assessment Performance Signal
    attempts = db.query(StudentAttempt).filter(StudentAttempt.student_id == student.id).all()
    if not attempts:
        missing_signals.append("No assessment attempts recorded")
        assess_concern = 40.0
        assess_raw = "0 attempts"
        assess_expl = "No assessment history available yet."
    else:
        total_marks = sum(a.marks_obtained for a in attempts)
        max_marks = sum(a.question.max_marks for a in attempts if a.question)
        if max_marks == 0:
            max_marks = len(attempts) * 10.0
        assess_pct = (total_marks / max_marks * 100.0) if max_marks > 0 else 50.0
        assess_raw = f"{assess_pct:.1f}% avg across {len(attempts)} attempts"

        if assess_pct >= 80.0:
            assess_concern = max(0.0, (100.0 - assess_pct) * 0.5)
            assess_expl = f"Strong assessment performance ({assess_pct:.1f}% average)."
        elif assess_pct >= 60.0:
            assess_concern = 20.0 + (80.0 - assess_pct) * 1.8
            assess_expl = f"Moderate test scores ({assess_pct:.1f}%). Passing, but room for reinforcement."
        elif assess_pct >= 45.0:
            assess_concern = 56.0 + (60.0 - assess_pct) * 2.0
            assess_expl = f"Assessment average ({assess_pct:.1f}%) is in borderline pass/fail range."
        else:
            assess_concern = min(100.0, 86.0 + (45.0 - assess_pct) * 1.0)
            assess_expl = f"Assessment score average ({assess_pct:.1f}%) below passing mark (50%)."

    # 3. Assignment Completion Signal
    enrolled_course_ids = [e.course_id for e in student.enrollments]
    all_assignments = db.query(Assignment).filter(Assignment.course_id.in_(enrolled_course_ids)).all() if enrolled_course_ids else []
    submissions = db.query(Submission).filter(Submission.student_id == student.id).all()
    
    total_assignments_count = len(all_assignments)
    if total_assignments_count == 0:
        assign_concern = 15.0
        assign_raw = "No assignments due"
        assign_expl = "No active assignments currently assigned for enrolled courses."
    else:
        submitted_count = len(submissions)
        late_count = sum(1 for s in submissions if s.is_late)
        missing_count = max(0, total_assignments_count - submitted_count)
        completion_rate = (submitted_count / total_assignments_count) * 100.0
        assign_raw = f"{submitted_count}/{total_assignments_count} completed ({missing_count} missing, {late_count} late)"
        
        miss_penalty = (missing_count / total_assignments_count) * 80.0
        late_penalty = (late_count / total_assignments_count) * 20.0
        assign_concern = min(100.0, miss_penalty + late_penalty)
        
        if missing_count == 0 and late_count == 0:
            assign_expl = "All course assignments submitted on schedule."
        elif missing_count == 0:
            assign_expl = f"Completed all assignments, but {late_count} submitted past deadline."
        else:
            assign_expl = f"{missing_count} assignment(s) unsubmitted; potential loss of continuous assessment marks."

    # 4. Learning Trend Signal
    # Compute trend from recent attendance or sequential attempts
    declining_signals = 0
    stable_signals = 0
    improving_signals = 0

    for att in attendance_records:
        if att.recent_trend == "declining":
            declining_signals += 1
        elif att.recent_trend == "improving":
            improving_signals += 1
        else:
            stable_signals += 1

    if len(attempts) >= 4:
        recent_half = attempts[-len(attempts)//2:]
        older_half = attempts[:len(attempts)//2]
        recent_avg = sum(a.marks_obtained for a in recent_half) / (sum(a.question.max_marks for a in recent_half if a.question) or 1)
        older_avg = sum(a.marks_obtained for a in older_half) / (sum(a.question.max_marks for a in older_half if a.question) or 1)
        if recent_avg < older_avg - 0.10:
            declining_signals += 2
        elif recent_avg > older_avg + 0.10:
            improving_signals += 2

    if declining_signals > improving_signals:
        trend_concern = 75.0
        trend_raw = "Negative trajectory"
        trend_expl = "Recent performance and/or attendance demonstrates a downward velocity."
    elif improving_signals > declining_signals:
        trend_concern = 15.0
        trend_raw = "Upward trajectory"
        trend_expl = "Student shows steady improvement across recent test cycles."
    else:
        trend_concern = 35.0
        trend_raw = "Stable trajectory"
        trend_expl = "Consistent performance with minimal variance across recent weeks."

    # Weighted Sum Calculation
    w_att = settings.WEIGHT_ATTENDANCE
    w_assess = settings.WEIGHT_ASSESSMENT
    w_assign = settings.WEIGHT_ASSIGNMENT
    w_trend = settings.WEIGHT_TREND

    c_att_contrib = round(att_concern * w_att, 2)
    c_assess_contrib = round(assess_concern * w_assess, 2)
    c_assign_contrib = round(assign_concern * w_assign, 2)
    c_trend_contrib = round(trend_concern * w_trend, 2)

    overall_score = round(c_att_contrib + c_assess_contrib + c_assign_contrib + c_trend_contrib, 1)
    overall_score = max(0.0, min(100.0, overall_score))

    # Determine Display Band
    if overall_score <= settings.BAND_LOW_MAX:
        band = "Low concern"
    elif overall_score <= settings.BAND_MODERATE_MAX:
        band = "Moderate concern"
    elif overall_score <= settings.BAND_HIGH_MAX:
        band = "High concern"
    else:
        band = "Urgent review recommended"

    is_data_sufficient = len(missing_signals) == 0

    components = [
        {
            "name": "Attendance Concern",
            "raw_metric": att_raw,
            "concern_score": round(att_concern, 1),
            "weight": w_att,
            "weighted_contribution": c_att_contrib,
            "status_label": "High" if att_concern >= 60 else "Moderate" if att_concern >= 30 else "Low",
            "explanation": att_expl,
        },
        {
            "name": "Assessment Concern",
            "raw_metric": assess_raw,
            "concern_score": round(assess_concern, 1),
            "weight": w_assess,
            "weighted_contribution": c_assess_contrib,
            "status_label": "High" if assess_concern >= 60 else "Moderate" if assess_concern >= 30 else "Low",
            "explanation": assess_expl,
        },
        {
            "name": "Assignment Concern",
            "raw_metric": assign_raw,
            "concern_score": round(assign_concern, 1),
            "weight": w_assign,
            "weighted_contribution": c_assign_contrib,
            "status_label": "High" if assign_concern >= 60 else "Moderate" if assign_concern >= 30 else "Low",
            "explanation": assign_expl,
        },
        {
            "name": "Learning Trend Concern",
            "raw_metric": trend_raw,
            "concern_score": round(trend_concern, 1),
            "weight": w_trend,
            "weighted_contribution": c_trend_contrib,
            "status_label": "High" if trend_concern >= 60 else "Moderate" if trend_concern >= 30 else "Low",
            "explanation": trend_expl,
        },
    ]

    weights_dict = {
        "attendance": w_att,
        "assessment": w_assess,
        "assignment": w_assign,
        "trend": w_trend,
    }

    formula_str = (
        f"Overall Risk ({overall_score}) = Attendance ({att_concern:.1f} * {w_att}) "
        f"+ Assessment ({assess_concern:.1f} * {w_assess}) "
        f"+ Assignment ({assign_concern:.1f} * {w_assign}) "
        f"+ Trend ({trend_concern:.1f} * {w_trend})"
    )

    if save_snapshot:
        snapshot = RiskScoreSnapshot(
            student_id=student.id,
            overall_score=overall_score,
            band=band,
            attendance_concern=att_concern,
            assessment_concern=assess_concern,
            assignment_concern=assign_concern,
            trend_concern=trend_concern,
            weights_json=json.dumps(weights_dict),
            is_data_sufficient=is_data_sufficient,
            missing_signals_json=json.dumps(missing_signals),
            calculated_at=datetime.utcnow()
        )
        db.add(snapshot)
        db.commit()

    return {
        "student_id": student.id,
        "roll_number": student.roll_number,
        "full_name": student.user.full_name if student.user else "Student",
        "overall_score": overall_score,
        "band": band,
        "is_data_sufficient": is_data_sufficient,
        "missing_signals": missing_signals,
        "components": components,
        "weights": weights_dict,
        "formula_explanation": formula_str,
        "calculated_at": datetime.utcnow(),
        "latest_data_date": datetime.utcnow().strftime("%Y-%m-%d"),
    }
