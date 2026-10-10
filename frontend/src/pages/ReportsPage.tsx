import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { AuditLog } from '../types';
import { FileSpreadsheet, Download, ShieldCheck, CheckCircle2, Clock, Activity, FileText } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [summary, setSummary] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([api.getCohortSummary(), api.getAuditLogs(30)])
      .then(([sum, logs]) => {
        setSummary(sum);
        setAuditLogs(logs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadCsv = () => {
    const token = localStorage.getItem('token');
    fetch(api.downloadCohortCsvUrl(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eduplus_cohort_report_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => alert('CSV download failed'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              Institutional Governance
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Compliance & Verification</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-cyan-500" />
            <span>Reports, Analytics & Institutional Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Export authorized cohort risk analytics and inspect the immutable audit log recording every login, faculty decision review, grade override, and recalculation event.
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/25 transition-all shrink-0"
        >
          <Download className="h-4 w-4" />
          <span>Export Cohort CSV</span>
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Cohort</span>
            <div className="mt-2 text-3xl font-black font-mono text-slate-900 dark:text-white">
              {summary.total_students}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">{summary.academic_term}</p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Intervention Efficacy</span>
            <div className="mt-2 text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {summary.intervention_metrics.efficacy_rate_percentage}%
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Measured post-quiz improvement</p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Interventions Active</span>
            <div className="mt-2 text-3xl font-black font-mono text-cyan-600 dark:text-cyan-400">
              {summary.intervention_metrics.total_created}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {summary.intervention_metrics.improved} improved • {summary.intervention_metrics.pending_followup} pending
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Average Cohort Risk</span>
            <div className="mt-2 text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
              {summary.average_risk_score}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Multi-signal health index</p>
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-cyan-500" />
              <span>Institutional Audit Trail & Activity Log</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Captures actor, role, event action, target record, and immutable change details
            </p>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
            {auditLogs.length} Events Recorded
          </span>
        </div>

        <div className="border border-slate-200/80 dark:border-white/10 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-white/10">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Actor & Role</th>
                  <th className="py-2.5 px-4 font-semibold">Event Action</th>
                  <th className="py-2.5 px-4 font-semibold">Target Entity</th>
                  <th className="py-2.5 px-4 font-semibold">Event Details</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/5 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900 dark:text-white">
                      <div>{log.actor_name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{log.actor_role}</div>
                    </td>
                    <td className="py-3 px-4 text-cyan-600 dark:text-cyan-400 font-bold">{log.action}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-sans">{log.target_type || 'System'}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-sans text-xs max-w-sm truncate">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-right text-[11px]">
                      {log.timestamp.replace('T', ' ').slice(0, 19)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
