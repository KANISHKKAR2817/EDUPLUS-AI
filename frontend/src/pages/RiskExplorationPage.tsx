import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { HelpCircle, ShieldCheck, CheckCircle, Info, Scale, AlertOctagon, RotateCcw } from 'lucide-react';

export const RiskExplorationPage: React.FC = () => {
  const [explanation, setExplanation] = useState<any | null>(null);
  const [alertReviews, setAlertReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([api.getGlobalExplanation(), api.getAlertReviews()])
      .then(([exp, revs]) => {
        setExplanation(exp);
        setAlertReviews(revs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-50 via-white to-slate-50 border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
            Rule #01, #03 & #05 Governance
          </span>
          <span className="text-xs text-slate-500 font-medium">Transparent & Auditable Decision-Support</span>
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Scale className="h-6 w-6 text-teal-600" />
          <span>Global Risk Model Explainability & Safeguards</span>
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
          EduPulse AI uses a fully transparent, auditable 4-factor formula. We strictly reject black-box scoring and ensure every flagged alert is explained with real stored evidence.
        </p>
      </div>

      {explanation && (
        <div className="space-y-6">
          {/* Scoring Formula Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Configured Multi-Signal Formula</h2>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-sm text-teal-800 font-semibold shadow-2xs">
              {explanation.formula_string}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">Attendance Concern</span>
                <span className="text-xl font-bold font-mono text-slate-900 block">
                  {explanation.component_weights.attendance * 100}%
                </span>
                <p className="text-[11px] text-slate-500">Benchmark: 75% institutional requirement</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">Assessment Concern</span>
                <span className="text-xl font-bold font-mono text-slate-900 block">
                  {explanation.component_weights.assessment * 100}%
                </span>
                <p className="text-[11px] text-slate-500">Continuous test score averages</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">Assignment Concern</span>
                <span className="text-xl font-bold font-mono text-slate-900 block">
                  {explanation.component_weights.assignment * 100}%
                </span>
                <p className="text-[11px] text-slate-500">Missing assignments & late submissions</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">Trend Trajectory</span>
                <span className="text-xl font-bold font-mono text-slate-900 block">
                  {explanation.component_weights.trend * 100}%
                </span>
                <p className="text-[11px] text-slate-500">Recent performance velocity</p>
              </div>
            </div>
          </div>

          {/* Risk Band Definitions */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Prototype Risk Display Bands</h2>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Score Band Range</th>
                    <th className="py-2.5 px-4 font-semibold">Display Label</th>
                    <th className="py-2.5 px-4 font-semibold">Recommended Pedagogical Action</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Cohort Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {explanation.band_definitions.map((b: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">{b.range}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{b.band}</td>
                      <td className="py-3 px-4 text-slate-600">{b.action}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-teal-700">
                        {explanation.band_distribution[b.band] || 0} students
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ethical Safeguards and Bias Reduction Policy */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              <span>Bias Reduction, Ethical Safeguards & Fair Use Guarantees</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {explanation.safeguards_and_limitations.map((sg: string, i: number) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5 shadow-2xs">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{sg}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-start gap-2.5 shadow-2xs">
              <Info className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{explanation.disclaimer}</p>
            </div>
          </div>

          {/* Historical False-Alarm Reviews Table */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-amber-600" />
              <span>False-Alarm Review & Alert Modification Audit Log</span>
            </h2>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Reviewer</th>
                    <th className="py-2.5 px-4 font-semibold">Decision Action</th>
                    <th className="py-2.5 px-4 font-semibold">Justification Reason</th>
                    <th className="py-2.5 px-4 font-semibold">Student Context</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {alertReviews.length > 0 ? (
                    alertReviews.map((rev) => (
                      <tr key={rev.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-semibold text-slate-900">{rev.reviewer_name}</td>
                        <td className="py-3 px-4 font-mono font-bold capitalize text-amber-700">{rev.action}</td>
                        <td className="py-3 px-4 text-slate-700">{rev.reason}</td>
                        <td className="py-3 px-4 text-slate-500">{rev.student_context || 'None provided'}</td>
                        <td className="py-3 px-4 font-mono text-slate-400 text-right">{rev.reviewed_at.substring(0, 10)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-500 font-medium">
                        No manual alert reviews logged yet. Teachers can review and dismiss alerts from student profiles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
