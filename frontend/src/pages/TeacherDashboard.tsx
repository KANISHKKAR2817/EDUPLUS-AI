import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { StudentSummary, Intervention } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { WhyFlaggedModal } from '../components/WhyFlaggedModal';
import { AlertReviewModal } from '../components/AlertReviewModal';
import { DashboardHero } from '../components/DashboardHero';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Activity,
  ArrowRight,
  Search,
  RefreshCw,
  HelpCircle,
  CalendarCheck,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
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
  const highRiskStudents = students.filter(
    (s) => s.risk_band === 'High concern' || s.risk_band === 'Urgent review recommended'
  );
  const flaggedCount = highRiskStudents.length;
  const avgAttendance =
    totalCount > 0 ? (students.reduce((acc, s) => acc + s.attendance_avg, 0) / totalCount).toFixed(1) : '0';
  const avgPerformance =
    totalCount > 0 ? (students.reduce((acc, s) => acc + s.assessment_avg, 0) / totalCount).toFixed(1) : '0';
  const resolvedCount = interventions.filter((i) => i.outcome === 'improved').length;
  const successRate = interventions.length > 0 ? Math.round((resolvedCount / interventions.length) * 100) : 100;

  // Chart data
  const performanceDistribution = [
    { range: '0-40%', count: students.filter((s) => s.assessment_avg < 40).length, fill: '#ef4444' },
    { range: '40-60%', count: students.filter((s) => s.assessment_avg >= 40 && s.assessment_avg < 60).length, fill: '#f59e0b' },
    { range: '60-75%', count: students.filter((s) => s.assessment_avg >= 60 && s.assessment_avg < 75).length, fill: '#3b82f6' },
    { range: '75-100%', count: students.filter((s) => s.assessment_avg >= 75).length, fill: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. 3D Hero Experience Section */}
      <DashboardHero
        totalStudents={totalCount}
        flaggedCount={flaggedCount}
        onExploreInsights={() => {
          const el = document.getElementById('student-cohort-table');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 2. 5 Glassmorphic Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Students */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Total Students</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                {totalCount}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">+4.2%</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Enrolled • CSE Sem 4</p>
          </div>
          {/* Mini Sparkline SVG */}
          <svg className="w-full h-5 mt-2 stroke-blue-500/50 dark:stroke-cyan-400/50 fill-none" viewBox="0 0 100 20">
            <path d="M 0 16 Q 25 10 50 14 T 100 6" strokeWidth="2" />
          </svg>
        </div>

        {/* Card 2: Students at Academic Risk */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Students at Risk</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
                {flaggedCount}
              </span>
              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                ({totalCount > 0 ? Math.round((flaggedCount / totalCount) * 100) : 0}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Requires Intervention</p>
          </div>
          <svg className="w-full h-5 mt-2 stroke-rose-500/60 dark:stroke-rose-400/60 fill-none" viewBox="0 0 100 20">
            <path d="M 0 14 Q 30 18 60 10 T 100 4" strokeWidth="2" />
          </svg>
        </div>

        {/* Card 3: Average Academic Performance */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Avg Performance</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                {avgPerformance}%
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">+1.8%</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Continuous Assessment</p>
          </div>
          <svg className="w-full h-5 mt-2 stroke-purple-500/50 dark:stroke-violet-400/50 fill-none" viewBox="0 0 100 20">
            <path d="M 0 15 Q 35 15 65 8 T 100 7" strokeWidth="2" />
          </svg>
        </div>

        {/* Card 4: Attendance Rate */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Attendance Rate</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                {avgAttendance}%
              </span>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Min: 75%</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Eligibility Benchmark</p>
          </div>
          <svg className="w-full h-5 mt-2 stroke-amber-500/50 dark:stroke-amber-400/50 fill-none" viewBox="0 0 100 20">
            <path d="M 0 12 Q 25 16 50 11 T 100 13" strokeWidth="2" />
          </svg>
        </div>

        {/* Card 5: Intervention Success Rate */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Intervention Efficacy</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {successRate}%
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Verified</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{resolvedCount} Gaps Resolved</p>
          </div>
          <svg className="w-full h-5 mt-2 stroke-emerald-500/60 dark:stroke-emerald-400/60 fill-none" viewBox="0 0 100 20">
            <path d="M 0 18 Q 30 12 60 8 T 100 2" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* 3. Advanced Analytics Workspace: Visualizations & Priority Support Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Performance Distribution Chart */}
        <div className="lg:col-span-7 glass-panel p-5 sm:p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                <span>Continuous Assessment Performance Distribution</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cohort score bands across Unit Tests 1 & 2
              </p>
            </div>
            <button
              onClick={() => navigate('/assessments')}
              className="text-xs text-blue-600 dark:text-cyan-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>View Tests</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="glass-panel p-2.5 rounded-xl text-xs shadow-xl border border-white/20">
                          <span className="font-bold text-slate-800 dark:text-slate-100">{data.range}</span>
                          <span className="block text-slate-500 dark:text-slate-400">{data.count} Students</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {performanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Priority Support Queue */}
        <div className="lg:col-span-5 glass-panel p-5 sm:p-6 rounded-3xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Priority Attention Queue</h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold">
                {flaggedCount} Active Alerts
              </span>
            </div>

            <div className="divide-y divide-slate-200/50 dark:divide-white/5 mt-2">
              {highRiskStudents.slice(0, 3).map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{s.full_name}</span>
                      <span className="text-[10.5px] font-mono text-slate-400">({s.roll_number})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3">
                      <span>Att: <strong className={s.attendance_avg < 75 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>{s.attendance_avg}%</strong></span>
                      <span>Marks: <strong className="text-rose-600 dark:text-rose-400">{s.assessment_avg}%</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setSelectedStudentForWhy(s.id)}
                      className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-cyan-300 text-xs font-semibold transition-colors"
                    >
                      Why?
                    </button>
                    <button
                      onClick={() => setAlertReviewStudent(s)}
                      className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold transition-colors"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => navigate(`/students/${s.id}`)}
                      className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                    >
                      Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400">Targeted support formulated early.</span>
            <button
              onClick={() => navigate('/interventions')}
              className="text-blue-600 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Manage Interventions</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Student Analytics Glass Table */}
      <div id="student-cohort-table" className="glass-panel p-5 sm:p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
              <span>Student Cohort Analytics ({filteredStudents.length} Students)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multidimensional indicators across Attendance, Assessments, and Practical Labs
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student or roll..."
                className="rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 shadow-inner"
              />
            </div>

            {/* Filter by band */}
            <select
              value={bandFilter}
              onChange={(e) => setBandFilter(e.target.value)}
              className="rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400"
            >
              <option value="ALL">All Bands</option>
              <option value="Urgent review recommended">Urgent Review</option>
              <option value="High concern">High Concern</option>
              <option value="Moderate concern">Moderate Concern</option>
              <option value="Low concern">Low Concern</option>
            </select>
          </div>
        </div>

        {/* Responsive Glass Table */}
        <div className="border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/60 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-white/10 font-semibold">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-3">CGPA</th>
                  <th className="py-3 px-3">Attendance</th>
                  <th className="py-3 px-3">Assessments</th>
                  <th className="py-3 px-3">Lab Assignments</th>
                  <th className="py-3 px-4">Risk Intelligence</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{s.full_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{s.roll_number}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-700 dark:text-slate-300">{s.cgpa}</td>
                    <td className="py-3 px-3 font-mono font-bold">
                      <span
                        className={
                          s.attendance_avg < 75
                            ? 'text-rose-600 dark:text-rose-400'
                            : s.attendance_avg < 85
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }
                      >
                        {s.attendance_avg}%
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">{s.assessment_avg}%</td>
                    <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                      {s.assignment_completion_rate}%
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge band={s.risk_band} score={s.overall_risk} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedStudentForWhy(s.id)}
                          className="px-2.5 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-cyan-300 text-xs font-semibold transition-colors"
                        >
                          Why?
                        </button>
                        <button
                          onClick={() => setAlertReviewStudent(s)}
                          className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-semibold transition-colors"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => navigate(`/students/${s.id}`)}
                          className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 text-white text-xs font-semibold transition-colors shadow-2xs"
                        >
                          Profile
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
