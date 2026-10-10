import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Settings as SettingsIcon, RotateCcw, Upload, Download, CheckCircle, AlertTriangle, ShieldCheck, Database } from 'lucide-react';

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
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-50 via-white to-slate-50 border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
            System Configuration & Management
          </span>
          <span className="text-xs text-slate-500 font-medium">Institutional Settings</span>
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-teal-600" />
          <span>System Administration, CSV Import & Dataset Reset</span>
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Manage system operational parameters, import batch academic records, and reset the synthetic demonstration dataset.
        </p>
      </div>

      {/* Operational Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs">
            <span className="text-slate-500 font-medium">Total Users</span>
            <span className="text-2xl font-bold font-mono text-slate-900 block mt-1">{stats.total_users}</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs">
            <span className="text-slate-500 font-medium">Students</span>
            <span className="text-2xl font-bold font-mono text-teal-700 block mt-1">{stats.total_students}</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs">
            <span className="text-slate-500 font-medium">Courses</span>
            <span className="text-2xl font-bold font-mono text-slate-900 block mt-1">{stats.total_courses}</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs">
            <span className="text-slate-500 font-medium">Concepts</span>
            <span className="text-2xl font-bold font-mono text-emerald-600 block mt-1">{stats.total_concepts}</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs">
            <span className="text-slate-500 font-medium">Question Attempts</span>
            <span className="text-2xl font-bold font-mono text-slate-900 block mt-1">{stats.total_attempts}</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs">
            <span className="text-slate-500 font-medium">Audit Logs</span>
            <span className="text-2xl font-bold font-mono text-indigo-600 block mt-1">{stats.total_audit_logs}</span>
          </div>
        </div>
      )}

      {/* Reset Demo Data & CSV Import Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reset Dataset Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Reset Demo Dataset to Initial Clean State
              </h2>
              <p className="text-xs text-slate-500">
                Restores 35 synthetic students, 4 courses, mapped questions, and Arun Kumar’s initial gap
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Use this during your hackathon presentation or evaluation tests if you wish to wipe test modifications and re-run the complete demonstration journey from Step 1.
          </p>

          {resetMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{resetMsg}</span>
            </div>
          )}

          <button
            onClick={handleResetData}
            disabled={resetting}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RotateCcw className={`h-4 w-4 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Re-seeding Synthetic Database...' : 'Reset & Reload Demo Cohort'}</span>
          </button>
        </div>

        {/* CSV Import Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-200">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Batch CSV Data Import
              </h2>
              <p className="text-xs text-slate-500">
                Validate and ingest student records or attendance files safely
              </p>
            </div>
          </div>

          <form onSubmit={handleCsvImport} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Import Category</label>
              <select
                value={importCategory}
                onChange={(e) => setImportCategory(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-300 p-2.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
              >
                <option value="attendance">Course Attendance Records</option>
                <option value="students">New Student Profiles</option>
                <option value="marks">Assessment Marks</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">CSV File</label>
              <input
                type="file"
                required
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="w-full text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-slate-200 file:bg-slate-100 file:text-teal-800 file:font-semibold hover:file:bg-slate-200"
              />
            </div>

            {importResult && (
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium">
                Successfully processed {importResult.rows_processed} rows ({importResult.records_imported} imported).
              </div>
            )}

            <button
              type="submit"
              disabled={importing}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
            >
              {importing ? 'Validating & Importing...' : 'Validate and Import CSV'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
