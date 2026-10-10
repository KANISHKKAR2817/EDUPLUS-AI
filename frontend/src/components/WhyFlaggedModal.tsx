import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { RiskBadge } from './RiskBadge';
import { X, AlertTriangle, CheckCircle, Info, HelpCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Auditable Explanation: Why is this student flagged?
              </h2>
              <p className="text-xs text-slate-500">
                {data ? `${data.full_name} (${data.roll_number})` : 'Loading student factors...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500">Computing auditable feature contributions...</span>
          </div>
        ) : data ? (
          <div className="py-4 space-y-6">
            {/* Risk Summary Header */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500">Calculated Risk Index</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-bold font-mono text-teal-600">{data.overall_score}</span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
              </div>
              <RiskBadge band={data.band} size="lg" />
            </div>

            {/* Key Drivers */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Observed Evidence Drivers
              </h3>
              <div className="space-y-2">
                {data.key_drivers.map((driver: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900"
                  >
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{driver}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Component Contributions Breakdown Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Transparent Factor Breakdown
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Signal Factor</th>
                      <th className="py-2.5 px-3 font-semibold">Recorded Metric</th>
                      <th className="py-2.5 px-3 font-semibold">Concern Score</th>
                      <th className="py-2.5 px-3 font-semibold">Weight</th>
                      <th className="py-2.5 px-3 text-right font-semibold">Contribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {data.contributing_factors.map((factor: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-medium text-slate-900">{factor.name}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{factor.raw_metric}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-amber-600">{factor.concern_score} / 100</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{factor.weight * 100}%</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-teal-700 text-right">
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
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Recommended Support Actions
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {data.suggested_next_steps.map((step: string, sIdx: number) => (
                  <li key={sIdx} className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Safeguard Disclaimer */}
            <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-[11px] text-teal-900 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{data.disclaimer}</p>
            </div>
          </div>
        ) : null}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
