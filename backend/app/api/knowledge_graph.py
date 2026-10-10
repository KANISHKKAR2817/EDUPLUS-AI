from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User
from app.schemas.schemas import KnowledgeGraphResponse
from app.services.graph_service import build_academic_knowledge_graph

router = APIRouter(prefix="/graph", tags=["Knowledge Graph"])

@router.get("", response_model=KnowledgeGraphResponse)
def get_graph(
    course_id: Optional[int] = None,
    student_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Rule #02: Queryable Academic Knowledge Graph.
    Traverses relationships: Student -> Course -> Concept -> Assessment -> Question -> Material -> Intervention.
    """
    if current_user.role == "student" and current_user.student_profile:
        # Default to student's own perspective if not specified
        if not student_id:
            student_id = current_user.student_profile.id

    graph_data = build_academic_knowledge_graph(
        db=db,
        course_id=course_id,
        student_id=student_id,
        limit_nodes=250
    )
    return graph_data
