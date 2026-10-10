import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { StudentDetail } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { WhyFlaggedModal } from '../components/WhyFlaggedModal';
import { AlertReviewModal } from '../components/AlertReviewModal';
import {
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  HelpCircle,
  Calendar,
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  BookOpen,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const studentId = parseInt(id || '1', 10);

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [recalculating, setRecalculating] = useState<boolean>(false);

  const [showWhyModal, setShowWhyModal] = useState<boolean>(false);
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);

  const loadStudent = async () => {
    setLoading(true);
    try {
      const data = await api.getStudentDetail(studentId);
      setStudent(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudent();
  }, [studentId]);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await api.recalculateRisk(studentId);
      await loadStudent();
    } catch (err) {
      console.error(err);
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 dark:text-slate-400">Loading student academic profile...</span>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-3">
        <p>Student record not found.</p>
        <button
          onClick={() => navigate('/students')}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs text-white shadow-md font-semibold"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  const risk = student.risk_summary;

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-cyan-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Students List</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWhyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
            <span>Why Flagged?</span>
          </button>
          <button
            onClick={() => setShowAlertModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:border-cyan-500/40 transition-colors shadow-2xs"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-500" />
            <span>False-Alarm Review</span>
          </button>
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/25 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${recalculating ? 'animate-spin' : ''}`} />
            <span>Recalculate Score</span>
          </button>
        </div>
      </div>

      {/* Student Profile Identity Card */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-violet-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-white/20">
            {student.full_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-slate-900 dark:text-white">{student.full_name}</h1>
              <RiskBadge band={risk.band} score={risk.overall_score} size="md" />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>Roll: <strong className="text-slate-900 dark:text-white font-mono">{student.roll_number}</strong></span>
              <span>•</span>
              <span>{student.department}</span>
              <span>•</span>
              <span>Semester {student.semester}</span>
              <span>•</span>
              <span>CGPA: <strong className="text-cyan-600 dark:text-cyan-400 font-mono">{student.cgpa}</strong></span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card border border-slate-200/80 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 space-y-1 md:text-right">
          <div>Calculation Engine: <strong className="text-slate-900 dark:text-white">Rule #01 v1.0</strong></div>
          <div>Snapshot: <strong className="text-slate-800 dark:text-slate-200 font-mono">{risk.calculated_at.substring(0, 10)}</strong></div>
          <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">Decision-Support Indicator Only</div>
        </div>
      </div>

      {/* Auditable 4-Factor Breakdown */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-md space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-500" />
            <span>Auditable Multi-Signal Factor Breakdown</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Formula: Risk Score = (0.25 × Attendance) + (0.35 × Assessment) + (0.20 × Assignment) + (0.20 × Trend)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {risk.components.map((c, i) => (
            <div key={i} className="p-4 rounded-xl glass-card border border-slate-200/80 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{c.name}</span>
                <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                  +{c.weighted_contribution} pts
                </span>
              </div>
              <div className="font-black text-lg text-slate-900 dark:text-white font-mono">{c.raw_metric}</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{c.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance & Attempts Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Attendance Records */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-md space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-cyan-500" />
            <span>Course-wise Attendance Records</span>
          </h3>

          <div className="border border-slate-200/80 dark:border-white/10 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-white/10">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Course</th>
                  <th className="py-2.5 px-3 font-semibold">Attended</th>
                  <th className="py-2.5 px-3 font-semibold">Percentage</th>
                  <th className="py-2.5 px-3 font-semibold">Recent Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/5 bg-white/40 dark:bg-black/20">
                {student.attendance.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                      {att.course_code}: {att.course_title}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                      {att.classes_attended} / {att.total_classes}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span
                        className={
                          att.percentage < 75 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'
                        }
                      >
                        {att.percentage}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 capitalize text-slate-600 dark:text-slate-300 font-medium">{att.recent_trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Question-Level Attempt History */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-md space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-violet-500" />
            <span>Continuous Assessment Attempts</span>
          </h3>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {student.attempts.map((att) => (
              <div
                key={att.id}
                className="p-3 rounded-xl glass-card border border-slate-200/80 dark:border-white/10 text-xs flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 max-w-[280px]">
                  <span className="font-semibold text-slate-900 dark:text-white block truncate">{att.question_text}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{att.assessment_title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {att.is_correct ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      +{att.marks_obtained}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-mono text-xs font-bold">
                      <XCircle className="h-3.5 w-3.5" />
                      0 / {att.max_marks}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interventions & Follow-up Evidence */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-md space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="h-4 w-4 text-cyan-500" />
          <span>Intervention History & Measured Learning Evidence</span>
        </h3>

        <div className="space-y-3">
          {student.interventions.map((intv) => (
            <div
              key={intv.id}
              className="p-4 rounded-xl glass-card border border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <span className="font-bold text-slate-900 dark:text-white text-sm">{intv.title}</span>
                <p className="text-slate-600 dark:text-slate-300">{intv.recommended_action}</p>
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span>Concept: <strong className="text-slate-900 dark:text-white">{intv.concept_name}</strong></span>
                  <span>Baseline: <strong className="text-rose-600 dark:text-rose-400 font-mono">{intv.baseline_accuracy}%</strong></span>
                  {intv.follow_up_accuracy !== null && (
                    <span>Follow-up: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{intv.follow_up_accuracy}%</strong></span>
                  )}
                  <span>Status: <strong className="text-cyan-600 dark:text-cyan-400 capitalize">{intv.status}</strong></span>
                </div>
              </div>

              {intv.outcome && (
                <div className="shrink-0 text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      intv.outcome === 'improved'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }`}
                  >
                    Outcome: {intv.outcome}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <WhyFlaggedModal
        studentId={student.id}
        isOpen={showWhyModal}
        onClose={() => setShowWhyModal(false)}
      />

      <AlertReviewModal
        studentId={student.id}
        studentName={student.full_name}
        rollNumber={student.roll_number}
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        onSuccess={loadStudent}
      />
    </div>
  );
};
