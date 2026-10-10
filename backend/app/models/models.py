from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False, default="student")  # "teacher", "student", "admin"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, foreign_keys="StudentProfile.user_id")
    teacher_profile = relationship("TeacherProfile", back_populates="user", uselist=False, foreign_keys="TeacherProfile.user_id")
    audit_logs = relationship("AuditLog", back_populates="actor", foreign_keys="AuditLog.actor_id")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    roll_number = Column(String(30), unique=True, index=True, nullable=False)
    department = Column(String(100), nullable=False)
    semester = Column(Integer, default=4)
    cgpa = Column(Float, default=7.5)
    mentor_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    user = relationship("User", back_populates="student_profile", foreign_keys=[user_id])
    mentor = relationship("User", foreign_keys=[mentor_id])
    enrollments = relationship("CourseEnrollment", back_populates="student", cascade="all, delete-orphan")
    attempts = relationship("StudentAttempt", back_populates="student", cascade="all, delete-orphan")
    attendance_records = relationship("AttendanceRecord", back_populates="student", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="student", cascade="all, delete-orphan")
    risk_snapshots = relationship("RiskScoreSnapshot", back_populates="student", cascade="all, delete-orphan")
    interventions = relationship("Intervention", back_populates="student", cascade="all, delete-orphan")
    alert_reviews = relationship("AlertReview", back_populates="student", cascade="all, delete-orphan")


class TeacherProfile(Base):
    __tablename__ = "teacher_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    employee_id = Column(String(30), unique=True, index=True, nullable=False)
    department = Column(String(100), nullable=False)
    designation = Column(String(100), default="Assistant Professor")

    # Relationships
    user = relationship("User", back_populates="teacher_profile", foreign_keys=[user_id])
    course_assignments = relationship("TeacherCourseAssignment", back_populates="teacher", cascade="all, delete-orphan")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True, nullable=False)
    title = Column(String(150), nullable=False)
    department = Column(String(100), nullable=False)
    credits = Column(Integer, default=3)
    semester = Column(Integer, default=4)
    description = Column(Text, nullable=True)

    # Relationships
    enrollments = relationship("CourseEnrollment", back_populates="course", cascade="all, delete-orphan")
    teacher_assignments = relationship("TeacherCourseAssignment", back_populates="course", cascade="all, delete-orphan")
    concepts = relationship("Concept", back_populates="course", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="course", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="course", cascade="all, delete-orphan")
    materials = relationship("LearningMaterial", back_populates="course", cascade="all, delete-orphan")
    attendance = relationship("AttendanceRecord", back_populates="course", cascade="all, delete-orphan")


class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    enrolled_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class TeacherCourseAssignment(Base):
    __tablename__ = "teacher_course_assignments"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teacher_profiles.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    academic_year = Column(String(20), default="2025-2026")

    teacher = relationship("TeacherProfile", back_populates="course_assignments")
    course = relationship("Course", back_populates="teacher_assignments")


class Concept(Base):
    __tablename__ = "concepts"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    name = Column(String(120), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="Core")
    difficulty_level = Column(String(30), default="intermediate")  # beginner, intermediate, advanced

    course = relationship("Course", back_populates="concepts")
    question_links = relationship("QuestionConcept", back_populates="concept", cascade="all, delete-orphan")
    interventions = relationship("Intervention", back_populates="concept")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(150), nullable=False)
    assessment_type = Column(String(40), default="unit_test")  # unit_test, midterm, quiz, follow_up
    max_marks = Column(Float, default=100.0)
    passing_marks = Column(Float, default=50.0)
    date_conducted = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="assessments")
    questions = relationship("Question", back_populates="assessment", cascade="all, delete-orphan")
    attempts = relationship("StudentAttempt", back_populates="assessment", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    max_marks = Column(Float, default=10.0)
    question_type = Column(String(30), default="mcq")  # mcq, short_answer, code
    options_json = Column(Text, nullable=True)  # JSON list of MCQ options if any
    correct_answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)

    assessment = relationship("Assessment", back_populates="questions")
    concept_links = relationship("QuestionConcept", back_populates="question", cascade="all, delete-orphan")
    attempts = relationship("StudentAttempt", back_populates="question", cascade="all, delete-orphan")


