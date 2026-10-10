export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'teacher' | 'student' | 'admin';
  student_id?: number;
  roll_number?: string;
  department?: string;
  semester?: number;
  cgpa?: number;
  teacher_id?: number;
  employee_id?: string;
  designation?: string;
}

export interface DemoAccount {
  role: 'teacher' | 'student' | 'admin';
  username: string;
  password: string;
  label: string;
  description: string;
}

export interface RiskComponent {
  name: string;
  raw_metric: string;
  concern_score: number;
  weight: number;
  weighted_contribution: number;
  status_label: string;
  explanation: string;
}

export interface RiskSummary {
  student_id: number;
  roll_number: string;
  full_name: string;
  overall_score: number;
  band: 'Low concern' | 'Moderate concern' | 'High concern' | 'Urgent review recommended';
  is_data_sufficient: boolean;
  missing_signals: string[];
  components: RiskComponent[];
  weights: Record<string, number>;
  formula_explanation: string;
  calculated_at: string;
  latest_data_date: string;
}

export interface StudentSummary {
  id: number;
  user_id: number;
  full_name: string;
  roll_number: string;
  department: string;
  semester: number;
  cgpa: number;
  overall_risk: number;
  risk_band: 'Low concern' | 'Moderate concern' | 'High concern' | 'Urgent review recommended';
  attendance_avg: number;
  assessment_avg: number;
  assignment_completion_rate: number;
  flagged_concepts_count: number;
  active_interventions_count: number;
}

export interface StudentDetail {
  id: number;
  roll_number: string;
  full_name: string;
  email: string;
  department: string;
  semester: number;
  cgpa: number;
  risk_summary: RiskSummary;
  attendance: Array<{
    id: number;
    course_id: number;
    course_code: string;
    course_title: string;
    total_classes: number;
    classes_attended: number;
    percentage: number;
    recent_trend: string;
    date_recorded: string;
  }>;
  attempts: Array<{
    id: number;
    assessment_id: number;
    assessment_title: string;
    question_id: number;
    question_text: string;
    marks_obtained: number;
    max_marks: number;
    is_correct: boolean;
    student_answer?: string;
    timestamp: string;
  }>;
  interventions: Array<{
    id: number;
    title: string;
    concept_name: string;
    baseline_accuracy: number;
    follow_up_accuracy?: number;
    status: string;
    outcome: string;
    recommended_action?: string;
    follow_up_task?: string;
    created_at: string;
  }>;
}

export interface ConceptMastery {
  concept_id: number;
  concept_name: string;
  course_code: string;
  course_title: string;
  total_attempts: number;
  correct_attempts: number;
  accuracy_percentage: number;
  recent_performance: string;
  data_sufficiency: string;
  needs_intervention: boolean;
  recommended_action: string;
}

export interface Intervention {
  id: number;
  student_id: number;
  student_name?: string;
  roll_number?: string;
  concept_id?: number;
  concept_name?: string;
  course_id?: number;
  course_code?: string;
  title: string;
  rationale: string;
  evidence_summary: string;
  baseline_accuracy: number;
  follow_up_accuracy?: number;
  status: 'detected' | 'recommended' | 'assigned' | 'in_progress' | 'completed' | 'dismissed';
  outcome: 'improved' | 'unchanged' | 'inconclusive' | 'pending';
  recommended_action?: string;
  follow_up_task?: string;
  created_at: string;
  updated_at: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'Student' | 'Course' | 'Concept' | 'Assessment' | 'Question' | 'LearningMaterial' | 'Intervention';
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Course {
  id: number;
  code: string;
  title: string;
  department: string;
  credits: number;
  semester: number;
  description?: string;
  concepts: Array<{
    id: number;
    name: string;
    category: string;
    difficulty_level: string;
  }>;
}

export interface LearningMaterial {
  id: number;
  course_id: number;
  course_code?: string;
  title: string;
  file_type: string;
  summary?: string;
  concepts: string[];
  flashcards: Array<{ front: string; back: string }>;
  practice_questions: Array<{
    question: string;
    options: string[];
    answer: string;
  }>;
  created_at: string;
}

export interface Assignment {
  id: number;
  course_id: number;
  course_code?: string;
  title: string;
  description?: string;
  instructions?: string;
  max_marks: number;
  deadline: string;
  concept_names: string[];
}

export interface Submission {
  id: number;
  assignment_id: number;
  assignment_title?: string;
  student_id: number;
  student_name?: string;
  roll_number?: string;
  submission_text?: string;
  submitted_at: string;
  is_late: boolean;
  score?: number;
  teacher_feedback?: string;
  ai_suggested_score?: number;
  ai_suggested_feedback?: string;
  is_approved: boolean;
}

export interface AuditLog {
  id: number;
  actor_id?: number;
  actor_name?: string;
  actor_role?: string;
  action: string;
  target_type?: string;
  target_id?: number;
  details?: string;
  timestamp: string;
}
