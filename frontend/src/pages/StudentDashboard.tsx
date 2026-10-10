import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { RiskBadge } from '../components/RiskBadge';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Target,
  Bot,
  HelpCircle,
  FileCheck,
  Award,
  Activity,
  Layers,
  GraduationCap
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [studentDetail, setStudentDetail] = useState<any>(null);
  const [conceptMastery, setConceptMastery] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Follow-up quiz state
  const [activeQuizIntv, setActiveQuizIntv] = useState<any | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<any | null>(null);

  const studentId = user?.student_id || 1; // default to Arun Kumar if demo

  const loadData = async () => {
    setLoading(true);
    try {
      const [detail, mastery] = await Promise.all([
        api.getStudentDetail(studentId),
        api.getConceptMastery(studentId),
      ]);
      setStudentDetail(detail);
      setConceptMastery(mastery);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const followUpQuizQuestions = [
    {
      id: 1,
      q: 'What is the maximum valid index of an array declared with "int[] data = new int[8]"?',
      options: ['8', '7', '0', '9'],
      correct: '7'
    },
    {
      id: 2,
      q: 'Which exception is thrown if you access index -1 or index >= length in Java?',
      options: ['NullPointerException', 'ArrayIndexOutOfBoundsException', 'IllegalArgumentException', 'ArithmeticException'],
      correct: 'ArrayIndexOutOfBoundsException'
    },
    {
      id: 3,
      q: 'Where are Java array object elements allocated in JVM memory?',
      options: ['Contiguously on the Heap', 'Stack frame memory', 'Method area segment', 'Random registers'],
      correct: 'Contiguously on the Heap'
    },
    {
      id: 4,
      q: 'Which condition correctly iterates through all elements of array "arr" without error?',
      options: ['for(int i=0; i<=arr.length; i++)', 'for(int i=0; i<arr.length; i++)', 'for(int i=1; i<arr.length; i++)', 'for(int i=0; i<arr.size(); i++)'],
      correct: 'for(int i=0; i<arr.length; i++)'
    },
    {
      id: 5,
      q: 'What is the default value of numeric elements in a newly instantiated int array in Java?',
      options: ['null', '0', '-1', 'garbage value'],
      correct: '0'
    }
  ];

  const handleQuizAnswer = (qId: number, option: string) => {
    setQuizAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuizIntv) return;

    let correctCount = 0;
    followUpQuizQuestions.forEach((q) => {
      if (quizAnswers[q.id] === q.correct) {
        correctCount += 1;
      }
    });

    try {
      const res = await api.submitFollowupQuiz(
        activeQuizIntv.id,
        correctCount,
        followUpQuizQuestions.length
      );
      setQuizResult(res);
      setQuizSubmitted(true);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const risk = studentDetail?.risk_summary;

  return (
    <div className="space-y-6">
      {/* Student Welcome Header Card */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              Student Adaptive Learning Hub
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Roll: {studentDetail?.roll_number || user?.roll_number || '22CS101'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome back, {studentDetail?.full_name || user?.full_name || 'Arun Kumar'}!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track your concept mastery in real-time, complete targeted remedial exercises, and maintain exam readiness.
          </p>
        </div>

        {risk && (
          <div className="flex items-center gap-3 shrink-0 p-3 rounded-xl glass-card border border-slate-200/80 dark:border-white/10">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Academic Health:</span>
            <RiskBadge band={risk.band} score={risk.overall_score} size="md" />
          </div>
        )}
      </div>

      {/* 4 Glassmorphic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-xs hover:border-cyan-500/40 transition-all">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cumulative GPA</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
              {studentDetail?.cgpa || 6.2}
            </span>
            <span className="text-xs text-slate-400">/ 10.0</span>
          </div>
          <div className="mt-2 text-[11px] text-cyan-600 dark:text-cyan-400 font-medium flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>Target: 7.50+ by Semester End</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-xs hover:border-amber-500/40 transition-all">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current Attendance</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
              {studentDetail?.attendance?.[0]?.percentage || 68.0}%
            </span>
            <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">Min: 75% Required</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            3 more classes needed to reach 75%
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-xs hover:border-cyan-500/40 transition-all">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Tasks</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-cyan-600 dark:text-cyan-400">
              {studentDetail?.interventions?.filter((i: any) => i.status !== 'completed').length || 1}
            </span>
            <span className="text-xs text-cyan-700 dark:text-cyan-300 font-medium">Verification Pending</span>
          </div>
          <div className="mt-2 text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
            Complete to clear academic warning
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-xs hover:border-emerald-500/40 transition-all">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mastery Verified</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {studentDetail?.interventions?.filter((i: any) => i.outcome === 'improved').length || 0}
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Gaps Resolved</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Auditable evidence stored
          </div>
        </div>
      </div>

      {/* Active Interventions & Follow-Up Quiz Section */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-cyan-500" />
              <span>Targeted Remedial Tasks & Verification Quizzes</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete these targeted practice tasks to demonstrate improvement and automatically clear your risk flag.
            </p>
          </div>
          <button
            onClick={() => navigate('/ai-tutor')}
            className="px-3.5 py-1.5 rounded-xl glass-card border border-cyan-500/30 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Bot className="h-4 w-4" />
            <span>Consult AI Tutor</span>
          </button>
        </div>

        <div className="space-y-3">
          {studentDetail?.interventions?.map((intv: any) => (
            <div
              key={intv.id}
              className="p-5 rounded-xl glass-card border border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{intv.title}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                      intv.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {intv.status === 'completed' ? 'Verified Improved' : 'Action Required'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{intv.recommended_action}</p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span>Baseline: <strong className="text-rose-600 dark:text-rose-400 font-mono">{intv.baseline_accuracy}%</strong></span>
                  {intv.follow_up_accuracy !== null && (
                    <span>
                      Follow-up Score: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{intv.follow_up_accuracy}%</strong>
                    </span>
                  )}
                  {intv.outcome && intv.outcome !== 'pending' && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      Outcome: {intv.outcome.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <div>
                {intv.status !== 'completed' ? (
                  <button
                    onClick={() => {
                      setActiveQuizIntv(intv);
                      setQuizSubmitted(false);
                      setQuizAnswers({});
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all flex items-center gap-1.5"
                  >
                    <FileCheck className="h-4 w-4" />
                    <span>Attempt Verification Quiz</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle className="h-4 w-4" />
                    <span>Mastery Verified</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Concept Mastery Tracker */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-md space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-violet-500" />
            <span>Concept Mastery Overview</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dynamically computed from lab assessments, unit tests, and continuous evaluations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {conceptMastery.map((conc) => {
            const pct = conc.accuracy_percentage;
            let barColor = 'bg-gradient-to-r from-emerald-500 to-teal-400';
            if (pct < 50) barColor = 'bg-gradient-to-r from-rose-500 to-orange-400';
            else if (pct < 75) barColor = 'bg-gradient-to-r from-amber-500 to-yellow-400';

            return (
              <div key={conc.concept_id} className="p-4 rounded-xl glass-card border border-slate-200/80 dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">{conc.concept_name}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{conc.course_code}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{pct}%</span>
                </div>

                <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} transition-all duration-300`} style={{ width: `${pct}%` }} />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                  <span>{conc.correct_attempts} / {conc.total_attempts} correct</span>
                  <span className={conc.needs_intervention ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-400'}>
                    {conc.recent_performance}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Follow-up Quiz Modal */}
      {activeQuizIntv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl glass-panel rounded-2xl shadow-2xl p-6 text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto border border-slate-200/80 dark:border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-white/10">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Follow-Up Verification Quiz: Java Arrays
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Demonstrate understanding to update intervention outcome from 0% baseline
                </p>
              </div>
              <button
                onClick={() => setActiveQuizIntv(null)}
                className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 transition-colors font-medium"
              >
                Close
              </button>
            </div>

            {!quizSubmitted ? (
              <form onSubmit={handleQuizSubmit} className="py-4 space-y-5">
                {followUpQuizQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl glass-card border border-slate-200/80 dark:border-white/10 space-y-2.5">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                      {idx + 1}. {q.q}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleQuizAnswer(q.id, opt)}
                          className={`p-2.5 rounded-lg text-left text-xs transition-colors border ${
                            quizAnswers[q.id] === opt
                              ? 'bg-cyan-500/15 border-cyan-500 text-cyan-600 dark:text-cyan-300 font-semibold ring-1 ring-cyan-500'
                              : 'bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={Object.keys(quizAnswers).length < followUpQuizQuestions.length}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all disabled:opacity-50"
                  >
                    Submit Quiz & Record Evidence
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Congratulations! Learning Improvement Verified
                </h3>
                <div className="p-4 rounded-xl glass-card border border-slate-200/80 dark:border-white/10 max-w-md mx-auto space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Baseline Assessment:</span>
                    <span className="text-rose-600 dark:text-rose-400 font-mono font-bold">{quizResult?.baseline_accuracy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Follow-up Quiz Score:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{quizResult?.follow_up_accuracy}%</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/60 dark:border-white/10 pt-1.5">
                    <span className="text-slate-500 dark:text-slate-400">Improvement Delta:</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-mono font-bold">+{quizResult?.delta}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Official Intervention Status:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">{quizResult?.outcome}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Your updated before-and-after learning evidence has been logged and is now visible on your teacher’s audit trail!
                </p>
                <button
                  onClick={() => setActiveQuizIntv(null)}
                  className="px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
