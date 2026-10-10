import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Assignment, Submission } from '../types';
import { useAuth } from '../context/AuthContext';
import { FileText, CheckCircle2, Clock, Send, ShieldCheck, ArrowRight } from 'lucide-react';

export const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignId, setSelectedAssignId] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionText, setSubmissionText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Grade modal state
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(45);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const data = await api.getAssignments();
      setAssignments(data);
      if (data.length > 0 && !selectedAssignId) {
        setSelectedAssignId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    if (selectedAssignId && user?.role !== 'student') {
      api.getSubmissions(selectedAssignId).then(setSubmissions).catch(console.error);
    }
  }, [selectedAssignId, user?.role]);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignId || !submissionText.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.submitAssignment(selectedAssignId, submissionText);
      setSuccessMsg(res.message);
      setSubmissionText('');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGradeApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    try {
      await api.gradeSubmission(selectedSub.id, {
        score: gradeScore,
        teacher_feedback: gradeFeedback,
        is_approved: true,
      });
      setSelectedSub(null);
      if (selectedAssignId) {
        api.getSubmissions(selectedAssignId).then(setSubmissions);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const selectedAssign = assignments.find((a) => a.id === selectedAssignId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-50 via-white to-slate-50 border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
            Section 15 Workflow
          </span>
          <span className="text-xs text-slate-500 font-medium">Classroom Assignments & Human-in-the-Loop Grading</span>
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="h-6 w-6 text-teal-600" />
          <span>Continuous Assessment Lab Assignments</span>
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
          AI suggests preliminary rubric grades and feedback, but final high-stakes marks require faculty review and explicit approval.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assignments List */}
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Course Assignments ({assignments.length})
          </span>
          {assignments.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAssignId(a.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all space-y-1.5 ${
                selectedAssignId === a.id
                  ? 'bg-teal-50/70 border-teal-500 shadow-2xs ring-1 ring-teal-500/30'
                  : 'bg-white border-slate-200 hover:bg-slate-50/80 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono font-semibold text-teal-700">{a.course_code || 'CS201'}</span>
                <span className="text-slate-500 font-mono font-medium">Max: {a.max_marks} pts</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">{a.title}</h3>
              <p className="text-[11px] text-slate-600 line-clamp-2">{a.description}</p>
              <div className="text-[10px] text-slate-500 pt-1 flex items-center gap-1 font-medium">
                <Clock className="h-3 w-3" />
                <span>Deadline: {a.deadline.substring(0, 10)}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Right 2 Columns: Submission view or Teacher review */}
        <div className="lg:col-span-2 space-y-4">
          {selectedAssign && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div>
                <span className="text-xs font-mono font-semibold text-teal-700">{selectedAssign.course_code}</span>
                <h2 className="text-lg font-bold text-slate-900">{selectedAssign.title}</h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedAssign.instructions}</p>
              </div>

              {/* Student Submission Form */}
              {user?.role === 'student' ? (
                <form onSubmit={handleStudentSubmit} className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700">
                    Your Solution Submission Text / Code:
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Paste your source code or write your solution breakdown here..."
                    className="w-full rounded-xl bg-white border border-slate-300 p-3 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
                  />

                  {successMsg && (
                    <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium">
                      {successMsg}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{submitting ? 'Submitting...' : 'Submit Assignment'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Teacher Submissions Review */
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Student Submissions ({submissions.length})
                    </span>
                    <span className="text-[11px] text-teal-700 font-semibold">Human Approval Required</span>
                  </div>

                  <div className="space-y-3">
                    {submissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{sub.student_name}</span>
                            <span className="text-[11px] font-mono text-slate-500">({sub.roll_number})</span>
                            {sub.is_late && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-semibold">
                                Late
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-1 font-mono">{sub.submission_text}</p>
                          <div className="text-[11px] text-teal-700 font-medium">
                            AI Suggested Score: <strong>{sub.ai_suggested_score} / {selectedAssign.max_marks}</strong>
                          </div>
                          {sub.ai_suggested_feedback && (
                            <p className="text-[11px] text-slate-500 italic">{sub.ai_suggested_feedback}</p>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {sub.is_approved ? (
                            <div className="text-right">
                              <span className="text-xs font-bold text-emerald-600 font-mono block">
                                Approved: {sub.score} / {selectedAssign.max_marks}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">Feedback released</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedSub(sub);
                                setGradeScore(sub.ai_suggested_score || 40);
                                setGradeFeedback(sub.ai_suggested_feedback || 'Well done.');
                              }}
                              className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              <span>Approve Grade</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Grade Approval Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-800">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Approve Assignment Grade: {selectedSub.student_name}
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-mono font-medium">
              Roll: {selectedSub.roll_number}
            </p>

            <form onSubmit={handleGradeApprove} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Final Score</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={gradeScore}
                  onChange={(e) => setGradeScore(parseFloat(e.target.value))}
                  className="w-full rounded-xl bg-white border border-slate-300 p-2.5 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Teacher Feedback</label>
                <textarea
                  rows={3}
                  required
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full rounded-xl bg-white border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-2xs transition-colors"
                >
                  Approve & Release Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
