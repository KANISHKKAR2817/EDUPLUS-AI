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
  Award
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
      {/* Student Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-50 via-white to-emerald-50 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
              Student Academic Learning Hub
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Roll: {studentDetail?.roll_number || user?.roll_number || '22CS101'}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {studentDetail?.full_name || user?.full_name || 'Arun Kumar'}!
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
            Here is your real-time learning health overview. Review your concept mastery, complete targeted practice tasks, and receive personalized assistance.
          </p>
        </div>

        {risk && (
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm text-right">
            <span className="text-[11px] font-medium text-slate-500 block">Personal Academic Health</span>
            <div className="mt-1 flex items-center justify-end gap-2">
              <RiskBadge band={risk.band} score={risk.overall_score} size="md" />
            </div>
          </div>
        )}
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cumulative GPA</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {studentDetail?.cgpa || 6.2}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 10.0</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Semester 4 • CSE</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Attendance</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-amber-600">
              {studentDetail?.attendance?.[0]?.percentage || 68.0}%
            </span>
            <span className="text-xs text-amber-700 font-medium font-mono">Benchmark: 75%</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">32 / 40 classes attended</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Support Tasks</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-teal-600">
              {studentDetail?.interventions?.filter((i: any) => i.status !== 'completed').length || 1}
            </span>
            <span className="text-xs text-teal-700 font-medium">Pending Follow-up</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Targeted practice interventions</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Improvements</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-600">
              {studentDetail?.interventions?.filter((i: any) => i.outcome === 'improved').length || 0}
            </span>
            <span className="text-xs text-emerald-700 font-medium">Concept Gaps Resolved</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Backed by post-quiz scores</p>
        </div>
      </div>

      {/* Flagged Support Explanation (Empathetic, Supportive Language) */}
      {risk && risk.band !== 'Low concern' && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50/70 via-white to-teal-50/50 border border-amber-200/80 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">
              How EduPulse is Helping You Prepare For Success
            </h2>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Your recent attendance ({studentDetail?.attendance?.[0]?.percentage || 68}%) and Java Unit Test 1 scores showed areas that could benefit from quick revision. Rather than waiting for semester exams, we’ve highlighted these concepts now so you have ample time to master them and succeed with confidence.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
            {risk.components?.map((c: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs text-xs">
                <span className="text-slate-500 text-[11px] block">{c.name}</span>
                <span className="font-bold text-slate-800 block mt-0.5">{c.raw_metric}</span>
                <span className="text-[10px] text-teal-600 font-semibold mt-1 block">{c.status_label} Signal</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Interventions & Follow-Up Quiz Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              My Targeted Support Tasks & Verification Quizzes
            </h2>
            <p className="text-xs text-slate-500">
              Complete these targeted learning steps to verify mastery and update your performance record
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {studentDetail?.interventions?.map((intv: any) => (
            <div
              key={intv.id}
              className="p-5 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-teal-800">{intv.title}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      intv.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {intv.status === 'completed' ? 'Completed & Verified' : 'Action Required'}
                  </span>
                </div>
                <p className="text-xs text-slate-700">{intv.recommended_action}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span>Baseline Accuracy: <strong className="text-rose-600 font-mono">{intv.baseline_accuracy}%</strong></span>
                  {intv.follow_up_accuracy !== null && (
                    <span>
                      Follow-up Score: <strong className="text-emerald-600 font-mono">{intv.follow_up_accuracy}%</strong>
                    </span>
                  )}
                  {intv.outcome && intv.outcome !== 'pending' && (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Award className="h-3 w-3" />
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
                    className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
                  >
                    <FileCheck className="h-4 w-4" />
                    <span>Attempt Follow-up Quiz</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                    <CheckCircle className="h-4 w-4" />
                    <span>Mastery Verified</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Concept Mastery Progress */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Concept Mastery Tracker
            </h2>
            <p className="text-xs text-slate-500">
              Calculated from question-level attempts across all continuous assessments
            </p>
          </div>
          <button
            onClick={() => navigate('/ai-tutor')}
            className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1.5"
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Ask AI Tutor to Explain Weak Concepts</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {conceptMastery.map((conc) => {
            const pct = conc.accuracy_percentage;
            let barColor = 'bg-emerald-500';
            if (pct < 50) barColor = 'bg-rose-500';
            else if (pct < 75) barColor = 'bg-amber-500';

            return (
              <div key={conc.concept_id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-xs text-slate-900">{conc.concept_name}</span>
                    <span className="text-[10px] text-slate-500 block">{conc.course_code}: {conc.course_title}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-800">{pct}%</span>
                </div>

                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} transition-all duration-300`} style={{ width: `${pct}%` }} />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>{conc.correct_attempts} / {conc.total_attempts} questions correct</span>
                  <span className={conc.needs_intervention ? 'text-amber-700 font-semibold' : 'text-slate-500'}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Follow-Up Verification Quiz: Java Arrays
                </h3>
                <p className="text-xs text-slate-500">
                  Demonstrate understanding to update intervention outcome from 0% baseline
                </p>
              </div>
              <button
                onClick={() => setActiveQuizIntv(null)}
                className="text-slate-500 hover:text-slate-800 text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>

            {!quizSubmitted ? (
              <form onSubmit={handleQuizSubmit} className="py-4 space-y-5">
                {followUpQuizQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <span className="text-xs font-semibold text-slate-900 block">
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
                              ? 'bg-teal-50 border-teal-600 text-teal-800 font-semibold ring-1 ring-teal-600'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
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
                    className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                  >
                    Submit Quiz & Record Evidence
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Congratulations! Learning Improvement Verified
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-md mx-auto space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Baseline Assessment:</span>
                    <span className="text-rose-600 font-mono font-bold">{quizResult?.baseline_accuracy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Follow-up Quiz Score:</span>
                    <span className="text-emerald-600 font-mono font-bold">{quizResult?.follow_up_accuracy}%</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5">
                    <span className="text-slate-500">Improvement Delta:</span>
                    <span className="text-teal-700 font-mono font-bold">+{quizResult?.delta}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Official Intervention Status:</span>
                    <span className="text-emerald-700 font-bold uppercase">{quizResult?.outcome}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your updated before-and-after learning evidence has been logged and is now visible on your teacher’s audit trail!
                </p>
                <button
                  onClick={() => setActiveQuizIntv(null)}
                  className="px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors"
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