class QuestionConcept(Base):
    __tablename__ = "question_concepts"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=False)

    question = relationship("Question", back_populates="concept_links")
    concept = relationship("Concept", back_populates="question_links")


class StudentAttempt(Base):
    __tablename__ = "student_attempts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    student_answer = Column(Text, nullable=True)
    marks_obtained = Column(Float, default=0.0)
    is_correct = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="attempts")
    assessment = relationship("Assessment", back_populates="attempts")
    question = relationship("Question", back_populates="attempts")


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    total_classes = Column(Integer, default=40)
    classes_attended = Column(Integer, default=32)
    percentage = Column(Float, default=80.0)
    recent_trend = Column(String(20), default="stable")  # improving, stable, declining
    date_recorded = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="attendance_records")
    course = relationship("Course", back_populates="attendance")


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)
    max_marks = Column(Float, default=50.0)
    deadline = Column(DateTime, nullable=False)
    concept_names_json = Column(Text, nullable=True)  # JSON array of concept names

    course = relationship("Course", back_populates="assignments")
    submissions = relationship("Submission", back_populates="assignment", cascade="all, delete-orphan")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    submission_text = Column(Text, nullable=True)
    file_path = Column(String(255), nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    is_late = Column(Boolean, default=False)
    score = Column(Float, nullable=True)
    teacher_feedback = Column(Text, nullable=True)
    ai_suggested_score = Column(Float, nullable=True)
    ai_suggested_feedback = Column(Text, nullable=True)
    is_approved = Column(Boolean, default=False)
    graded_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("StudentProfile", back_populates="submissions")
    grader = relationship("User", foreign_keys=[graded_by])


class LearningMaterial(Base):
    __tablename__ = "learning_materials"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(150), nullable=False)
    file_path = Column(String(255), nullable=True)
    file_type = Column(String(20), default="txt")  # pdf, docx, txt
    extracted_text = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    concepts_json = Column(Text, nullable=True)
    flashcards_json = Column(Text, nullable=True)
    practice_questions_json = Column(Text, nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="materials")


class RiskScoreSnapshot(Base):
    __tablename__ = "risk_score_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    overall_score = Column(Float, nullable=False)
    band = Column(String(40), nullable=False)  # "Low concern", "Moderate concern", "High concern", "Urgent review recommended"
    attendance_concern = Column(Float, default=0.0)
    assessment_concern = Column(Float, default=0.0)
    assignment_concern = Column(Float, default=0.0)
    trend_concern = Column(Float, default=0.0)
    weights_json = Column(Text, nullable=True)
    is_data_sufficient = Column(Boolean, default=True)
    missing_signals_json = Column(Text, nullable=True)
    calculated_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="risk_snapshots")


class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    title = Column(String(150), nullable=False)
    rationale = Column(Text, nullable=False)
    evidence_summary = Column(Text, nullable=False)
    baseline_accuracy = Column(Float, default=0.0)  # e.g. 30%
    follow_up_accuracy = Column(Float, nullable=True)  # e.g. 80%
    status = Column(String(30), default="recommended")  # detected, recommended, assigned, in_progress, completed, dismissed
    outcome = Column(String(30), default="pending")  # improved, unchanged, inconclusive, pending
    recommended_action = Column(Text, nullable=True)
    follow_up_task = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="interventions")
    concept = relationship("Concept", back_populates="interventions")


class AlertReview(Base):
    __tablename__ = "alert_reviews"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    original_score = Column(Float, nullable=False)
    action = Column(String(30), nullable=False)  # "confirmed", "edited", "dismissed"
    reason = Column(Text, nullable=False)
    student_context = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="alert_reviews")
    reviewer = relationship("User", foreign_keys=[reviewer_id])


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    actor_role = Column(String(30), nullable=True)
    action = Column(String(100), nullable=False)
    target_type = Column(String(50), nullable=True)
    target_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    actor = relationship("User", back_populates="audit_logs", foreign_keys=[actor_id])
