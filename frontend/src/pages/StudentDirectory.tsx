import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { StudentSummary } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { WhyFlaggedModal } from '../components/WhyFlaggedModal';
import { AlertReviewModal } from '../components/AlertReviewModal';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Filter, ArrowUpDown, HelpCircle, ShieldCheck, ArrowRight, Activity, TrendingUp } from 'lucide-react';

export const StudentDirectory: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [bandFilter, setBandFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'risk' | 'attendance' | 'cgpa'>('risk');

  // Modals
  const [selectedStudentForWhy, setSelectedStudentForWhy] = useState<number | null>(null);
  const [alertReviewStudent, setAlertReviewStudent] = useState<StudentSummary | null>(null);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await api.getStudents();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filtered = students
    .filter((s) => {
      const matchesSearch =
        s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.roll_number.toLowerCase().includes(search.toLowerCase()) ||
        s.department.toLowerCase().includes(search.toLowerCase());
      const matchesBand = bandFilter === 'ALL' || s.risk_band === bandFilter;
      return matchesSearch && matchesBand;
    })
    .sort((a, b) => {
      if (sortBy === 'risk') return b.overall_risk - a.overall_risk;
      if (sortBy === 'attendance') return a.attendance_avg - b.attendance_avg;
      if (sortBy === 'cgpa') return b.cgpa - a.cgpa;
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              Cohort Intelligence Directory
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Enrolled: {students.length} Students</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-cyan-500" />
            <span>Student Performance & Risk Directory</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Continuously evaluate all students across attendance, internal assessments, assignment completion, and grade velocity.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, roll..."
              className="rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-2xs"
            />
          </div>

          <select
            value={bandFilter}
            onChange={(e) => setBandFilter(e.target.value)}
            className="rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-cyan-500 shadow-2xs"
          >
            <option value="ALL">All Risk Bands</option>
            <option value="Urgent review recommended">Urgent Review</option>
            <option value="High concern">High Concern</option>
            <option value="Moderate concern">Moderate Concern</option>
            <option value="Low concern">Low Concern</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-cyan-500 shadow-2xs"
          >
            <option value="risk">Sort by Risk Index (Highest First)</option>
            <option value="attendance">Sort by Attendance (Lowest First)</option>
            <option value="cgpa">Sort by CGPA (Highest First)</option>
          </select>
        </div>
      </div>

      {/* Glassmorphic Students Table */}
      <div className="glass-panel border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-white/10">
              <tr>
                <th className="py-3 px-4 font-bold">Student Identity</th>
                <th className="py-3 px-4 font-bold">Dept & Year</th>
                <th className="py-3 px-4 font-bold">Attendance</th>
                <th className="py-3 px-4 font-bold">CGPA</th>
                <th className="py-3 px-4 font-bold">Risk Assessment</th>
                <th className="py-3 px-4 font-bold">Primary Risk Factor</th>
                <th className="py-3 px-4 text-right font-bold">Intervention Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors group"
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                      {s.full_name}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{s.roll_number}</div>
                  </td>

                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    <div>{s.department}</div>
                    <div className="text-[11px] text-slate-400">Semester {s.semester}</div>
                  </td>

                  <td className="py-3 px-4 font-mono">
                    <span
                      className={`font-bold ${
                        s.attendance_avg < 75
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {s.attendance_avg}%
                    </span>
                    {s.attendance_avg < 75 && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-sans">Below 75% req</span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {s.cgpa}
                  </td>

                  <td className="py-3 px-4">
                    <RiskBadge band={s.risk_band} score={s.overall_risk} size="sm" />
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {s.flagged_concepts_count > 0
                        ? `${s.flagged_concepts_count} foundational concept gap(s)`
                        : s.attendance_avg < 75
                        ? 'Low class attendance rate'
                        : 'Consistent engagement across signals'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedStudentForWhy(s.id)}
                        title="Explain Why Flagged"
                        className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-colors"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => setAlertReviewStudent(s)}
                        title="Safeguard Review"
                        className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 transition-colors"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => navigate(`/students/${s.id}`)}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-[11px] flex items-center gap-1 shadow-xs transition-all"
                      >
                        <span>Profile</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explanatory Modals */}
      {selectedStudentForWhy !== null && (
        <WhyFlaggedModal
          studentId={selectedStudentForWhy}
          isOpen={true}
          onClose={() => setSelectedStudentForWhy(null)}
        />
      )}

      {alertReviewStudent !== null && (
        <AlertReviewModal
          studentId={alertReviewStudent.id}
          studentName={alertReviewStudent.full_name}
          rollNumber={alertReviewStudent.roll_number}
          isOpen={true}
          onClose={() => setAlertReviewStudent(null)}
          onSuccess={() => loadStudents()}
        />
      )}
    </div>
  );
};
