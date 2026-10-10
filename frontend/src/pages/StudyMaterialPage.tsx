import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { LearningMaterial, Course } from '../types';
import { BookOpen, Upload, FileText, CheckCircle, HelpCircle, Layers, Sparkles } from 'lucide-react';

export const StudyMaterialPage: React.FC = () => {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);

  // Upload Form
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState<number>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Flashcard flip state
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [mats, crs] = await Promise.all([api.getMaterials(), api.getCourses()]);
      setMaterials(mats);
      setCourses(crs);
      if (mats.length > 0 && !selectedMaterialId) {
        setSelectedMaterialId(mats[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('course_id', courseId.toString());
    formData.append('file', selectedFile);

    try {
      await api.uploadMaterial(formData);
      setTitle('');
      setSelectedFile(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  const toggleCard = (idx: number) => {
    setFlippedCards((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-50 via-white to-slate-50 border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
            Section 14 Engine
          </span>
          <span className="text-xs text-slate-500 font-medium">PDF, DOCX & TXT Text Extraction & Analysis</span>
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-teal-600" />
          <span>Study-Material Analyzer & Flashcards</span>
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Upload course notes and lecture slides. EduPulse automatically extracts core concepts, beginner-friendly summaries, interactive flashcards, and practice quiz questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Materials List & Upload Form */}
        <div className="space-y-4">
          {/* Upload Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Upload className="h-4 w-4 text-teal-600" />
              <span>Upload New Study Document</span>
            </h3>

            <form onSubmit={handleUpload} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chapter 4: Array Tracing Notes"
                  className="w-full rounded-xl bg-white border border-slate-300 p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Target Course</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(parseInt(e.target.value))}
                  className="w-full rounded-xl bg-white border border-slate-300 p-2.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}: {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">File (PDF, DOCX, TXT)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-slate-600 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-slate-200 file:bg-slate-100 file:text-teal-800 file:font-semibold hover:file:bg-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
              >
                {uploading ? 'Analyzing Document Content...' : 'Upload & Analyze Document'}
              </button>
            </form>
          </div>

          {/* Existing Materials List */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Analyzed Course Materials ({materials.length})
            </span>
            {materials.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMaterialId(m.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all space-y-1 shadow-2xs ${
                  selectedMaterialId === m.id
                    ? 'bg-teal-50/70 border-teal-500 ring-1 ring-teal-500/30'
                    : 'bg-white border-slate-200 hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-semibold text-teal-700">{m.course_code || 'CS201'}</span>
                  <span className="uppercase text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {m.file_type}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate">{m.title}</h4>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-0.5 font-medium">
                  <span>{m.flashcards?.length || 0} Flashcards</span>
                  <span>•</span>
                  <span>{m.practice_questions?.length || 0} Practice Qs</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Selected Material Detail with Summary & Flashcards */}
        <div className="lg:col-span-2 space-y-4">
          {selectedMaterial ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
              <div>
                <span className="text-xs font-mono font-semibold text-teal-700">{selectedMaterial.course_code}</span>
                <h2 className="text-lg font-bold text-slate-900">{selectedMaterial.title}</h2>
              </div>

              {/* AI Extracted Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                  <span>Synthesized Concept Summary</span>
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">{selectedMaterial.summary}</p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {selectedMaterial.concepts?.map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-mono font-semibold"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interactive Flashcards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-teal-600" />
                    <span>Interactive Concept Flashcards ({selectedMaterial.flashcards?.length || 0})</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Click card to reveal answer</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedMaterial.flashcards?.map((card, idx) => {
                    const isFlipped = flippedCards[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleCard(idx)}
                        className={`p-5 rounded-xl border cursor-pointer min-h-[120px] transition-all flex flex-col justify-between shadow-2xs ${
                          isFlipped
                            ? 'bg-teal-50 border-teal-300 text-teal-900 ring-1 ring-teal-200'
                            : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                          {isFlipped ? 'Key Explanation' : 'Concept Prompt'}
                        </span>
                        <p className="text-xs font-medium my-2 leading-relaxed">
                          {isFlipped ? card.back : card.front}
                        </p>
                        <span className="text-[10px] text-teal-700 font-semibold text-right">
                          {isFlipped ? 'Click to flip back' : 'Click to reveal'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Practice Questions */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Practice Questions ({selectedMaterial.practice_questions?.length || 0})</span>
                </span>

                <div className="space-y-3">
                  {selectedMaterial.practice_questions?.map((pq, qIdx) => (
                    <div key={qIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 shadow-2xs">
                      <p className="font-semibold text-slate-900">{qIdx + 1}. {pq.question}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {pq.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-lg border font-mono text-[11px] ${
                              opt === pq.answer
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
