from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.models import (
    StudentProfile, Course, Concept, Assessment, Question,
    QuestionConcept, StudentAttempt, LearningMaterial, Intervention
)

def build_academic_knowledge_graph(
    db: Session,
    course_id: Optional[int] = None,
    student_id: Optional[int] = None,
    limit_nodes: int = 200
) -> Dict[str, Any]:
    """
    Rule #02: Queryable Academic Knowledge Graph.
    Extracts real entities and traversable relationships from relational tables.
    """
    nodes = []
    edges = []
    node_ids = set()

    def add_node(nid: str, label: str, ntype: str, props: Dict[str, Any]):
        if nid not in node_ids and len(nodes) < limit_nodes:
            node_ids.add(nid)
            nodes.append({
                "id": nid,
                "label": label,
                "type": ntype,
                "properties": props
            })

    def add_edge(eid: str, source: str, target: str, label: str):
        if source in node_ids and target in node_ids:
            edges.append({
                "id": eid,
                "source": source,
                "target": target,
                "label": label
            })

    # 1. Fetch Courses
    courses_query = db.query(Course)
    if course_id:
        courses_query = courses_query.filter(Course.id == course_id)
    courses = courses_query.all()
    selected_course_ids = {c.id for c in courses}

    for c in courses:
        add_node(
            f"course_{c.id}",
            f"{c.code}: {c.title}",
            "Course",
            {"code": c.code, "credits": c.credits, "semester": c.semester, "department": c.department}
        )

    # 2. Fetch Concepts
    concepts = db.query(Concept).filter(Concept.course_id.in_(selected_course_ids)).all() if selected_course_ids else []
    concept_map = {}
    for conc in concepts:
        concept_map[conc.id] = conc
        cid = f"concept_{conc.id}"
        add_node(
            cid,
            conc.name,
            "Concept",
            {"category": conc.category, "difficulty": conc.difficulty_level, "course_id": conc.course_id}
        )
        add_edge(f"edge_c_contains_{conc.id}", f"course_{conc.course_id}", cid, "CONTAINS")

    # 3. Fetch Students
    students_query = db.query(StudentProfile)
    if student_id:
        students_query = students_query.filter(StudentProfile.id == student_id)
    students = students_query.limit(20).all()

    for s in students:
        sid = f"student_{s.id}"
        s_name = s.user.full_name if s.user else s.roll_number
        add_node(
            sid,
            f"{s_name} ({s.roll_number})",
            "Student",
            {"roll_number": s.roll_number, "cgpa": s.cgpa, "semester": s.semester, "department": s.department}
        )
        # Enrollment edges
        for enr in s.enrollments:
            if enr.course_id in selected_course_ids:
                add_edge(f"edge_enr_{s.id}_{enr.course_id}", sid, f"course_{enr.course_id}", "ENROLLED_IN")

    # 4. Fetch Assessments & Questions
    assessments = db.query(Assessment).filter(Assessment.course_id.in_(selected_course_ids)).all() if selected_course_ids else []
    for ass in assessments:
        aid = f"assessment_{ass.id}"
        add_node(
            aid,
            ass.title,
            "Assessment",
            {"type": ass.assessment_type, "max_marks": ass.max_marks, "course_id": ass.course_id}
        )
        add_edge(f"edge_c_assesses_{ass.id}", f"course_{ass.course_id}", aid, "ASSESSES")

        # Questions linked to assessment
        for q in ass.questions[:5]:  # limit questions per assessment to keep graph readable
            qid = f"question_{q.id}"
            add_node(
                qid,
                f"Q{q.id}: {q.question_text[:30]}...",
                "Question",
                {"max_marks": q.max_marks, "type": q.question_type}
            )
            add_edge(f"edge_ass_has_q_{q.id}", aid, qid, "CONTAINS_QUESTION")

            # Question TESTS Concept
            for qc in q.concept_links:
                if qc.concept_id in concept_map:
                    add_edge(f"edge_q_tests_{q.id}_{qc.concept_id}", qid, f"concept_{qc.concept_id}", "TESTS")

    # 5. Fetch Learning Materials
    materials = db.query(LearningMaterial).filter(LearningMaterial.course_id.in_(selected_course_ids)).all() if selected_course_ids else []
    for mat in materials:
        mid = f"material_{mat.id}"
        add_node(
            mid,
            mat.title,
            "LearningMaterial",
            {"file_type": mat.file_type, "course_id": mat.course_id}
        )
        add_edge(f"edge_c_provides_{mat.id}", f"course_{mat.course_id}", mid, "PROVIDES_RESOURCE")

    # 6. Fetch Interventions and Student Struggle edges
    interventions_query = db.query(Intervention)
    if student_id:
        interventions_query = interventions_query.filter(Intervention.student_id == student_id)
    interventions = interventions_query.all()

    for intv in interventions:
        iid = f"intervention_{intv.id}"
        add_node(
            iid,
            intv.title,
            "Intervention",
            {
                "status": intv.status,
                "outcome": intv.outcome,
                "baseline_accuracy": intv.baseline_accuracy,
                "follow_up_accuracy": intv.follow_up_accuracy
            }
        )
        sid = f"student_{intv.student_id}"
        add_edge(f"edge_s_receives_{intv.id}", sid, iid, "RECEIVES")
        if intv.concept_id:
            add_edge(f"edge_intv_targets_{intv.id}", iid, f"concept_{intv.concept_id}", "TARGETS")
            add_edge(f"edge_s_struggles_{intv.student_id}_{intv.concept_id}", sid, f"concept_{intv.concept_id}", "STRUGGLES_WITH")

    return {
        "nodes": nodes,
        "edges": edges,
    }
