import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Intervention, StudentSummary } from '../types';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Award,
  Plus,
  UserCheck,
  Eye,
  CheckCircle2,
  Calendar,
  Sparkles,
  Filter,
  X,
  Target,
  FileCheck
} from 'lucide-react';

export const InterventionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State for "Create Intervention"
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(1);
  const [intvTitle, setIntvTitle] = useState<string>('Targeted Practice: Java Arrays & Memory Model');
  const [intvRationale, setIntvRationale] = useState<string>('Student scored <50% in Continuous Assessment on Arrays, indicating foundational gap.');
  const [intvEvidence, setIntvEvidence] = useState<string>('Assessment Score: 40% (Passing benchmark: 50%)');
  const [intvAction, setIntvAction] = useState<string>('Assign practice problem set on array indexing and bounds checking. Schedule 1:1 consultation.');
  const [intvFollowUp, setIntvFollowUp] = useState<string>('Post-remedial quiz on array boundary validation');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [intvs, studs] = await Promise.all([
        api.getInterventions(),
        api.getStudents()
      ]);
      setInterventions(intvs);
      setStudents(studs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createIntervention({
        student_id: Number(selectedStudentId),
        concept_id: 1, // Java Arrays
        course_id: 1,  // CS201
        title: intvTitle,
        rationale: intvRationale,
        evidence_summary: intvEvidence,
        recommended_action: intvAction,
        follow_up_task: intvFollowUp,
      });
      showToast('Intervention created successfully and logged in institutional audit trail!');
      setIsCreateOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create intervention');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignMentor = async (id: number, studentName: string) => {
    try {
      await api.updateIntervention(id, {
        status: 'assigned',
        teacher_notes: 'Assigned to Dr. Kavitha Raman (Faculty Mentor)'
      });
      showToast(`Mentor Dr. Kavitha Raman assigned to ${studentName}`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign mentor');
    }
  };

  const handleMarkReviewed = async (id: number) => {
    try {
      await api.updateIntervention(id, {
        status: 'in_progress',
        teacher_notes: 'Faculty review completed. Remedial material distributed.'
      });
      showToast('Intervention marked as Reviewed and active in progress!');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to mark as reviewed');
    }
  };

  const filtered = interventions.filter((i) => {
    return statusFilter === 'ALL' || i.status === statusFilter;
  });

  // Overview metrics
  const totalCount = interventions.length;
  const verifiedCount = interventions.filter((i) => i.outcome === 'improved').length;
  const pendingCount = interventions.filter((i) => i.status !== 'completed').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl glass-panel border border-cyan-500/40 text-cyan-700 dark:text-cyan-300 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="h-5 w-5 text-cyan-500" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              AI Early Intervention Engine
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Before-and-After Verified Evidence</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-cyan-500" />
            <span>Targeted Interventions & Remedial Action Center</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Formulate personalized pedagogical actions for flagged learners. Track progress from gap detection through 1-on-1 mentoring, remedial exercises, and verified post-assessment improvement.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/25 transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Intervention</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Formulated Interventions</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">{totalCount}</span>
            <span className="text-xs text-slate-400">cohort-wide</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Verification</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400">{pendingCount}</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Needs Attention</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Measured Improvement Verified</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">{verifiedCount}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Audit Proof Stored</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between p-3 rounded-2xl glass-card border border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Filter className="h-4 w-4 text-cyan-500" />
          <span>Filter Status:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">All Statuses ({interventions.length})</option>
          <option value="assigned">Assigned / In Progress</option>
          <option value="completed">Completed & Verified</option>
          <option value="recommended">Recommended</option>
        </select>
      </div>

      {/* Interventions Lifecycle Cards */}
      <div className="space-y-4">
        {filtered.map((intv) => {
          const delta = intv.follow_up_accuracy !== null && intv.follow_up_accuracy !== undefined
            ? Math.round(intv.follow_up_accuracy - intv.baseline_accuracy)
            : null;

          return (
            <div
              key={intv.id}
              className="p-6 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-md space-y-4 hover:border-cyan-500/30 transition-all"
            >
              {/* Card Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-white/10">
                      {intv.course_code || 'CS201'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">• Concept: {intv.concept_name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">• Student: <strong className="text-slate-900 dark:text-white">{intv.student_name} ({intv.roll_number})</strong></span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">{intv.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${
                      intv.outcome === 'improved'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : intv.outcome === 'pending'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                    }`}
                  >
                    Outcome: {intv.outcome}
                  </span>
                </div>
              </div>

              {/* Rationale & Action Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl glass-card border border-slate-200/80 dark:border-white/10 space-y-1.5">
                  <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider block">
                    Diagnostic Evidence & Rationale
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{intv.rationale}</p>
                  <p className="text-cyan-600 dark:text-cyan-400 text-[11px] font-mono">{intv.evidence_summary}</p>
                </div>

                <div className="p-4 rounded-xl glass-card border border-slate-200/80 dark:border-white/10 space-y-1.5">
                  <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider block">
                    Targeted Action & Follow-Up Task
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">{intv.recommended_action}</p>
                  <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold pt-1">
                    Follow-up: {intv.follow_up_task}
                  </div>
                </div>
              </div>

              {/* Evidence Bar & Action Buttons */}
              <div className="p-4 rounded-xl glass-card border border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Baseline Accuracy</span>
                    <span className="text-base font-black font-mono text-rose-600 dark:text-rose-400">
                      {intv.baseline_accuracy}%
                    </span>
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-400" />

                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Post-Intervention Score</span>
                    <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {intv.follow_up_accuracy !== null && intv.follow_up_accuracy !== undefined
                        ? `${intv.follow_up_accuracy}%`
                        : 'Awaiting Quiz'}
                    </span>
                  </div>

                  {delta !== null && (
                    <div className="border-l border-slate-200 dark:border-white/10 pl-4">
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Measured Delta</span>
                      <span className="text-base font-black font-mono text-cyan-600 dark:text-cyan-400">
                        +{delta}% Improvement
                      </span>
                    </div>
                  )}
                </div>

                {/* Meaningful Action Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleAssignMentor(intv.id, intv.student_name || 'Student')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <UserCheck className="h-3.5 w-3.5 text-cyan-500" />
                    <span>Assign Mentor</span>
                  </button>

                  <button
                    onClick={() => handleMarkReviewed(intv.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Mark as Reviewed</span>
                  </button>

                  <button
                    onClick={() => navigate(`/students/${intv.student_id}`)}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Track Progress</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Intervention Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg glass-panel rounded-2xl shadow-2xl p-6 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Formulate Targeted Academic Intervention
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Rule #04: Concrete pedagogical action tied to evidence
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Target Student
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id} className="text-black dark:text-white dark:bg-slate-900">
                      {s.full_name} ({s.roll_number}) — Risk: {s.overall_risk}% ({s.risk_band})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Intervention Title
                </label>
                <input
                  type="text"
                  required
                  value={intvTitle}
                  onChange={(e) => setIntvTitle(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Evidence Rationale
                </label>
                <input
                  type="text"
                  required
                  value={intvRationale}
                  onChange={(e) => setIntvRationale(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Targeted Action / Remedial Plan
                </label>
                <textarea
                  required
                  rows={2}
                  value={intvAction}
                  onChange={(e) => setIntvAction(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Follow-Up Verification Task
                </label>
                <input
                  type="text"
                  required
                  value={intvFollowUp}
                  onChange={(e) => setIntvFollowUp(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/25 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Launch Intervention'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
