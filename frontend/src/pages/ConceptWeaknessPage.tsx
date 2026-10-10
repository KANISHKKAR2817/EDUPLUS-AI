import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Course, StudentSummary } from '../types';
import { Target, Stethoscope, Plus, CheckCircle, AlertTriangle, ArrowRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ConceptWeaknessPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(1); // Arun Kumar
  const [masteryData, setMasteryData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Create intervention modal state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [targetConcept, setTargetConcept] = useState<any | null>(null);
  const [intvTitle, setIntvTitle] = useState('');
  const [intvRationale, setIntvRationale] = useState('');
  const [intvAction, setIntvAction] = useState('');
  const [intvFollowup, setIntvFollowup] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesData, studentsData, mastery] = await Promise.all([
        api.getCourses(),
        api.getStudents(),
        api.getConceptMastery(selectedStudentId),
      ]);
      setCourses(coursesData);
      setStudents(studentsData);
      setMasteryData(mastery);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStudentId]);

  const handleOpenCreateModal = (conc: any) => {
    setTargetConcept(conc);
    setIntvTitle(`Targeted Practice: ${conc.concept_name}`);
    setIntvRationale(`Student scored ${conc.accuracy_percentage}% on questions assessing ${conc.concept_name}.`);
    setIntvAction(`1. Review lecture notes on ${conc.concept_name}.\n2. Solve 5 guided practice tracing problems.\n3. Complete follow-up assessment.`);
    setIntvFollowup(`Complete 5-question verification post-quiz on ${conc.concept_name} with >75% accuracy.`);
    setShowCreateModal(true);
  };

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetConcept) return;

    try {
      await api.createIntervention({
        student_id: selectedStudentId,
        concept_id: targetConcept.concept_id,
        course_id: 1,
        title: intvTitle,
        rationale: intvRationale,
        evidence_summary: `${targetConcept.correct_attempts} / ${targetConcept.total_attempts} questions correct (${targetConcept.accuracy_percentage}% accuracy).`,
        recommended_action: intvAction,
        follow_up_task: intvFollowup,
      });
      setShowCreateModal(false);
      navigate('/interventions');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-50 via-white to-slate-50 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
              Rule #04 Engine
            </span>
            <span className="text-xs text-slate-500 font-medium">Question-Level Performance Analysis</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="h-6 w-6 text-teal-600" />
            <span>Concept Gap Matrix & Early Support</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Identifies specific learning gaps by mapping assessment questions directly to syllabus concepts.
            Formulate targeted interventions before end-semester examinations.
          </p>
        </div>

        {/* Student Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Select Student:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(parseInt(e.target.value, 10))}
            className="rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
          >
            {students.slice(0, 15).map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.roll_number})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Concept Matrix Grid */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Syllabus Concept Accuracy Matrix
          </h2>
          <span className="text-xs text-slate-500 font-mono font-medium">
            {masteryData.length} Syllabus Concepts Monitored
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {masteryData.map((conc) => {
            const isWeak = conc.needs_intervention || conc.accuracy_percentage < 60;
            return (
              <div
                key={conc.concept_id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isWeak
                    ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-teal-800 border border-slate-200">
                      {conc.course_code}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isWeak
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isWeak ? 'Concept Gap' : 'Mastered'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{conc.concept_name}</h3>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{conc.recommended_action}</p>

                  <div className="mt-4 p-3 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Accuracy:</span>
                      <span
                        className={`font-mono font-bold ${
                          isWeak ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {conc.accuracy_percentage}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isWeak ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${conc.accuracy_percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{conc.correct_attempts} / {conc.total_attempts} correct</span>
                      <span>{conc.data_sufficiency}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 mt-4 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenCreateModal(conc)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isWeak
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Intervention</span>
                  </button>

                  <button
                    onClick={() => navigate('/study-materials')}
                    className="text-xs text-slate-500 hover:text-teal-700 font-medium flex items-center gap-1 transition-colors"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Material</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Intervention Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-800">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Formulate Targeted Learning Intervention
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Concept: {targetConcept?.concept_name}
            </p>

            <form onSubmit={handleCreateIntervention} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={intvTitle}
                  onChange={(e) => setIntvTitle(e.target.value)}
                  className="w-full rounded-xl bg-white border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Evidence & Rationale</label>
                <textarea
                  rows={2}
                  required
                  value={intvRationale}
                  onChange={(e) => setIntvRationale(e.target.value)}
                  className="w-full rounded-xl bg-white border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Recommended Learning Action</label>
                <textarea
                  rows={3}
                  required
                  value={intvAction}
                  onChange={(e) => setIntvAction(e.target.value)}
                  className="w-full rounded-xl bg-white border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Measurable Follow-Up Task</label>
                <input
                  type="text"
                  required
                  value={intvFollowup}
                  onChange={(e) => setIntvFollowup(e.target.value)}
                  className="w-full rounded-xl bg-white border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-2xs transition-colors"
                >
                  Assign Intervention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
