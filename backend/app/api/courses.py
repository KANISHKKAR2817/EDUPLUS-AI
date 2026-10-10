from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Course, Concept, User
from app.schemas.schemas import CourseResponse, ConceptResponse

router = APIRouter(prefix="/courses", tags=["Courses & Syllabus"])

@router.get("", response_model=List[CourseResponse])
def get_courses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    courses = db.query(Course).all()
    res = []
    for c in courses:
        concepts = [
            ConceptResponse(
                id=conc.id,
                course_id=conc.course_id,
                name=conc.name,
                description=conc.description,
                category=conc.category,
                difficulty_level=conc.difficulty_level
            )
            for conc in c.concepts
        ]
        res.append(CourseResponse(
            id=c.id,
            code=c.code,
            title=c.title,
            department=c.department,
            credits=c.credits,
            semester=c.semester,
            description=c.description,
            concepts=concepts
        ))
    return res

@router.get("/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    c = db.query(Course).filter(Course.id == course_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    concepts = [
        ConceptResponse(
            id=conc.id,
            course_id=conc.course_id,
            name=conc.name,
            description=conc.description,
            category=conc.category,
            difficulty_level=conc.difficulty_level
        )
        for conc in c.concepts
    ]
    return CourseResponse(
        id=c.id,
        code=c.code,
        title=c.title,
        department=c.department,
        credits=c.credits,
        semester=c.semester,
        description=c.description,
        concepts=concepts
    )
