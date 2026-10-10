import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { KnowledgeGraphView } from '../components/KnowledgeGraphView';
import { KnowledgeGraphData, Course, StudentSummary } from '../types';
import { Network, RefreshCw, GitBranch } from 'lucide-react';

export const KnowledgeGraphPage: React.FC = () => {
  const [graphData, setGraphData] = useState<KnowledgeGraphData>({ nodes: [], edges: [] });
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | undefined>(undefined);
  const [selectedStudent, setSelectedStudent] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  const loadGraph = async () => {
    setLoading(true);
    try {
      const data = await api.getKnowledgeGraph({
        course_id: selectedCourse,
        student_id: selectedStudent,
      });
      setGraphData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getCourses().then(setCourses).catch(console.error);
    api.getStudents().then(setStudents).catch(console.error);
  }, []);

  useEffect(() => {
    loadGraph();
  }, [selectedCourse, selectedStudent]);

  return (
    <div className="space-y-4">
      {/* Clean Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
              Prerequisite & Concept Map
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Network className="h-5 w-5 text-teal-600" />
            <span>Academic Knowledge Graph</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize prerequisite concept dependencies and pinpoint root-cause learning breakdowns.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Course filter */}
          <select
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(e.target.value ? parseInt(e.target.value) : undefined)}
            className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-teal-600 shadow-2xs"
          >
            <option value="">All Courses (CS201 & CS202)</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.title}
              </option>
            ))}
          </select>

          {/* Student filter */}
          <select
            value={selectedStudent || ''}
            onChange={(e) => setSelectedStudent(e.target.value ? parseInt(e.target.value) : undefined)}
            className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-teal-600 max-w-[200px] shadow-2xs"
          >
            <option value="">Flagged Students Focus</option>
            {students.slice(0, 10).map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.roll_number})
              </option>
            ))}
          </select>

          <button
            onClick={loadGraph}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs transition-colors"
            title="Refresh graph"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Interactive Visual Graph Component */}
      <KnowledgeGraphView nodes={graphData.nodes} edges={graphData.edges} />
    </div>
  );
};
