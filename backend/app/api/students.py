from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.models import (
    User, StudentProfile, Course, AttendanceRecord, StudentAttempt,
    Question, QuestionConcept, Concept, Assignment, Submission,
    RiskScoreSnapshot, Intervention
)
from app.schemas.schemas import (
    StudentSummaryResponse, ConceptMastery, RiskScoreResponse, WhyFlaggedResponse
)
from app.services.risk_scorer import calculate_student_risk
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("", response_model=List[StudentSummaryResponse])
def get_students(
    search: Optional[str] = None,
    risk_band: Optional[str] = None,
    course_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve student directory with summarized risk metrics. Enforces RBAC."""
    if current_user.role == "student":
        # Students can ONLY access their own record
        if not current_user.student_profile:
            return []
        students = [current_user.student_profile]
    else:
        query = db.query(StudentProfile).join(User, StudentProfile.user_id == User.id)
        if search:
            search_fmt = f"%{search}%"
            query = query.filter(
                (User.full_name.ilike(search_fmt)) |
                (StudentProfile.roll_number.ilike(search_fmt)) |
                (StudentProfile.department.ilike(search_fmt))
            )
        if course_id:
            query = query.filter(StudentProfile.enrollments.any(course_id=course_id))
        students = query.all()

    result = []
    for s in students:
        # Latest risk snapshot or calculate on the fly
        latest_snap = db.query(RiskScoreSnapshot).filter(
            RiskScoreSnapshot.student_id == s.id
        ).order_by(RiskScoreSnapshot.calculated_at.desc()).first()

        if not latest_snap:
            calc = calculate_student_risk(s, db, save_snapshot=True)
            ovr_risk = calc["overall_score"]
            band = calc["band"]
        else:
            ovr_risk = latest_snap.overall_score
            band = latest_snap.band

        if risk_band and band != risk_band:
            continue

        # Attendance Avg
        att_records = db.query(AttendanceRecord).filter(AttendanceRecord.student_id == s.id).all()
        att_avg = (sum(a.percentage for a in att_records) / len(att_records)) if att_records else 75.0

        # Assessment Avg
        attempts = db.query(StudentAttempt).filter(StudentAttempt.student_id == s.id).all()
        tot_m = sum(a.marks_obtained for a in attempts)
        max_m = sum(a.question.max_marks for a in attempts if a.question)
        assess_avg = (tot_m / max_m * 100.0) if max_m > 0 else 50.0

        # Submissions
        enrolled_cids = [e.course_id for e in s.enrollments]
        tot_assign = db.query(Assignment).filter(Assignment.course_id.in_(enrolled_cids)).count() if enrolled_cids else 0
        tot_sub = db.query(Submission).filter(Submission.student_id == s.id).count()
        assign_rate = (tot_sub / tot_assign * 100.0) if tot_assign > 0 else 100.0

        # Interventions count
        active_intv = db.query(Intervention).filter(
            Intervention.student_id == s.id,
            Intervention.status.in_(["assigned", "in_progress", "recommended"])
        ).count()

        result.append({
            "id": s.id,
            "user_id": s.user_id,
            "full_name": s.user.full_name if s.user else "Unknown",
            "roll_number": s.roll_number,
            "department": s.department,
            "semester": s.semester,
            "cgpa": s.cgpa,
            "overall_risk": ovr_risk,
            "risk_band": band,
            "attendance_avg": round(att_avg, 1),
            "assessment_avg": round(assess_avg, 1),
            "assignment_completion_rate": round(assign_rate, 1),
            "flagged_concepts_count": 2 if ovr_risk > 50 else 0,
            "active_interventions_count": active_intv,
        })

    return result

@router.get("/{student_id}")
def get_student_detail(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deep student drill-down with auditable factors, attendance, attempts, and enrollment."""
    # RBAC Ownership Check
    if current_user.role == "student":
        if not current_user.student_profile or current_user.student_profile.id != student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: students can only access their own records.",
            )

    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    risk_data = calculate_student_risk(student, db, save_snapshot=False)

    # Attendance records
    att_records = db.query(AttendanceRecord).filter(AttendanceRecord.student_id == student_id).all()
    attendance_list = [
        {
            "id": a.id,
            "course_id": a.course_id,
            "course_code": a.course.code if a.course else "",
            "course_title": a.course.title if a.course else "",
            "total_classes": a.total_classes,
            "classes_attended": a.classes_attended,
            "percentage": a.percentage,
            "recent_trend": a.recent_trend,
            "date_recorded": a.date_recorded.isoformat(),
        }
        for a in att_records
    ]

    # Attempts
    attempts = db.query(StudentAttempt).filter(StudentAttempt.student_id == student_id).all()
    attempts_list = [
        {
            "id": att.id,
            "assessment_id": att.assessment_id,
            "assessment_title": att.assessment.title if att.assessment else "",
            "question_id": att.question_id,
            "question_text": att.question.question_text if att.question else "",
            "marks_obtained": att.marks_obtained,
            "max_marks": att.question.max_marks if att.question else 10.0,
            "is_correct": att.is_correct,
            "student_answer": att.student_answer,
            "timestamp": att.timestamp.isoformat(),
        }
        for att in attempts
    ]

    # Interventions
    interventions = db.query(Intervention).filter(Intervention.student_id == student_id).all()
    intervention_list = [
        {
            "id": i.id,
            "title": i.title,
            "concept_name": i.concept.name if i.concept else "General",
            "baseline_accuracy": i.baseline_accuracy,
            "follow_up_accuracy": i.follow_up_accuracy,
            "status": i.status,
            "outcome": i.outcome,
            "recommended_action": i.recommended_action,
            "follow_up_task": i.follow_up_task,
            "created_at": i.created_at.isoformat(),
        }
        for i in interventions
    ]

    return {
        "id": student.id,
        "roll_number": student.roll_number,
        "full_name": student.user.full_name if student.user else "Student",
        "email": student.user.email if student.user else "",
        "department": student.department,
        "semester": student.semester,
        "cgpa": student.cgpa,
        "risk_summary": risk_data,
        "attendance": attendance_list,
        "attempts": attempts_list,
        "interventions": intervention_list,
    }

