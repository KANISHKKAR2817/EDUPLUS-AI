import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { KnowledgeGraphView } from '../components/KnowledgeGraphView';
import { KnowledgeGraphData, Course, StudentSummary } from '../types';
import { Network, Filter, RefreshCw, Info, Sparkles } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-50 via-white to-slate-50 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
              Rule #02 Engine
            </span>
            <span className="text-xs text-slate-500 font-medium">Traversable Relational Schema Graph</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Network className="h-6 w-6 text-teal-600" />
            <span>Queryable Academic Knowledge Graph</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Real academic entity relationships: Student → Enrolled In → Course → Contains → Concept → Assessed By → Assessment → Tests → Question → Targeted By → Intervention.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Course filter */}
          <select
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(e.target.value ? parseInt(e.target.value) : undefined)}
            className="rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
          >
            <option value="">All Courses</option>
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
            className="rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 max-w-[180px] shadow-2xs"
          >
            <option value="">All Students</option>
            {students.slice(0, 15).map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.roll_number})
              </option>
            ))}
          </select>

          <button
            onClick={loadGraph}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs transition-colors"
            title="Refresh graph"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Traversal Flow Guide Banner */}
      <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-slate-800 flex items-center gap-2 overflow-x-auto shadow-2xs">
        <Sparkles className="h-4 w-4 text-teal-600 shrink-0" />
        <span className="font-bold text-slate-900 shrink-0">Sample Relationship Traversal:</span>
        <span className="font-mono text-slate-700 truncate">
          Student (Arun Kumar) → ENROLLED_IN → Java Programming → CONTAINS → Java Arrays → STRUGGLES_WITH → RECEIVES → Targeted Practice Intervention
        </span>
      </div>

      {/* Interactive Visual Graph Component */}
      <KnowledgeGraphView nodes={graphData.nodes} edges={graphData.edges} />
    </div>
  );
};
