import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { StudentSummary, Intervention } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { WhyFlaggedModal } from '../components/WhyFlaggedModal';
import { AlertReviewModal } from '../components/AlertReviewModal';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  ArrowRight,
  Search,
  RefreshCw,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [bandFilter, setBandFilter] = useState<string>('ALL');

  // Modals state
  const [selectedStudentForWhy, setSelectedStudentForWhy] = useState<number | null>(null);
  const [alertReviewStudent, setAlertReviewStudent] = useState<StudentSummary | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsData, intvData] = await Promise.all([
        api.getStudents(),
        api.getInterventions(),
      ]);
      setStudents(studentsData);
      setInterventions(intvData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(search.toLowerCase());
    const matchesBand = bandFilter === 'ALL' || s.risk_band === bandFilter;
    return matchesSearch && matchesBand;
  });

  // Calculate cohort metrics
  const totalCount = students.length;
  const flaggedCount = students.filter((s) => s.risk_band === 'High concern' || s.risk_band === 'Urgent review recommended').length;
  const avgRisk = totalCount > 0 ? (students.reduce((acc, s) => acc + s.overall_risk, 0) / totalCount).toFixed(1) : '0';

  // Distribution for chart
  const bandCounts = [
    { name: 'Low concern', count: students.filter((s) => s.risk_band === 'Low concern').length, color: '#10b981' },
    { name: 'Moderate concern', count: students.filter((s) => s.risk_band === 'Moderate concern').length, color: '#f59e0b' },
    { name: 'High concern', count: students.filter((s) => s.risk_band === 'High concern').length, color: '#f97316' },
    { name: 'Urgent review', count: students.filter((s) => s.risk_band === 'Urgent review recommended').length, color: '#e11d48' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Tamil Slogan & Hackathon Status */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Continuous Assessment Cycle • Spring 2026
            </span>
            <span className="text-xs text-slate-500 font-medium">Anna University Regulation Framework</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Faculty Academic Health & Early Intervention Dashboard
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Multi-signal monitoring across Attendance (25%), Assessments (35%), Assignments (20%), and Trend (20%).
            Detect learning gaps early before semester examinations or arrears occur.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors shrink-0 shadow-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-teal-600 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Cohort Data</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Enrolled Cohort</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900">{totalCount}</span>
            <span className="text-xs text-emerald-600 font-semibold">100% Sufficient Data</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across 4 core engineering courses</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Flagged For Review</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-rose-600">{flaggedCount}</span>
            <span className="text-xs text-rose-700 font-semibold">
              ({totalCount > 0 ? Math.round((flaggedCount / totalCount) * 100) : 0}% of cohort)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Scores ≥ 60 (High or Urgent Concern)</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Cohort Average Risk</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-amber-600">{avgRisk}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Moderate overall cohort stability</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Intervention Efficacy</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-teal-700">
              {interventions.filter((i) => i.outcome === 'improved').length} / {interventions.length || 1}
            </span>
            <span className="text-xs text-teal-700 font-semibold">Verified Improved</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Measured via follow-up post-assessments</p>
        </div>
      </div>

      {/* Cohort Risk Distribution Chart + Flagged Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Bands Distribution Chart */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Cohort Distribution Across Auditable Concern Bands
              </h2>
              <p className="text-xs text-slate-500">
                Categorized by Rule #01 Multi-Signal Formula
              </p>
            </div>
            <button
              onClick={() => navigate('/risk-model')}
              className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
            >
              <span>Inspect Scoring Rules</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bandCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {bandCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demo Highlight Card: Arun Kumar Case Study */}
        <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                Hackathon Demo Scenario
              </span>
              <RiskBadge band="Urgent review recommended" size="sm" />
            </div>

            <h3 className="text-base font-bold text-slate-900">Student Spotlight: Arun Kumar</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Roll: 22CS101 • CSE Sem 4</p>

            <div className="mt-4 p-3 rounded-xl bg-white border border-amber-200/80 text-xs text-slate-700 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Attendance:</span>
                <span className="font-mono text-amber-700 font-bold">68.0% (Declining)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Java Arrays UT1:</span>
                <span className="font-mono text-rose-600 font-bold">0% (3/3 incorrect)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Lab Assignments:</span>
                <span className="font-mono text-amber-700 font-bold">1 Missed, 1 Late</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 mt-3 leading-relaxed">
              Arun demonstrates concept gap in Java Arrays memory indexing. Targeted intervention has been formulated.
            </p>
          </div>

          <div className="pt-4 border-t border-amber-200 flex items-center gap-2 mt-4">
            <button
              onClick={() => setSelectedStudentForWhy(1)}
              className="flex-1 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Why Flagged?</span>
            </button>
            <button
              onClick={() => navigate('/students/1')}
              className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-teal-600/20"
            >
              <span>Drill Down</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filterable Student Cohort Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Assigned Student Cohort ({filteredStudents.length} Students)
            </h2>
            <p className="text-xs text-slate-500">
              Inspect multi-signal indicators and trigger targeted support actions
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or roll..."
                className="rounded-xl bg-slate-50 border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>

            {/* Filter by band */}
            <select
              value={bandFilter}
              onChange={(e) => setBandFilter(e.target.value)}
              className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-teal-600"
            >
              <option value="ALL">All Bands</option>
              <option value="Urgent review recommended">Urgent Review</option>
              <option value="High concern">High Concern</option>
              <option value="Moderate concern">Moderate Concern</option>
              <option value="Low concern">Low Concern</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Student Name & Roll</th>
                  <th className="py-3 px-3">CGPA</th>
                  <th className="py-3 px-3">Attendance</th>
                  <th className="py-3 px-3">Assessment Avg</th>
                  <th className="py-3 px-3">Assignments</th>
                  <th className="py-3 px-4">Risk Index</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{s.full_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{s.roll_number}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-700">{s.cgpa}</td>
                    <td className="py-3 px-3 font-mono font-bold">
                      <span
                        className={
                          s.attendance_avg < 75
                            ? 'text-rose-600'
                            : s.attendance_avg < 85
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }
                      >
                        {s.attendance_avg}%
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">{s.assessment_avg}%</td>
                    <td className="py-3 px-3 font-mono text-slate-700">
                      {s.assignment_completion_rate}%
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge band={s.risk_band} score={s.overall_risk} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedStudentForWhy(s.id)}
                          title="Explain Why Flagged"
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-teal-700 text-xs font-semibold transition-colors"
                        >
                          Why?
                        </button>
                        <button
                          onClick={() => setAlertReviewStudent(s)}
                          title="Review / Dismiss Alert"
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => navigate(`/students/${s.id}`)}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-colors"
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
          onSuccess={loadData}
        />
      )}
    </div>
  );
};
