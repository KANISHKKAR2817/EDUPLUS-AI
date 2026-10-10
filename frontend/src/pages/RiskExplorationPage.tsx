import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { HelpCircle, ShieldCheck, CheckCircle, Info, Scale, AlertOctagon, RotateCcw, Cpu, Layers } from 'lucide-react';

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
      <div className="p-6 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-lg">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            Governance & Transparency Engine
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Auditable Explainability</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Scale className="h-6 w-6 text-cyan-500" />
          <span>Global Risk Intelligence Model & Institutional Safeguards</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          EDUPLUS AI enforces open, auditable multi-signal early intervention models. We reject opaque black-box scoring to guarantee every student flag is backed by concrete attendance, assessment, and engagement metrics.
        </p>
      </div>

      {explanation && (
        <div className="space-y-6">
          {/* Scoring Formula Card */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-md space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-500" />
              <span>Configured Multi-Signal Formula</span>
            </h2>
            <div className="p-4 rounded-xl glass-card border border-cyan-500/30 font-mono text-sm text-cyan-700 dark:text-cyan-300 font-semibold shadow-xs">
              {explanation.formula_string}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-4 rounded-xl glass-card border border-slate-200/80 dark:border-white/10 space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Attendance Concern</span>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white block">
                  {explanation.component_weights.attendance * 100}%
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">75% institutional threshold</p>
              </div>

              <div className="p-4 rounded-xl glass-card border border-slate-200/80 dark:border-white/10 space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Assessment Concern</span>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white block">
                  {explanation.component_weights.assessment * 100}%
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Continuous test score averages</p>
              </div>

              <div className="p-4 rounded-xl glass-card border border-slate-200/80 dark:border-white/10 space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Assignment Concern</span>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white block">
                  {explanation.component_weights.assignment * 100}%
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Missing tasks & late submissions</p>
              </div>

              <div className="p-4 rounded-xl glass-card border border-slate-200/80 dark:border-white/10 space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Trend Trajectory</span>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white block">
                  {explanation.component_weights.trend * 100}%
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Recent performance velocity</p>
              </div>
            </div>
          </div>

          {/* Risk Band Definitions */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-md space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-violet-500" />
              <span>Risk Band Definitions & Cohort Proportions</span>
            </h2>
            <div className="border border-slate-200/80 dark:border-white/10 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-white/10">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Score Band Range</th>
                    <th className="py-2.5 px-4 font-semibold">Display Label</th>
                    <th className="py-2.5 px-4 font-semibold">Recommended Pedagogical Action</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Cohort Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-white/5 bg-white/40 dark:bg-black/20">
                  {explanation.band_definitions.map((b: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">{b.range}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{b.band}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{b.action}</td>
                      <td className="py-3 px-4 font-mono font-bold text-cyan-600 dark:text-cyan-400 text-right">
                        {explanation.band_distribution[b.band] || 0} students
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Institutional Safeguards */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-md space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Institutional Safeguards & Ethical Protections</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {explanation.safeguards_and_limitations.map((item: string, i: number) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl glass-card border border-slate-200/80 dark:border-white/10 flex items-start gap-2.5 text-slate-700 dark:text-slate-300"
                >
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent False-Alarm & Review Audit Log */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-md space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-cyan-500" />
                <span>Audited Faculty Review History (Human-in-the-Loop)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All decisions to dismiss, adjust, or confirm flags are recorded with professional justifications.
              </p>
            </div>

            {alertReviews.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No alert overrides logged yet.</p>
            ) : (
              <div className="space-y-2.5">
                {alertReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl glass-card border border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          Student #{rev.student_id}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                          {rev.action}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          Score: {rev.original_score}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 italic">“{rev.reason}”</p>
                      {rev.student_context && (
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                          Student context: {rev.student_context}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-[11px] text-slate-400">
                      <div>Reviewer: {rev.reviewer_name || 'Faculty Member'}</div>
                      <div>{rev.reviewed_at.substring(0, 10)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
