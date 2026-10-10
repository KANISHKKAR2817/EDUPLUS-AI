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
        a.download = `edupulse_cohort_report_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => alert('CSV download failed'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-50 via-white to-slate-50 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
              Section 17 & Section 11
            </span>
            <span className="text-xs text-slate-500 font-medium">Institutional Governance & Auditability</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-teal-600" />
            <span>Reports, Analytics & Institutional Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Download authorized cohort risk reports and inspect the real-time immutable audit trail tracking logins, grade approvals, recalculations, and alert modifications.
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all shrink-0"
        >
          <Download className="h-4 w-4" />
          <span>Export Cohort CSV</span>
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled Cohort</span>
            <div className="mt-2 text-3xl font-extrabold font-mono text-slate-900">
              {summary.total_students}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{summary.academic_term}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Intervention Efficacy</span>
            <div className="mt-2 text-3xl font-extrabold font-mono text-emerald-600">
              {summary.intervention_metrics.efficacy_rate_percentage}%
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Measured post-quiz improvement</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interventions Assigned</span>
            <div className="mt-2 text-3xl font-extrabold font-mono text-teal-600">
              {summary.intervention_metrics.total_created}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {summary.intervention_metrics.improved} improved • {summary.intervention_metrics.pending_followup} pending
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Cohort Risk</span>
            <div className="mt-2 text-3xl font-extrabold font-mono text-amber-600">
              {summary.average_risk_score}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Multi-signal health index</p>
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-teal-600" />
              <span>Institutional Audit Trail & Activity Log</span>
            </h2>
            <p className="text-xs text-slate-500">
              Captures actor, role, event action, target record, and change details
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono font-medium">
            {auditLogs.length} Events Recorded
          </span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Actor & Role</th>
                  <th className="py-2.5 px-4 font-semibold">Event Action</th>
                  <th className="py-2.5 px-4 font-semibold">Target Entity</th>
                  <th className="py-2.5 px-4 font-semibold">Event Details</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                      <div>{log.actor_name}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{log.actor_role}</div>
                    </td>
                    <td className="py-3 px-4 text-teal-700 font-bold">{log.action}</td>
                    <td className="py-3 px-4 text-slate-700 font-sans">{log.target_type || 'System'}</td>
                    <td className="py-3 px-4 text-slate-600 font-sans text-xs max-w-sm truncate">
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
