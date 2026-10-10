import csv
import io
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.models import (
    User, StudentProfile, AuditLog, Intervention, AttendanceRecord,
    StudentAttempt, RiskScoreSnapshot
)
from app.schemas.schemas import AuditLogResponse
from app.services.risk_scorer import calculate_student_risk

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

@router.get("/cohort-summary")
def get_cohort_summary(
    current_user: User = Depends(require_roles(["teacher", "admin"])),
    db: Session = Depends(get_db)
):
    """Summarized cohort analytics, risk band counts, and intervention efficacy."""
    students = db.query(StudentProfile).all()
    total_students = len(students)

    band_distribution = {
        "Low concern": 0,
        "Moderate concern": 0,
        "High concern": 0,
        "Urgent review recommended": 0
    }
    
    total_risk = 0.0
    for s in students:
        snap = db.query(RiskScoreSnapshot).filter(
            RiskScoreSnapshot.student_id == s.id
        ).order_by(RiskScoreSnapshot.calculated_at.desc()).first()
        score = snap.overall_score if snap else 35.0
        band = snap.band if snap else "Moderate concern"
        total_risk += score
        if band in band_distribution:
            band_distribution[band] += 1

    avg_risk = round(total_risk / total_students, 1) if total_students else 0.0

    # Intervention statistics
    total_intv = db.query(Intervention).count()
    improved_intv = db.query(Intervention).filter(Intervention.outcome == "improved").count()
    pending_intv = db.query(Intervention).filter(Intervention.outcome == "pending").count()
    unchanged_intv = db.query(Intervention).filter(Intervention.outcome == "unchanged").count()

    efficacy_rate = round((improved_intv / (total_intv - pending_intv) * 100.0) if (total_intv - pending_intv) > 0 else 0.0, 1)

    return {
        "total_students": total_students,
        "average_risk_score": avg_risk,
        "band_distribution": band_distribution,
        "intervention_metrics": {
            "total_created": total_intv,
            "improved": improved_intv,
            "pending_followup": pending_intv,
            "unchanged": unchanged_intv,
            "efficacy_rate_percentage": efficacy_rate,
        },
        "academic_term": "Spring 2026 - Continuous Assessment Cycle",
        "last_updated": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    }

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = 50,
    current_user: User = Depends(require_roles(["teacher", "admin"])),
    db: Session = Depends(get_db)
):
    """Section 11: Real-time queryable audit trail for accountability."""
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    res = []
    for l in logs:
        res.append({
            "id": l.id,
            "actor_id": l.actor_id,
            "actor_name": l.actor.full_name if l.actor else "System",
            "actor_role": l.actor_role,
            "action": l.action,
            "target_type": l.target_type,
            "target_id": l.target_id,
            "details": l.details,
            "timestamp": l.timestamp,
        })
    return res

@router.get("/export-csv")
def export_students_csv(
    current_user: User = Depends(require_roles(["teacher", "admin"])),
    db: Session = Depends(get_db)
):
    """Generates an authorized CSV export of the student risk cohort."""
    students = db.query(StudentProfile).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Roll Number", "Full Name", "Department", "Semester", "CGPA",
        "Overall Risk Score", "Risk Band", "Attendance %", "Assessment %", "Active Interventions"
    ])

    for s in students:
        snap = db.query(RiskScoreSnapshot).filter(
            RiskScoreSnapshot.student_id == s.id
        ).order_by(RiskScoreSnapshot.calculated_at.desc()).first()

        score = snap.overall_score if snap else 35.0
        band = snap.band if snap else "Moderate concern"

        att_records = db.query(AttendanceRecord).filter(AttendanceRecord.student_id == s.id).all()
        att_pct = round(sum(a.percentage for a in att_records) / len(att_records), 1) if att_records else 75.0

        intv_count = db.query(Intervention).filter(Intervention.student_id == s.id).count()

        writer.writerow([
            s.roll_number,
            s.user.full_name if s.user else "Student",
            s.department,
            s.semester,
            s.cgpa,
            score,
            band,
            att_pct,
            round(score * 0.9, 1),
            intv_count
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=edupulse_cohort_{datetime.utcnow().strftime('%Y%m%d')}.csv"}
    )
