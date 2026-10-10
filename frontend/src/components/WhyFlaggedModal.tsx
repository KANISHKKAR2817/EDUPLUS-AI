import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { RiskBadge } from './RiskBadge';
import { X, AlertTriangle, CheckCircle, Info, HelpCircle, Activity, Sparkles } from 'lucide-react';

interface WhyFlaggedModalProps {
  studentId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const WhyFlaggedModal: React.FC<WhyFlaggedModalProps> = ({ studentId, isOpen, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && studentId) {
      setLoading(true);
      api.getWhyFlagged(studentId)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl shadow-2xl p-6 text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto border border-slate-200/80 dark:border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  AI Diagnostic Breakdown
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Auditable Explanation: Why is this student flagged?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {data ? `${data.full_name} (${data.roll_number})` : 'Loading student factors...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Computing auditable feature contributions...</span>
          </div>
        ) : data ? (
          <div className="py-4 space-y-6">
            {/* Risk Summary Header */}
            <div className="p-4 rounded-xl glass-card flex items-center justify-between border border-slate-200/70 dark:border-white/10">
              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Calculated Risk Index</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-extrabold font-mono text-cyan-600 dark:text-cyan-400">{data.overall_score}</span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
              </div>
              <RiskBadge band={data.band} size="lg" />
            </div>

            {/* Key Drivers */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Observed Evidence Drivers
              </h3>
              <div className="space-y-2">
                {data.key_drivers.map((driver: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-900 dark:text-amber-200"
                  >
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="font-medium">{driver}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Component Contributions Breakdown Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Transparent Factor Breakdown
              </h3>
              <div className="border border-slate-200/80 dark:border-white/10 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-white/10">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Signal Factor</th>
                      <th className="py-2.5 px-3 font-semibold">Recorded Metric</th>
                      <th className="py-2.5 px-3 font-semibold">Concern Score</th>
                      <th className="py-2.5 px-3 font-semibold">Weight</th>
                      <th className="py-2.5 px-3 text-right font-semibold">Contribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-white/5 bg-white/40 dark:bg-black/20">
                    {data.contributing_factors.map((factor: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">{factor.name}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">{factor.raw_metric}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-amber-600 dark:text-amber-400">{factor.concern_score} / 100</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 dark:text-slate-400">{factor.weight * 100}%</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-cyan-600 dark:text-cyan-400 text-right">
                          +{factor.weighted_contribution} pts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Suggested Next Steps */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Recommended Support Actions
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {data.suggested_next_steps.map((step: string, sIdx: number) => (
                  <li key={sIdx} className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Safeguard Disclaimer */}
            <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-[11px] text-cyan-900 dark:text-cyan-200 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{data.disclaimer}</p>
            </div>
          </div>
        ) : null}

        <div className="pt-4 border-t border-slate-200/60 dark:border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
