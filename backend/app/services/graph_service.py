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
    limit_nodes: int = 100
) -> Dict[str, Any]:
    """
    Rule #02: Queryable Academic Knowledge Graph.
    Generates a precise pedagogical ontology:
    Course -> CONTAINS -> Concepts with PREREQUISITE_OF relationships.
    Connects struggling students via STRUGGLES_WITH, interventions via TARGETS,
    and assessments via ASSESSES.
    Excludes low-level individual question and file noise for a clean, actionable graph.
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

    # Pedagogical prerequisite dependencies across computer science topics
    PREREQUISITES_MAP = {
        "Java Arrays & Indexing": "Conditions & Loops",
        "Classes and Objects": "Java Arrays & Indexing",
        "Inheritance & Polymorphism": "Classes and Objects",
        "Exception Handling": "Classes and Objects",
        "Stacks & Queues": "Linked Lists",
        "Binary Trees": "Stacks & Queues",
        "Sorting & Searching": "Java Arrays & Indexing",
        "Normalization (1NF-BCNF)": "ER Modeling & Relational Schema",
        "Transactions & ACID Properties": "SQL Queries & Joins",
        "Graph Theory & Trees": "Propositional & Predicate Logic",
        "Recurrence Relations": "Set Theory & Relations",
    }

    # 1. Fetch Targeted Courses
    courses_query = db.query(Course)
    if course_id:
        courses_query = courses_query.filter(Course.id == course_id)
    else:
        # Default to CS201 (Java Programming) if not filtered to keep graph crisp and readable
        courses_query = courses_query.filter(Course.code.in_(["CS201", "CS202"]))
    courses = courses_query.all()
    selected_course_ids = {c.id for c in courses}

    for c in courses:
        add_node(
            f"course_{c.id}",
            f"{c.code}: {c.title}",
            "Course",
            {
                "code": c.code,
                "credits": c.credits,
                "semester": c.semester,
                "department": c.department,
                "description": c.description or ""
            }
        )

    # 2. Fetch Concepts for selected courses
    concepts = db.query(Concept).filter(Concept.course_id.in_(selected_course_ids)).all() if selected_course_ids else []
    concept_by_name = {}
    concept_by_id = {}

    for conc in concepts:
        concept_by_name[conc.name] = conc
        concept_by_id[conc.id] = conc
        cid = f"concept_{conc.id}"
        add_node(
            cid,
            conc.name,
            "Concept",
            {
                "category": conc.category,
                "difficulty": conc.difficulty_level,
                "course_id": conc.course_id
            }
        )
        add_edge(f"edge_c_contains_{conc.id}", f"course_{conc.course_id}", cid, "CONTAINS")

    # Add pedagogical PREREQUISITE_OF edges between concepts
    for conc_name, prereq_name in PREREQUISITES_MAP.items():
        if conc_name in concept_by_name and prereq_name in concept_by_name:
            prereq_obj = concept_by_name[prereq_name]
            curr_obj = concept_by_name[conc_name]
            add_edge(
                f"edge_prereq_{prereq_obj.id}_{curr_obj.id}",
                f"concept_{prereq_obj.id}",
                f"concept_{curr_obj.id}",
                "PREREQUISITE_OF"
            )

    # 3. Fetch Relevant Student(s)
    # Focus on students with active interventions or the requested student
    students_query = db.query(StudentProfile)
    if student_id:
        students_query = students_query.filter(StudentProfile.id == student_id)
    else:
        # Include top flagged student (e.g. Arun Kumar) for actionable insights
        students_query = students_query.filter(StudentProfile.roll_number.in_(["22CS101", "22CS102"]))

    relevant_students = students_query.all()
    for s in relevant_students:
        sid = f"student_{s.id}"
        s_name = s.user.full_name if s.user else s.roll_number
        add_node(
            sid,
            f"{s_name} ({s.roll_number})",
            "Student",
            {
                "roll_number": s.roll_number,
                "cgpa": s.cgpa,
                "semester": s.semester,
                "department": s.department
            }
        )
        for enr in s.enrollments:
            if enr.course_id in selected_course_ids:
                add_edge(f"edge_enr_{s.id}_{enr.course_id}", sid, f"course_{enr.course_id}", "ENROLLED_IN")

    # 4. Fetch Key Assessments (e.g. UT1, UT2)
    assessments = db.query(Assessment).filter(Assessment.course_id.in_(selected_course_ids)).all() if selected_course_ids else []
    for ass in assessments[:3]:  # Keep to core continuous assessments to prevent clutter
        aid = f"assessment_{ass.id}"
        add_node(
            aid,
            ass.title,
            "Assessment",
            {
                "type": ass.assessment_type,
                "max_marks": ass.max_marks,
                "course_id": ass.course_id
            }
        )
        add_edge(f"edge_c_assesses_{ass.id}", f"course_{ass.course_id}", aid, "ASSESSES")

    # 5. Fetch Targeted Interventions
    interventions_query = db.query(Intervention)
    if student_id:
        interventions_query = interventions_query.filter(Intervention.student_id == student_id)
    else:
        interventions_query = interventions_query.filter(
            Intervention.student_id.in_([s.id for s in relevant_students])
        )
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
                "follow_up_accuracy": intv.follow_up_accuracy,
                "recommended_action": intv.recommended_action
            }
        )
        sid = f"student_{intv.student_id}"
        add_edge(f"edge_s_receives_{intv.id}", sid, iid, "RECEIVES")
        if intv.concept_id and intv.concept_id in concept_by_id:
            cid = f"concept_{intv.concept_id}"
            add_edge(f"edge_intv_targets_{intv.id}", iid, cid, "TARGETS")
            add_edge(f"edge_s_struggles_{intv.student_id}_{intv.concept_id}", sid, cid, "STRUGGLES_WITH")

    return {
        "nodes": nodes,
        "edges": edges,
    }
