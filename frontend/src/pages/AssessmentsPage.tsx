import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { ClipboardList, CheckCircle2, HelpCircle, Calendar, BookOpen } from 'lucide-react';

export const AssessmentsPage: React.FC = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getAssessments()
      .then(setAssessments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-50 via-white to-slate-50 border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
            Assessment & Question Mapping
          </span>
          <span className="text-xs text-slate-500 font-medium">Continuous Assessment Cycle</span>
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-teal-600" />
          <span>Assessments & Concept-Mapped Questions</span>
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Each examination question is mapped to explicit syllabus concepts, driving accurate, fine-grained diagnosis of student learning gaps.
        </p>
      </div>

      {/* Assessments List */}
      <div className="space-y-6">
        {assessments.map((ass) => (
          <div
            key={ass.id}
            className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-teal-800 border border-slate-200">
                    {ass.course_code}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">{ass.course_title}</span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1">{ass.title}</h2>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
                <span>Max: <strong className="text-slate-900">{ass.max_marks}</strong></span>
                <span>Pass: <strong className="text-teal-700">{ass.passing_marks}</strong></span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  {ass.date_conducted.substring(0, 10)}
                </span>
              </div>
            </div>

            {/* Questions Table */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Mapped Examination Questions
              </span>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Question Statement</th>
                      <th className="py-2.5 px-3 font-semibold">Type</th>
                      <th className="py-2.5 px-3 font-semibold">Mapped Concepts</th>
                      <th className="py-2.5 px-3 font-semibold">Marks</th>
                      <th className="py-2.5 px-3 text-right font-semibold">Cohort Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {ass.questions.map((q: any) => (
                      <tr key={q.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-medium text-slate-900 max-w-sm">
                          {q.question_text}
                        </td>
                        <td className="py-2.5 px-3 uppercase text-[10px] font-mono text-slate-500 font-medium">
                          {q.question_type}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex flex-wrap gap-1">
                            {q.concepts.map((cName: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-semibold"
                              >
                                {cName}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-700 font-medium">{q.max_marks}</td>
                        <td className="py-2.5 px-3 font-mono text-right font-bold">
                          <span
                            className={
                              q.cohort_accuracy < 50
                                ? 'text-rose-600'
                                : q.cohort_accuracy < 75
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }
                          >
                            {q.cohort_accuracy}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
