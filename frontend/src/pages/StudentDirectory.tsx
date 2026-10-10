import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { StudentSummary } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { WhyFlaggedModal } from '../components/WhyFlaggedModal';
import { AlertReviewModal } from '../components/AlertReviewModal';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Filter, ArrowUpDown, HelpCircle, ShieldCheck, ArrowRight } from 'lucide-react';

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
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-50 via-white to-slate-50 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
              Cohort Directory
            </span>
            <span className="text-xs text-slate-500 font-medium">Total Enrolled: {students.length} Students</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-teal-600" />
            <span>Student Performance & Risk Directory</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Sort and filter through students to identify potential learning difficulties early and launch personalized support.
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
              placeholder="Search by name, roll number..."
              className="rounded-xl bg-white border border-slate-300 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
            />
          </div>

          <select
            value={bandFilter}
            onChange={(e) => setBandFilter(e.target.value)}
            className="rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
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
            className="rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
          >
            <option value="risk">Sort by Highest Risk</option>
            <option value="attendance">Sort by Lowest Attendance</option>
            <option value="cgpa">Sort by CGPA</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Student Name & Roll</th>
                  <th className="py-3 px-3 font-semibold">Department</th>
                  <th className="py-3 px-3 font-semibold">CGPA</th>
                  <th className="py-3 px-3 font-semibold">Attendance Avg</th>
                  <th className="py-3 px-3 font-semibold">Continuous Marks</th>
                  <th className="py-3 px-3 font-semibold">Assignments</th>
                  <th className="py-3 px-4 font-semibold">Auditable Risk Index</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{s.full_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{s.roll_number}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{s.department}</td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-800">{s.cgpa}</td>
                    <td className="py-3 px-3 font-mono">
                      <span
                        className={
                          s.attendance_avg < 75
                            ? 'text-rose-600 font-semibold'
                            : s.attendance_avg < 85
                            ? 'text-amber-600 font-medium'
                            : 'text-emerald-600 font-medium'
                        }
                      >
                        {s.attendance_avg}%
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 font-medium">{s.assessment_avg}%</td>
                    <td className="py-3 px-3 font-mono text-slate-700 font-medium">
                      {s.assignment_completion_rate}%
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge band={s.risk_band} score={s.overall_risk} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedStudentForWhy(s.id)}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition-colors"
                        >
                          Why?
                        </button>
                        <button
                          onClick={() => setAlertReviewStudent(s)}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => navigate(`/students/${s.id}`)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-2xs"
                        >
                          Drill Down
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedStudentForWhy && (
        <WhyFlaggedModal
          studentId={selectedStudentForWhy}
          isOpen={true}
          onClose={() => setSelectedStudentForWhy(null)}
        />
      )}

      {alertReviewStudent && (
        <AlertReviewModal
          studentId={alertReviewStudent.id}
          studentName={alertReviewStudent.full_name}
          rollNumber={alertReviewStudent.roll_number}
          isOpen={true}
          onClose={() => setAlertReviewStudent(null)}
          onSuccess={loadStudents}
        />
      )}
    </div>
  );
};
