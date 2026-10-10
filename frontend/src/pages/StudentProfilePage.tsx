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
  BookOpen
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
        <div className="h-8 w-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400">Loading student academic profile...</span>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-3">
        <p>Student record not found.</p>
        <button
          onClick={() => navigate('/students')}
          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-white shadow-2xs font-semibold"
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
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Students List</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWhyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5 text-amber-600" />
            <span>Why Flagged?</span>
          </button>
          <button
            onClick={() => setShowAlertModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
            <span>False-Alarm Review</span>
          </button>
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${recalculating ? 'animate-spin' : ''}`} />
            <span>Recalculate Score</span>
          </button>
        </div>
      </div>

      {/* Student Profile Identity Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-teal-600 text-white font-bold text-2xl flex items-center justify-center shadow-sm">
            {student.full_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{student.full_name}</h1>
              <RiskBadge band={risk.band} score={risk.overall_score} size="md" />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
              <span>Roll: <strong className="text-slate-900 font-mono">{student.roll_number}</strong></span>
              <span>•</span>
              <span>{student.department}</span>
              <span>•</span>
              <span>Semester {student.semester}</span>
              <span>•</span>
              <span>CGPA: <strong className="text-teal-700 font-mono">{student.cgpa}</strong></span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1 md:text-right">
          <div>Institutional Calculation Engine: <strong className="text-slate-900">Rule #01 v1.0</strong></div>
          <div>Snapshot Timestamp: <strong className="text-slate-800 font-mono">{risk.calculated_at.substring(0, 10)}</strong></div>
          <div className="text-[11px] text-teal-700 font-medium">Decision-Support Indicator Only</div>
        </div>
      </div>

      {/* Auditable 4-Factor Breakdown */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Auditable Multi-Signal Factor Breakdown
          </h2>
          <p className="text-xs text-slate-500">
            Formula: Risk Score = (0.25 × Attendance) + (0.35 × Assessment) + (0.20 × Assignment) + (0.20 × Trend)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {risk.components.map((c, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">{c.name}</span>
                <span className="text-[11px] font-mono text-teal-700 font-bold">
                  +{c.weighted_contribution} pts
                </span>
              </div>
              <div className="font-bold text-base text-slate-900 font-mono">{c.raw_metric}</div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{c.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance & Attempts Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Attendance Records */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-teal-600" />
            <span>Course-wise Attendance Records</span>
          </h3>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Course</th>
                  <th className="py-2.5 px-3 font-semibold">Attended</th>
                  <th className="py-2.5 px-3 font-semibold">Percentage</th>
                  <th className="py-2.5 px-3 font-semibold">Recent Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {student.attendance.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {att.course_code}: {att.course_title}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {att.classes_attended} / {att.total_classes}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span
                        className={
                          att.percentage < 75 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'
                        }
                      >
                        {att.percentage}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 capitalize text-slate-600 font-medium">{att.recent_trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Question-Level Attempt History */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-teal-600" />
            <span>Continuous Assessment Attempts</span>
          </h3>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {student.attempts.map((att) => (
              <div
                key={att.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 max-w-[280px]">
                  <span className="font-semibold text-slate-900 block truncate">{att.question_text}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{att.assessment_title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {att.is_correct ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-mono text-xs font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      +{att.marks_obtained}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-600 font-mono text-xs font-bold">
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
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Award className="h-4 w-4 text-teal-600" />
          <span>Intervention History & Measured Learning Evidence</span>
        </h3>

        <div className="space-y-3">
          {student.interventions.map((intv) => (
            <div
              key={intv.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <span className="font-bold text-slate-900 text-sm">{intv.title}</span>
                <p className="text-slate-600">{intv.recommended_action}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span>Concept: <strong className="text-slate-800">{intv.concept_name}</strong></span>
                  <span>Baseline: <strong className="text-rose-600 font-mono">{intv.baseline_accuracy}%</strong></span>
                  {intv.follow_up_accuracy !== null && (
                    <span>Follow-up: <strong className="text-emerald-600 font-mono">{intv.follow_up_accuracy}%</strong></span>
                  )}
                  <span>Status: <strong className="text-teal-700 capitalize">{intv.status}</strong></span>
                </div>
              </div>

              {intv.outcome && (
                <div className="shrink-0 text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      intv.outcome === 'improved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
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
