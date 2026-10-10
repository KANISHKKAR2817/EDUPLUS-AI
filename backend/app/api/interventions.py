from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.models import (
    User, StudentProfile, Intervention, AlertReview, Concept, Course
)
from app.schemas.schemas import (
    InterventionCreate, InterventionUpdate, InterventionResponse,
    AlertReviewCreate, AlertReviewResponse
)
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/interventions", tags=["Interventions"])

@router.get("", response_model=List[InterventionResponse])
def get_interventions(
    student_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List interventions. Role-checked."""
    query = db.query(Intervention)
    if current_user.role == "student":
        if not current_user.student_profile:
            return []
        query = query.filter(Intervention.student_id == current_user.student_profile.id)
    elif student_id:
        query = query.filter(Intervention.student_id == student_id)

    if status_filter:
        query = query.filter(Intervention.status == status_filter)

    items = query.order_by(Intervention.created_at.desc()).all()
    res = []
    for i in items:
        res.append({
            "id": i.id,
            "student_id": i.student_id,
            "student_name": i.student.user.full_name if i.student and i.student.user else "Student",
            "roll_number": i.student.roll_number if i.student else "",
            "concept_id": i.concept_id,
            "concept_name": i.concept.name if i.concept else "General Academic Support",
            "course_id": i.course_id,
            "course_code": i.concept.course.code if i.concept and i.concept.course else "CS201",
            "title": i.title,
            "rationale": i.rationale,
            "evidence_summary": i.evidence_summary,
            "baseline_accuracy": i.baseline_accuracy,
            "follow_up_accuracy": i.follow_up_accuracy,
            "status": i.status,
            "outcome": i.outcome,
            "recommended_action": i.recommended_action,
            "follow_up_task": i.follow_up_task,
            "created_at": i.created_at,
            "updated_at": i.updated_at,
        })
    return res

@router.post("", response_model=InterventionResponse)
def create_intervention(
    data: InterventionCreate,
    current_user: User = Depends(require_roles(["teacher", "admin"])),
    db: Session = Depends(get_db)
):
    """Faculty creates a targeted intervention following detected learning gap."""
    student = db.query(StudentProfile).filter(StudentProfile.id == data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    new_intv = Intervention(
        student_id=data.student_id,
        concept_id=data.concept_id,
        course_id=data.course_id,
        title=data.title,
        rationale=data.rationale,
        evidence_summary=data.evidence_summary,
        baseline_accuracy=30.0,
        status="assigned",
        outcome="pending",
        recommended_action=data.recommended_action,
        follow_up_task=data.follow_up_task,
        created_by=current_user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_intv)
    db.commit()
    db.refresh(new_intv)

    log_audit_event(
        db=db,
        action="INTERVENTION_CREATED",
        actor=current_user,
        target_type="Intervention",
        target_id=new_intv.id,
        details=f"Created intervention '{new_intv.title}' for student {student.roll_number}"
    )

    return {
        "id": new_intv.id,
        "student_id": new_intv.student_id,
        "student_name": student.user.full_name if student.user else "",
        "roll_number": student.roll_number,
        "concept_id": new_intv.concept_id,
        "concept_name": new_intv.concept.name if new_intv.concept else "General Support",
        "course_id": new_intv.course_id,
        "course_code": new_intv.concept.course.code if new_intv.concept and new_intv.concept.course else "CS201",
        "title": new_intv.title,
        "rationale": new_intv.rationale,
        "evidence_summary": new_intv.evidence_summary,
        "baseline_accuracy": new_intv.baseline_accuracy,
        "follow_up_accuracy": new_intv.follow_up_accuracy,
        "status": new_intv.status,
        "outcome": new_intv.outcome,
        "recommended_action": new_intv.recommended_action,
        "follow_up_task": new_intv.follow_up_task,
        "created_at": new_intv.created_at,
        "updated_at": new_intv.updated_at,
    }

@router.put("/{intervention_id}", response_model=InterventionResponse)
def update_intervention(
    intervention_id: int,
    data: InterventionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates status or outcome of an intervention."""
    intv = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not intv:
        raise HTTPException(status_code=404, detail="Intervention not found")

    if data.status:
        intv.status = data.status
    if data.follow_up_accuracy is not None:
        intv.follow_up_accuracy = data.follow_up_accuracy
        # Compare before & after evidence
        if intv.baseline_accuracy is not None:
            diff = data.follow_up_accuracy - intv.baseline_accuracy
            if diff >= 20.0:
                intv.outcome = "improved"
            elif diff >= 0.0:
                intv.outcome = "unchanged"
            else:
                intv.outcome = "inconclusive"
    if data.outcome:
        intv.outcome = data.outcome

    intv.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(intv)

    log_audit_event(
        db=db,
        action="INTERVENTION_UPDATED",
        actor=current_user,
        target_type="Intervention",
        target_id=intv.id,
        details=f"Updated status to {intv.status}, outcome to {intv.outcome}"
    )

    return {
        "id": intv.id,
        "student_id": intv.student_id,
        "student_name": intv.student.user.full_name if intv.student and intv.student.user else "",
        "roll_number": intv.student.roll_number if intv.student else "",
        "concept_id": intv.concept_id,
        "concept_name": intv.concept.name if intv.concept else "General Support",
        "course_id": intv.course_id,
        "course_code": intv.concept.course.code if intv.concept and intv.concept.course else "CS201",
        "title": intv.title,
        "rationale": intv.rationale,
        "evidence_summary": intv.evidence_summary,
        "baseline_accuracy": intv.baseline_accuracy,
        "follow_up_accuracy": intv.follow_up_accuracy,
        "status": intv.status,
        "outcome": intv.outcome,
        "recommended_action": intv.recommended_action,
        "follow_up_task": intv.follow_up_task,
        "created_at": intv.created_at,
        "updated_at": intv.updated_at,
    }

@router.post("/{intervention_id}/submit-followup")
def submit_followup_quiz(
    intervention_id: int,
    correct_count: int,
    total_count: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Step 10 in demo scenario: Student completes follow-up assessment.
    Calculates post-intervention accuracy, compares to baseline, and records improvement evidence.
    """
    intv = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not intv:
        raise HTTPException(status_code=404, detail="Intervention not found")

    new_acc = round((correct_count / total_count * 100.0) if total_count > 0 else 0.0, 1)
    intv.follow_up_accuracy = new_acc
    intv.status = "completed"

    diff = new_acc - intv.baseline_accuracy
    if diff >= 20.0:
        intv.outcome = "improved"
    elif diff >= 0.0:
        intv.outcome = "unchanged"
    else:
        intv.outcome = "inconclusive"

    intv.updated_at = datetime.utcnow()
    db.commit()

    log_audit_event(
        db=db,
        action="FOLLOWUP_ASSESSMENT_COMPLETED",
        actor=current_user,
        target_type="Intervention",
        target_id=intv.id,
        details=f"Baseline: {intv.baseline_accuracy}%, Follow-up: {new_acc}%, Outcome: {intv.outcome}"
    )

    return {
        "intervention_id": intv.id,
        "baseline_accuracy": intv.baseline_accuracy,
        "follow_up_accuracy": intv.follow_up_accuracy,
        "delta": round(diff, 1),
        "outcome": intv.outcome,
        "status": intv.status,
        "message": f"Follow-up recorded! Score improved from {intv.baseline_accuracy}% to {new_acc}%."
    }

@router.post("/review-alert", response_model=AlertReviewResponse)
def review_alert(
    review_data: AlertReviewCreate,
    current_user: User = Depends(require_roles(["teacher", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Rule #05: False-alarm review workflow.
    Allows teacher to inspect evidence and confirm, edit, or dismiss an alert with justification.
    """
    student = db.query(StudentProfile).filter(StudentProfile.id == review_data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    review = AlertReview(
        student_id=student.id,
        reviewer_id=current_user.id,
        original_score=75.0,  # recorded baseline
        action=review_data.action,
        reason=review_data.reason,
        student_context=review_data.student_context,
        reviewed_at=datetime.utcnow()
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    log_audit_event(
        db=db,
        action="ALERT_REVIEWED",
        actor=current_user,
        target_type="AlertReview",
        target_id=review.id,
        details=f"Faculty {current_user.username} {review_data.action} alert for student {student.roll_number}. Reason: {review_data.reason}"
    )

    return {
        "id": review.id,
        "student_id": review.student_id,
        "reviewer_id": review.reviewer_id,
        "reviewer_name": current_user.full_name,
        "original_score": review.original_score,
        "action": review.action,
        "reason": review.reason,
        "student_context": review.student_context,
        "reviewed_at": review.reviewed_at,
    }

@router.get("/alert-reviews", response_model=List[AlertReviewResponse])
def get_alert_reviews(
    student_id: Optional[int] = None,
    current_user: User = Depends(require_roles(["teacher", "admin"])),
    db: Session = Depends(get_db)
):
    query = db.query(AlertReview)
    if student_id:
        query = query.filter(AlertReview.student_id == student_id)
    reviews = query.order_by(AlertReview.reviewed_at.desc()).all()
    res = []
    for r in reviews:
        res.append({
            "id": r.id,
            "student_id": r.student_id,
            "reviewer_id": r.reviewer_id,
            "reviewer_name": r.reviewer.full_name if r.reviewer else "Faculty",
            "original_score": r.original_score,
            "action": r.action,
            "reason": r.reason,
            "student_context": r.student_context,
            "reviewed_at": r.reviewed_at,
        })
    return res
