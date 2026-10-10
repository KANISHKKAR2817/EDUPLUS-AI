const API_BASE = 'http://127.0.0.1:8000/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-转变': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Only redirect if not already on login page
    if (!window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error('Authentication expired. Please log in.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials: { username: string; password: string }) =>
    request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => request<any>('/auth/me'),
  getDemoAccounts: () => request<any[]>('/auth/demo-accounts'),

  // Students
  getStudents: (params?: { search?: string; risk_band?: string; course_id?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.risk_band) query.append('risk_band', params.risk_band);
    if (params?.course_id) query.append('course_id', params.course_id.toString());
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return request<any[]>(`/students${qStr}`);
  },
  getStudentDetail: (id: number) => request<any>(`/students/${id}`),
  getConceptMastery: (id: number) => request<any[]>(`/students/${id}/concept-mastery`),
  recalculateRisk: (id: number) =>
    request<any>(`/students/${id}/recalculate-risk`, { method: 'POST' }),
  getWhyFlagged: (id: number) => request<any>(`/students/${id}/why-flagged`),

  // Knowledge Graph
  getKnowledgeGraph: (params?: { course_id?: number; student_id?: number }) => {
    const query = new URLSearchParams();
    if (params?.course_id) query.append('course_id', params.course_id.toString());
    if (params?.student_id) query.append('student_id', params.student_id.toString());
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return request<any>(`/graph${qStr}`);
  },

  // Risk Engine & Global Explainability
  getGlobalExplanation: () => request<any>('/risk-engine/global-explanation'),

  // Interventions
  getInterventions: (params?: { student_id?: number; status_filter?: string }) => {
    const query = new URLSearchParams();
    if (params?.student_id) query.append('student_id', params.student_id.toString());
    if (params?.status_filter) query.append('status_filter', params.status_filter);
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return request<any[]>(`/interventions${qStr}`);
  },
  createIntervention: (data: any) =>
    request<any>('/interventions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateIntervention: (id: number, data: any) =>
    request<any>(`/interventions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  submitFollowupQuiz: (interventionId: number, correctCount: number, totalCount: number) =>
    request<any>(`/interventions/${interventionId}/submit-followup?correct_count=${correctCount}&total_count=${totalCount}`, {
      method: 'POST',
    }),
  reviewAlert: (data: { student_id: number; action: string; reason: string; student_context?: string }) =>
    request<any>('/interventions/review-alert', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAlertReviews: (studentId?: number) => {
    const q = studentId ? `?student_id=${studentId}` : '';
    return request<any[]>(`/interventions/alert-reviews${q}`);
  },

  // AI Assistant
  aiChat: (data: { message: string; student_id?: number; course_id?: number; concept_id?: number }) =>
    request<any>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  aiStudyPlan: (data: { student_id: number; concept_id: number; target_days?: number }) =>
    request<any>('/ai/study-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Study Materials
  getMaterials: (courseId?: number) => {
    const q = courseId ? `?course_id=${courseId}` : '';
    return request<any[]>(`/materials${q}`);
  },
  uploadMaterial: async (formData: FormData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/materials/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to upload material');
    }
    return response.json();
  },

  // Assignments
  getAssignments: (courseId?: number) => {
    const q = courseId ? `?course_id=${courseId}` : '';
    return request<any[]>(`/assignments${q}`);
  },
  submitAssignment: (assignmentId: number, text: string) =>
    request<any>(`/assignments/${assignmentId}/submit?submission_text=${encodeURIComponent(text)}`, {
      method: 'POST',
    }),
  getSubmissions: (assignmentId: number) =>
    request<any[]>(`/assignments/${assignmentId}/submissions`),
  gradeSubmission: (submissionId: number, data: { score: number; teacher_feedback: string; is_approved: boolean }) =>
    request<any>(`/assignments/submissions/${submissionId}/grade`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Courses & Assessments
  getCourses: () => request<any[]>('/courses'),
  getAssessments: (courseId?: number) => {
    const q = courseId ? `?course_id=${courseId}` : '';
    return request<any[]>(`/assessments${q}`);
  },

  // Reports & Analytics
  getCohortSummary: () => request<any>('/reports/cohort-summary'),
  getAuditLogs: (limit = 50) => request<any[]>(`/reports/audit-logs?limit=${limit}`),
  downloadCohortCsvUrl: () => `${API_BASE}/reports/export-csv`,

  // Admin & Settings
  getSystemStats: () => request<any>('/admin/stats'),
  resetDemoData: () => request<any>('/admin/reset-demo-data', { method: 'POST' }),
};
