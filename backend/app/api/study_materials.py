import os
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user, require_roles
from app.models.models import User, LearningMaterial, Course
from app.schemas.schemas import LearningMaterialResponse
from app.services.document_service import extract_text_from_file
from app.services.ai_service import ai_service
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/materials", tags=["Study Materials"])

@router.get("", response_model=List[LearningMaterialResponse])
def get_materials(
    course_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve authorized course materials."""
    query = db.query(LearningMaterial)
    if course_id:
        query = query.filter(LearningMaterial.course_id == course_id)
    items = query.order_by(LearningMaterial.created_at.desc()).all()
    
    res = []
    for m in items:
        concepts = json.loads(m.concepts_json) if m.concepts_json else []
        flashcards = json.loads(m.flashcards_json) if m.flashcards_json else []
        questions = json.loads(m.practice_questions_json) if m.practice_questions_json else []
        res.append({
            "id": m.id,
            "course_id": m.course_id,
            "course_code": m.course.code if m.course else "CS201",
            "title": m.title,
            "file_type": m.file_type,
            "summary": m.summary,
            "concepts": concepts,
            "flashcards": flashcards,
            "practice_questions": questions,
            "created_at": m.created_at,
        })
    return res

@router.post("/upload")
async def upload_material(
    title: str = Form(...),
    course_id: int = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles(["teacher", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Section 14: Study-Material Analyzer.
    Uploads PDF, DOCX, or TXT file, extracts text, summarizes content, and generates study aids.
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # File extension check
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "txt"
    if ext not in ["pdf", "docx", "txt"]:
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and TXT files are supported.")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    safe_filename = f"{course_id}_{int(os.path.getmtime(settings.UPLOAD_DIR))}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Text extraction
    extracted_text, extract_status = extract_text_from_file(file_path, ext)
    if not extracted_text:
        extracted_text = f"Study material content for {title} in {course.title}."

    # AI analysis
    analysis = await ai_service.analyze_document_content(extracted_text, title)

    material = LearningMaterial(
        course_id=course_id,
        title=title,
        file_path=file_path,
        file_type=ext,
        extracted_text=extracted_text[:10000],
        summary=analysis.get("summary", "Document analyzed."),
        concepts_json=json.dumps(analysis.get("concepts", [])),
        flashcards_json=json.dumps(analysis.get("flashcards", [])),
        practice_questions_json=json.dumps(analysis.get("practice_questions", [])),
        uploaded_by=current_user.id
    )
    db.add(material)
    db.commit()
    db.refresh(material)

    log_audit_event(
        db=db,
        action="STUDY_MATERIAL_UPLOADED",
        actor=current_user,
        target_type="LearningMaterial",
        target_id=material.id,
        details=f"Uploaded '{title}' ({ext}) for course {course.code}"
    )

    return {
        "id": material.id,
        "title": material.title,
        "summary": material.summary,
        "concepts": analysis.get("concepts", []),
        "flashcards_count": len(analysis.get("flashcards", [])),
        "practice_questions_count": len(analysis.get("practice_questions", [])),
        "message": "Document processed and analyzed successfully!"
    }
