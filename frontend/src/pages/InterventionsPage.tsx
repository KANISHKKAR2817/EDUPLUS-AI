import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Intervention } from '../types';
import { Stethoscope, CheckCircle, Clock, AlertTriangle, ArrowRight, Award, Plus } from 'lucide-react';

export const InterventionsPage: React.FC = () => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getInterventions();
      setInterventions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = interventions.filter((i) => {
    return statusFilter === 'ALL' || i.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-50 via-white to-slate-50 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
              Rule #04 Lifecycle
            </span>
            <span className="text-xs text-slate-500 font-medium">Before-and-After Evidence Tracking</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-teal-600" />
            <span>Targeted Interventions & Learning Verification</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Complete lifecycle: Detect Gap → Formulate Action → Assign → Follow-Up Assessment → Compare Before & After Evidence → Measure True Academic Improvement.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="assigned">Assigned / In Progress</option>
            <option value="completed">Completed & Measured</option>
            <option value="recommended">Recommended</option>
          </select>
        </div>
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
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-teal-800 border border-slate-200">
                      {intv.course_code || 'CS201'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">• Concept: {intv.concept_name}</span>
                    <span className="text-xs text-slate-500 font-medium">• Student: <strong className="text-slate-800">{intv.student_name} ({intv.roll_number})</strong></span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{intv.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                      intv.outcome === 'improved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : intv.outcome === 'pending'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    Outcome: {intv.outcome}
                  </span>
                </div>
              </div>

              {/* Rationale & Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 shadow-2xs">
                  <span className="font-bold text-slate-600 uppercase text-[10px] tracking-wider block">
                    Diagnostic Evidence & Rationale
                  </span>
                  <p className="text-slate-700 leading-relaxed">{intv.rationale}</p>
                  <p className="text-slate-500 text-[11px] font-mono">{intv.evidence_summary}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 shadow-2xs">
                  <span className="font-bold text-slate-600 uppercase text-[10px] tracking-wider block">
                    Targeted Action & Follow-Up Task
                  </span>
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">{intv.recommended_action}</p>
                  <div className="text-[11px] text-teal-700 font-bold pt-1">
                    Follow-up: {intv.follow_up_task}
                  </div>
                </div>
              </div>

              {/* Before and After Accuracy Evidence Bar */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-2xs">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">Baseline Accuracy</span>
                    <span className="text-base font-bold font-mono text-rose-600">
                      {intv.baseline_accuracy}%
                    </span>
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-400" />

                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">Follow-Up Post Assessment</span>
                    <span className="text-base font-bold font-mono text-emerald-600">
                      {intv.follow_up_accuracy !== null && intv.follow_up_accuracy !== undefined
                        ? `${intv.follow_up_accuracy}%`
                        : 'Awaiting Quiz'}
                    </span>
                  </div>

                  {delta !== null && (
                    <div className="border-l border-slate-200 pl-4">
                      <span className="text-slate-500 block text-[11px] font-medium">Measured Delta</span>
                      <span className="text-base font-bold font-mono text-teal-700">
                        +{delta}% Improvement
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-right text-[11px] text-slate-500 font-medium">
                  Created: {intv.created_at.substring(0, 10)} • Status: <span className="capitalize text-slate-800 font-bold">{intv.status}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
