from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth & User ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    full_name: str
    username: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class UserBase(BaseModel):
    username: str
    email: str
    full_name: str
    role: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Courses & Concepts ---
class ConceptResponse(BaseModel):
    id: int
    course_id: int
    name: str
    description: Optional[str] = None
    category: str
    difficulty_level: str

    class Config:
        from_attributes = True

class CourseResponse(BaseModel):
    id: int
    code: str
    title: str
    department: str
    credits: int
    semester: int
    description: Optional[str] = None
    concepts: List[ConceptResponse] = []

    class Config:
        from_attributes = True

# --- Attendance & Attempts ---
class AttendanceResponse(BaseModel):
    id: int
    course_id: int
    course_code: Optional[str] = None
    course_title: Optional[str] = None
    total_classes: int
    classes_attended: int
    percentage: float
    recent_trend: str
    date_recorded: datetime

    class Config:
        from_attributes = True

class QuestionAttemptResponse(BaseModel):
    id: int
    assessment_id: int
    assessment_title: Optional[str] = None
    question_id: int
    question_text: str
    concept_names: List[str] = []
    student_answer: Optional[str] = None
    marks_obtained: float
    max_marks: float
    is_correct: bool
    timestamp: datetime

    class Config:
        from_attributes = True

# --- Risk Engine ---
class RiskComponentDetail(BaseModel):
    name: str
    raw_metric: str
    concern_score: float  # 0 to 100
    weight: float         # e.g. 0.25
    weighted_contribution: float  # concern_score * weight
    status_label: str     # "Low", "Moderate", "High", "Critical"
    explanation: str

class RiskScoreResponse(BaseModel):
    student_id: int
    roll_number: str
    full_name: str
    overall_score: float
    band: str             # "Low concern", "Moderate concern", "High concern", "Urgent review recommended"
    is_data_sufficient: bool
    missing_signals: List[str] = []
    components: List[RiskComponentDetail] = []
    weights: Dict[str, float]
    formula_explanation: str
    calculated_at: datetime
    latest_data_date: str

class WhyFlaggedResponse(BaseModel):
    student_id: int
    roll_number: str
    full_name: str
    overall_score: float
    band: str
    key_drivers: List[str]
    contributing_factors: List[RiskComponentDetail]
    suggested_next_steps: List[str]
    disclaimer: str

class GlobalExplanationResponse(BaseModel):
    formula_name: str
    formula_string: str
    component_weights: Dict[str, float]
    band_definitions: List[Dict[str, Any]]
    total_students_evaluated: int
    band_distribution: Dict[str, int]
    safeguards_and_limitations: List[str]
    disclaimer: str

# --- Concept Mastery ---
class ConceptMastery(BaseModel):
    concept_id: int
    concept_name: str
    course_code: str
    course_title: str
    total_attempts: int
    correct_attempts: int
    accuracy_percentage: float
    recent_performance: str
    data_sufficiency: str  # "Sufficient", "Insufficient Data", "Emerging"
    needs_intervention: bool
    recommended_action: str

# --- Interventions ---
class InterventionCreate(BaseModel):
    student_id: int
    concept_id: Optional[int] = None
    course_id: Optional[int] = None
    title: str
    rationale: str
    evidence_summary: str
    recommended_action: str
    follow_up_task: str

class InterventionUpdate(BaseModel):
    status: Optional[str] = None  # detected, recommended, assigned, in_progress, completed, dismissed
    outcome: Optional[str] = None  # improved, unchanged, inconclusive, pending
    follow_up_accuracy: Optional[float] = None
    teacher_notes: Optional[str] = None

class InterventionResponse(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    roll_number: Optional[str] = None
    concept_id: Optional[int] = None
    concept_name: Optional[str] = None
    course_id: Optional[int] = None
    course_code: Optional[str] = None
    title: str
    rationale: str
    evidence_summary: str
    baseline_accuracy: float
    follow_up_accuracy: Optional[float] = None
    status: str
    outcome: str
    recommended_action: Optional[str] = None
    follow_up_task: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Alert Review / False Alarms ---
class AlertReviewCreate(BaseModel):
    student_id: int
    action: str  # "confirmed", "edited", "dismissed"
    reason: str
    student_context: Optional[str] = None

class AlertReviewResponse(BaseModel):
    id: int
    student_id: int
    reviewer_id: int
    reviewer_name: Optional[str] = None
    original_score: float
    action: str
    reason: str
    student_context: Optional[str] = None
    reviewed_at: datetime

    class Config:
        from_attributes = True

# --- Student Profile Overview ---
class StudentSummaryResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    roll_number: str
    department: str
    semester: int
    cgpa: float
    overall_risk: float
    risk_band: str
    attendance_avg: float
    assessment_avg: float
    assignment_completion_rate: float
    flagged_concepts_count: int
    active_interventions_count: int

# --- Knowledge Graph ---
class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # Student, Course, Concept, Assessment, Question, LearningMaterial, Intervention
    properties: Dict[str, Any]

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str  # ENROLLED_IN, CONTAINS, ASSESSES, TESTS, STRUGGLES_WITH, EXPLAINS, TARGETS, etc.

class KnowledgeGraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

# --- AI Assistant ---
class AIChatRequest(BaseModel):
    message: str
    student_id: Optional[int] = None
    course_id: Optional[int] = None
    concept_id: Optional[int] = None

class AIChatResponse(BaseModel):
    response: str
    source_context: Optional[str] = None
    is_live_gemini: bool
    suggestions: List[str] = []

class StudyPlanRequest(BaseModel):
    student_id: int
    concept_id: int
    target_days: int = 7

class StudyPlanResponse(BaseModel):
    concept_name: str
    baseline_accuracy: float
    recommended_plan: List[Dict[str, Any]]
    practice_questions: List[Dict[str, Any]]
    is_live_gemini: bool

# --- Assignments & Submissions ---
class AssignmentResponse(BaseModel):
    id: int
    course_id: int
    course_code: Optional[str] = None
    title: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    max_marks: float
    deadline: datetime
    concept_names: List[str] = []

    class Config:
        from_attributes = True

class SubmissionResponse(BaseModel):
    id: int
    assignment_id: int
    assignment_title: Optional[str] = None
    student_id: int
    student_name: Optional[str] = None
    roll_number: Optional[str] = None
    submission_text: Optional[str] = None
    file_path: Optional[str] = None
    submitted_at: datetime
    is_late: bool
    score: Optional[float] = None
    teacher_feedback: Optional[str] = None
    ai_suggested_score: Optional[float] = None
    ai_suggested_feedback: Optional[str] = None
    is_approved: bool

    class Config:
        from_attributes = True

class GradeSubmissionRequest(BaseModel):
    score: float
    teacher_feedback: str
    is_approved: bool = True

# --- Study Materials ---
class LearningMaterialResponse(BaseModel):
    id: int
    course_id: int
    course_code: Optional[str] = None
    title: str
    file_type: str
    summary: Optional[str] = None
    concepts: List[str] = []
    flashcards: List[Dict[str, str]] = []
    practice_questions: List[Dict[str, Any]] = []
    created_at: datetime

    class Config:
        from_attributes = True

# --- Audit & Reports ---
class AuditLogResponse(BaseModel):
    id: int
    actor_id: Optional[int] = None
    actor_name: Optional[str] = None
    actor_role: Optional[str] = None
    action: str
    target_type: Optional[str] = None
    target_id: Optional[int] = None
    details: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True
