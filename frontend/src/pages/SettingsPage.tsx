import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Settings as SettingsIcon, RotateCcw, Upload, Download, CheckCircle, AlertTriangle, ShieldCheck, Database, Server, RefreshCw } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [resetting, setResetting] = useState<boolean>(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  // CSV Import State
  const [importCategory, setImportCategory] = useState<string>('attendance');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<any | null>(null);

  const loadStats = () => {
    api.getSystemStats().then(setStats).catch(console.error);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to reset the database? This will restore pristine synthetic demo records.')) {
      return;
    }
    setResetting(true);
    try {
      const res = await api.resetDemoData();
      setResetMsg(res.message);
      loadStats();
      setTimeout(() => setResetMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to reset demo data');
    } finally {
      setResetting(false);
    }
  };

  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    setImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:8000/api/import-export/upload-csv?category=${importCategory}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Import failed');
      setImportResult(data);
      setCsvFile(null);
      loadStats();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-lg">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            System Operations & Configuration
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Administration Hub</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-cyan-500" />
          <span>System Administration, Batch Ingestion & Dataset Control</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Monitor operational cluster statistics, batch import institutional student attendance and grades, or restore the baseline synthetic evaluation dataset.
        </p>
      </div>

      {/* Operational Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-xs text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Total Users</span>
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white block mt-1">{stats.total_users}</span>
          </div>
          <div className="p-4 rounded-xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-xs text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Students</span>
            <span className="text-2xl font-black font-mono text-cyan-600 dark:text-cyan-400 block mt-1">{stats.total_students}</span>
          </div>
          <div className="p-4 rounded-xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-xs text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Courses</span>
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white block mt-1">{stats.total_courses}</span>
          </div>
          <div className="p-4 rounded-xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-xs text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Concepts</span>
            <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 block mt-1">{stats.total_concepts}</span>
          </div>
          <div className="p-4 rounded-xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-xs text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Attempts</span>
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white block mt-1">{stats.total_attempts}</span>
          </div>
          <div className="p-4 rounded-xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-xs text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Audit Logs</span>
            <span className="text-2xl font-black font-mono text-violet-600 dark:text-violet-400 block mt-1">{stats.total_audit_logs}</span>
          </div>
        </div>
      )}

      {/* Reset Demo Data & CSV Import Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reset Dataset Card */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-md space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Reset Demo Dataset to Initial Clean State
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Restores 35 synthetic students, 4 courses, mapped questions, and Arun Kumar’s initial gap
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Use this during your hackathon presentation or evaluation tests if you wish to wipe test modifications and re-run the complete demonstration journey from Step 1.
          </p>

          {resetMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 font-medium">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{resetMsg}</span>
            </div>
          )}

          <button
            onClick={handleResetData}
            disabled={resetting}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RotateCcw className={`h-4 w-4 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Re-seeding Synthetic Database...' : 'Reset & Reload Demo Cohort'}</span>
          </button>
        </div>

        {/* CSV Import Card */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-md space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Batch CSV Data Ingestion
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Validate and ingest student records or attendance files safely
              </p>
            </div>
          </div>

          <form onSubmit={handleCsvImport} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Import Category</label>
              <select
                value={importCategory}
                onChange={(e) => setImportCategory(e.target.value)}
                className="w-full rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-cyan-500 shadow-2xs"
              >
                <option value="attendance" className="text-black dark:text-white dark:bg-slate-900">Course Attendance Records</option>
                <option value="students" className="text-black dark:text-white dark:bg-slate-900">New Student Profiles</option>
                <option value="marks" className="text-black dark:text-white dark:bg-slate-900">Assessment Marks</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">CSV File</label>
              <input
                type="file"
                required
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="w-full text-slate-600 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border file:border-slate-200 dark:file:border-white/10 file:bg-slate-100 dark:file:bg-white/10 file:text-cyan-600 dark:file:text-cyan-400 file:font-semibold hover:file:bg-slate-200"
              />
            </div>

            {importResult && (
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-800 dark:text-cyan-200 text-xs font-medium">
                Successfully processed {importResult.rows_processed} rows ({importResult.records_imported} imported).
              </div>
            )}

            <button
              type="submit"
              disabled={importing}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/25 transition-all disabled:opacity-50"
            >
              {importing ? 'Validating & Importing...' : 'Validate and Import CSV'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
