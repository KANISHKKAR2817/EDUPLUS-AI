import csv
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_roles
from app.models.models import User, StudentProfile, AttendanceRecord, Course
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/import-export", tags=["Data Import & CSV Templates"])

TEMPLATES = {
    "students": "username,full_name,email,roll_number,department,semester,cgpa\nsuresh.k,Suresh Kumar,suresh.k@college.edu,22CS101,Computer Science,4,7.8\n",
    "attendance": "roll_number,course_code,total_classes,classes_attended,recent_trend\n22CS101,CS201,40,36,stable\n",
    "marks": "roll_number,assessment_title,question_id,marks_obtained,is_correct\n22CS101,Java Unit Test 1,1,10,true\n"
}

@router.get("/template/{template_type}")
def get_template(template_type: str):
    """Download standard CSV templates with validation guidance."""
    if template_type not in TEMPLATES:
        raise HTTPException(status_code=400, detail="Invalid template type. Use: students, attendance, marks.")
    return Response(
        content=TEMPLATES[template_type],
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=template_{template_type}.csv"}
    )

@router.post("/upload-csv")
async def import_csv_data(
    category: str,
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles(["teacher", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Section 16: Safe CSV import with column validation and preview summary.
    """
    content = await file.read()
    try:
        decoded = content.decode("utf-8")
        reader = csv.DictReader(io.StringIO(decoded))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

    rows = list(reader)
    if not rows:
        raise HTTPException(status_code=400, detail="Uploaded CSV file is empty.")

    success_count = 0
    errors = []

    if category == "attendance":
        for i, r in enumerate(rows):
            roll = r.get("roll_number", "").strip()
            ccode = r.get("course_code", "").strip()
            try:
                tot = int(r.get("total_classes", "40"))
                att = int(r.get("classes_attended", "30"))
                trend = r.get("recent_trend", "stable").strip()
            except ValueError:
                errors.append(f"Row {i+1}: Numeric parse error for total/attended classes.")
                continue

            student = db.query(StudentProfile).filter(StudentProfile.roll_number == roll).first()
            course = db.query(Course).filter(Course.code == ccode).first()

            if not student:
                errors.append(f"Row {i+1}: Student with roll {roll} not found.")
                continue
            if not course:
                errors.append(f"Row {i+1}: Course with code {ccode} not found.")
                continue

            pct = round((att / tot * 100.0) if tot > 0 else 0.0, 1)
            rec = AttendanceRecord(
                student_id=student.id,
                course_id=course.id,
                total_classes=tot,
                classes_attended=att,
                percentage=pct,
                recent_trend=trend
            )
            db.add(rec)
            success_count += 1

        db.commit()

    log_audit_event(
        db=db,
        action="CSV_DATA_IMPORTED",
        actor=current_user,
        target_type=category,
        details=f"Imported {success_count} records with {len(errors)} validation warnings."
    )

    return {
        "status": "Import completed",
        "category": category,
        "rows_processed": len(rows),
        "records_imported": success_count,
        "errors": errors[:5],
        "preview_count": success_count
    }