@router.get("/{student_id}/concept-mastery", response_model=List[ConceptMastery])
def get_concept_mastery(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Rule #04: Concept-level performance and learning gap identification."""
    if current_user.role == "student":
        if not current_user.student_profile or current_user.student_profile.id != student_id:
            raise HTTPException(status_code=403, detail="Access denied")

    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    enrolled_cids = [e.course_id for e in student.enrollments]
    concepts = db.query(Concept).filter(Concept.course_id.in_(enrolled_cids)).all() if enrolled_cids else []

    mastery_list = []
    for conc in concepts:
        # Find all questions linked to this concept
        q_ids = [qc.question_id for qc in conc.question_links]
        if not q_ids:
            continue

        attempts = db.query(StudentAttempt).filter(
            StudentAttempt.student_id == student_id,
            StudentAttempt.question_id.in_(q_ids)
        ).all()

        total_att = len(attempts)
        correct_att = sum(1 for a in attempts if a.is_correct)
        acc_pct = (correct_att / total_att * 100.0) if total_att > 0 else 0.0

        if total_att == 0:
            suff = "Insufficient Data"
            rec_action = "Attempt diagnostic questions to evaluate baseline."
            needs_intv = False
            recent = "No attempts"
        elif total_att < 3:
            suff = "Emerging"
            needs_intv = acc_pct < 60.0
            recent = "Limited attempts"
            rec_action = f"Complete additional practice on {conc.name}."
        else:
            suff = "Sufficient"
            needs_intv = acc_pct < 60.0
            recent = "Weak" if acc_pct < 50 else "Adequate" if acc_pct < 75 else "Mastered"
            rec_action = (
                f"Review foundational slides for {conc.name} and complete 5 targeted practice problems."
                if needs_intv else "Concept well understood; proceed to advanced topics."
            )

        mastery_list.append({
            "concept_id": conc.id,
            "concept_name": conc.name,
            "course_code": conc.course.code if conc.course else "",
            "course_title": conc.course.title if conc.course else "",
            "total_attempts": total_att,
            "correct_attempts": correct_att,
            "accuracy_percentage": round(acc_pct, 1),
            "recent_performance": recent,
            "data_sufficiency": suff,
            "needs_intervention": needs_intv,
            "recommended_action": rec_action,
        })

    return mastery_list

@router.post("/{student_id}/recalculate-risk", response_model=RiskScoreResponse)
def recalculate_risk(
    student_id: int,
    current_user: User = Depends(require_roles(["teacher", "admin"])),
    db: Session = Depends(get_db)
):
    """Allows authorized faculty to recalculate and persist an updated risk snapshot."""
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    updated_calc = calculate_student_risk(student, db, save_snapshot=True)

    log_audit_event(
        db=db,
        action="RISK_SCORE_RECALCULATED",
        actor=current_user,
        target_type="StudentProfile",
        target_id=student.id,
        details=f"Faculty recalculation. New score: {updated_calc['overall_score']}, Band: {updated_calc['band']}"
    )

    return updated_calc

@router.get("/{student_id}/why-flagged", response_model=WhyFlaggedResponse)
def get_why_flagged(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Rule #01 / Rule #03: Interactive explanation of contributing factors and drivers."""
    if current_user.role == "student":
        if not current_user.student_profile or current_user.student_profile.id != student_id:
            raise HTTPException(status_code=403, detail="Access denied")

    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    risk_info = calculate_student_risk(student, db, save_snapshot=False)

    drivers = []
    for c in risk_info["components"]:
        if c["concern_score"] >= 50.0:
            drivers.append(f"{c['name']} contributed {c['weighted_contribution']} pts ({c['explanation']})")

    if not drivers:
        drivers.append("All academic markers are currently within standard performance thresholds.")

    steps = [
        "Schedule brief check-in during faculty consultation hours.",
        "Review targeted practice problems in flagged concept modules.",
        "Ensure all upcoming lab assignments are submitted before deadline.",
    ]

    return {
        "student_id": student.id,
        "roll_number": student.roll_number,
        "full_name": student.user.full_name if student.user else "Student",
        "overall_score": risk_info["overall_score"],
        "band": risk_info["band"],
        "key_drivers": drivers,
        "contributing_factors": risk_info["components"],
        "suggested_next_steps": steps,
        "disclaimer": (
            "EduPulse AI risk scores are decision-support indicators, NOT definitive academic outcomes or final grades. "
            "Scores are calculated using transparent prototype rule formulas and must be evaluated with faculty judgment."
        ),
    }
